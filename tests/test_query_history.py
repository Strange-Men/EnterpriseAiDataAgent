"""Tests for QueryHistory module."""

import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.query_history import QueryHistory


class TestQueryHistory:
    def test_add_entry(self):
        h = QueryHistory(max_size=10, use_memory=True)
        entry = h.add("SELECT 1", "success", 50, 1)
        assert entry["sql"] == "SELECT 1"
        assert entry["status"] == "success"
        assert entry["runtimeMs"] == 50
        assert entry["rowCount"] == 1

    def test_get_all(self):
        h = QueryHistory(max_size=10, use_memory=True)
        h.add("SELECT 1", "success", 10, 1)
        h.add("SELECT 2", "success", 20, 2)
        all_entries = h.get_all()
        assert len(all_entries) == 2
        # Newest first
        assert all_entries[0]["sql"] == "SELECT 2"

    def test_max_size_ring_buffer(self):
        h = QueryHistory(max_size=3, use_memory=True)
        for i in range(5):
            h.add(f"SELECT {i}", "success", 10, 1)
        all_entries = h.get_all()
        assert len(all_entries) == 3
        # Should keep the last 3
        assert all_entries[0]["sql"] == "SELECT 4"
        assert all_entries[2]["sql"] == "SELECT 2"

    def test_get_all_with_limit(self):
        h = QueryHistory(max_size=10, use_memory=True)
        for i in range(5):
            h.add(f"SELECT {i}", "success", 10, 1)
        limited = h.get_all(limit=2)
        assert len(limited) == 2

    def test_error_entry(self):
        h = QueryHistory(max_size=10, use_memory=True)
        entry = h.add("SELECT bad", "error", 5, 0, "Table not found")
        assert entry["status"] == "error"
        assert entry["error"] == "Table not found"
