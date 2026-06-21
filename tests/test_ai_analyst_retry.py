"""Tests for LLM retry logic in ai_analyst."""

import pytest
import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import anthropic
from backend.services.ai_analyst import _call_llm, _call_llm_stream


class TestCallLlmRetry:
    """Test _call_llm retry behavior on transient errors."""

    @patch("backend.services.ai_analyst._get_client")
    def test_success_no_retry(self, mock_get_client):
        """Normal success — no retry needed."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_block = MagicMock(text="SELECT 1", type="text")
        mock_response.content = [mock_block]
        mock_client.messages.create.return_value = mock_response
        mock_get_client.return_value = mock_client

        result = _call_llm("system", "user message")
        assert result == "SELECT 1"
        assert mock_client.messages.create.call_count == 1

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.time.sleep")
    def test_retry_on_rate_limit_then_succeed(self, mock_sleep, mock_get_client):
        """Rate limit error → retry → success."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_block = MagicMock(text="SELECT 1", type="text")
        mock_response.content = [mock_block]

        mock_client.messages.create.side_effect = [
            anthropic.RateLimitError("rate limited", response=MagicMock(status_code=429), body=None),
            mock_response,
        ]
        mock_get_client.return_value = mock_client

        result = _call_llm("system", "user message")
        assert result == "SELECT 1"
        assert mock_client.messages.create.call_count == 2
        mock_sleep.assert_called_once_with(1)  # first retry delay

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.time.sleep")
    def test_retry_on_timeout_then_succeed(self, mock_sleep, mock_get_client):
        """Timeout error → retry → success."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_block = MagicMock(text="OK", type="text")
        mock_response.content = [mock_block]

        mock_client.messages.create.side_effect = [
            anthropic.APITimeoutError(request=MagicMock()),
            mock_response,
        ]
        mock_get_client.return_value = mock_client

        result = _call_llm("system", "msg")
        assert result == "OK"
        assert mock_client.messages.create.call_count == 2

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.time.sleep")
    def test_retry_on_connection_error_then_succeed(self, mock_sleep, mock_get_client):
        """Connection error → retry → success."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_block = MagicMock(text="OK", type="text")
        mock_response.content = [mock_block]

        mock_client.messages.create.side_effect = [
            anthropic.APIConnectionError(request=MagicMock()),
            mock_response,
        ]
        mock_get_client.return_value = mock_client

        result = _call_llm("system", "msg")
        assert result == "OK"

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.time.sleep")
    def test_max_retries_exhausted(self, mock_sleep, mock_get_client):
        """All retries exhausted → raises last error."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = anthropic.RateLimitError(
            "rate limited", response=MagicMock(status_code=429), body=None
        )
        mock_get_client.return_value = mock_client

        with pytest.raises(anthropic.RateLimitError):
            _call_llm("system", "msg")

        # 1 initial + 2 retries = 3 calls
        assert mock_client.messages.create.call_count == 3
        assert mock_sleep.call_count == 2

    @patch("backend.services.ai_analyst._get_client")
    def test_no_retry_on_auth_error(self, mock_get_client):
        """Auth error → no retry, immediate raise."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = anthropic.AuthenticationError(
            "bad key", response=MagicMock(status_code=401), body=None
        )
        mock_get_client.return_value = mock_client

        with pytest.raises(anthropic.AuthenticationError):
            _call_llm("system", "msg")

        # No retry — only 1 call
        assert mock_client.messages.create.call_count == 1

    @patch("backend.services.ai_analyst._get_client")
    def test_no_retry_on_bad_request(self, mock_get_client):
        """Bad request → no retry, immediate raise."""
        mock_client = MagicMock()
        mock_client.messages.create.side_effect = anthropic.BadRequestError(
            "bad request", response=MagicMock(status_code=400), body=None
        )
        mock_get_client.return_value = mock_client

        with pytest.raises(anthropic.BadRequestError):
            _call_llm("system", "msg")

        assert mock_client.messages.create.call_count == 1


class TestCallLlmStreamRetry:
    """Test _call_llm_stream retry behavior."""

    @patch("backend.services.ai_analyst._get_client")
    def test_stream_success(self, mock_get_client):
        """Normal streaming success."""
        mock_client = MagicMock()
        mock_stream_ctx = MagicMock()
        mock_stream_ctx.__enter__ = MagicMock(return_value=mock_stream_ctx)
        mock_stream_ctx.__exit__ = MagicMock(return_value=False)
        mock_stream_ctx.text_stream = iter(["Hello", " ", "World"])
        mock_client.messages.stream.return_value = mock_stream_ctx
        mock_get_client.return_value = mock_client

        chunks = list(_call_llm_stream("system", "msg"))
        assert chunks == ["Hello", " ", "World"]
        assert mock_client.messages.stream.call_count == 1

    @patch("backend.services.ai_analyst._get_client")
    @patch("backend.services.ai_analyst.time.sleep")
    def test_stream_retry_on_connection_error(self, mock_sleep, mock_get_client):
        """Stream connection fails → retry → success."""
        mock_client = MagicMock()

        # First call raises error
        mock_client.messages.stream.side_effect = [
            anthropic.APIConnectionError(request=MagicMock()),
            _mock_stream_ctx(["OK"]),
        ]
        mock_get_client.return_value = mock_client

        chunks = list(_call_llm_stream("system", "msg"))
        assert chunks == ["OK"]
        assert mock_client.messages.stream.call_count == 2


def _mock_stream_ctx(chunks):
    """Helper to create a mock stream context manager."""
    ctx = MagicMock()
    ctx.__enter__ = MagicMock(return_value=ctx)
    ctx.__exit__ = MagicMock(return_value=False)
    ctx.text_stream = iter(chunks)
    return ctx
