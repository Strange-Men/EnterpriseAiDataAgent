"""Claude API Connection Test"""

import os
import sys

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

from dotenv import load_dotenv


def load_config():
    """Load config from .env"""
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    base_url = os.getenv("ANTHROPIC_BASE_URL")
    model = os.getenv("DEFAULT_LLM_MODEL", "mimo-v2-pro")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set, check .env")
        sys.exit(1)
    return api_key, base_url, model


def create_client(api_key, base_url):
    """Create Anthropic client"""
    import anthropic
    kwargs = {"api_key": api_key}
    if base_url:
        kwargs["base_url"] = base_url
    return anthropic.Anthropic(**kwargs)


def test_connection(client, model):
    """Test API connection"""
    response = client.messages.create(
        model=model,
        max_tokens=256,
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
    )
    for block in response.content:
        if hasattr(block, "text"):
            return block.text
    return str(response.content)


def main():
    api_key, base_url, model = load_config()
    client = create_client(api_key, base_url)
    reply = test_connection(client, model)
    print("API连接成功")  # API连接成功
    print(f"Model: {model}")
    print(f"Reply: {reply}")


if __name__ == "__main__":
    main()
