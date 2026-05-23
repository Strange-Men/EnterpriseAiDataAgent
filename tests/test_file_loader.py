"""Tests for File Loader module."""

import pytest
import io
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.file_loader import (
    load_file,
    _get_extension,
    _load_csv,
    _load_excel,
    get_file_info,
    FileLoadError,
    SUPPORTED_FORMATS,
)


class MockUploadedFile:
    """Mock for Streamlit/FastAPI UploadedFile-like objects."""

    def __init__(self, name: str, content: bytes):
        self.name = name
        self.content = content
        self.size = len(content)
        self._pos = 0

    def read(self):
        if self._pos > 0:
            return b""
        self._pos = len(self.content)
        return self.content

    def seek(self, pos):
        self._pos = pos


class TestGetExtension:
    def test_csv(self):
        assert _get_extension("data.csv") == ".csv"

    def test_xlsx(self):
        assert _get_extension("report.xlsx") == ".xlsx"

    def test_uppercase(self):
        assert _get_extension("DATA.CSV") == ".csv"

    def test_no_extension(self):
        assert _get_extension("noext") == ""

    def test_multiple_dots(self):
        assert _get_extension("my.data.file.csv") == ".csv"


class TestLoadCsv:
    def test_basic_csv(self):
        content = b"id,name\n1,Alice\n2,Bob"
        df = _load_csv(content, "test.csv")
        assert len(df) == 2
        assert list(df.columns) == ["id", "name"]

    def test_utf8_with_bom(self):
        content = b"\xef\xbb\xbfa,b\n1,2"
        df = _load_csv(content, "test.csv")
        assert len(df) == 1

    def test_gbk_encoding(self):
        content = "id,名称\n1,测试".encode("gbk")
        df = _load_csv(content, "test.csv")
        assert len(df) == 1

    def test_empty_csv(self):
        content = b"id,name\n"
        with pytest.raises(FileLoadError, match="empty"):
            _load_csv(content, "test.csv")

    def test_invalid_encoding(self):
        # Create bytes that are valid latin-1 but produce empty CSV
        # The real test is that non-decodable bytes eventually fail
        # Since latin-1 accepts any byte, we test the empty-result path
        content = b"\xff\xfe"
        # This decodes via latin-1 but produces empty/unparseable content
        # which triggers FileLoadError (empty)
        with pytest.raises(FileLoadError):
            _load_csv(content, "test.csv")


class TestLoadExcel:
    def test_basic_excel(self):
        # Create an Excel file in-memory
        buffer = io.BytesIO()
        df = pd.DataFrame({"col1": [1, 2], "col2": ["a", "b"]})
        df.to_excel(buffer, index=False, engine="openpyxl")
        content = buffer.getvalue()

        result = _load_excel(content, "test.xlsx")
        assert len(result) == 2
        assert list(result.columns) == ["col1", "col2"]

    def test_empty_excel(self):
        buffer = io.BytesIO()
        df = pd.DataFrame()
        df.to_excel(buffer, index=False, engine="openpyxl")
        content = buffer.getvalue()

        with pytest.raises(FileLoadError, match="empty"):
            _load_excel(content, "test.xlsx")


class TestLoadFile:
    def test_load_csv(self):
        file = MockUploadedFile("data.csv", b"id,val\n1,hello\n2,world")
        df = load_file(file)
        assert len(df) == 2

    def test_load_xlsx(self):
        buffer = io.BytesIO()
        pd.DataFrame({"a": [1, 2]}).to_excel(buffer, index=False, engine="openpyxl")
        file = MockUploadedFile("data.xlsx", buffer.getvalue())
        df = load_file(file)
        assert len(df) == 2

    def test_unsupported_format(self):
        file = MockUploadedFile("data.json", b'{"a": 1}')
        with pytest.raises(FileLoadError, match="Unsupported"):
            load_file(file)

    def test_no_extension(self):
        file = MockUploadedFile("noext", b"data")
        with pytest.raises(FileLoadError, match="Unsupported"):
            load_file(file)


class TestGetFileInfo:
    def test_csv_info(self):
        file = MockUploadedFile("data.csv", b"a,b\n1,2")
        info = get_file_info(file)
        assert info["name"] == "data.csv"
        assert info["extension"] == ".csv"
        assert info["supported"] is True
        assert info["size_bytes"] > 0

    def test_unsupported_info(self):
        file = MockUploadedFile("doc.pdf", b"pdf content")
        info = get_file_info(file)
        assert info["supported"] is False
        assert info["extension"] == ".pdf"

    def test_no_size_attr(self):
        file = MockUploadedFile("data.csv", b"a,b\n1,2")
        del file.size
        info = get_file_info(file)
        assert info["size_bytes"] == 0


class TestSupportedFormats:
    def test_csv_supported(self):
        assert ".csv" in SUPPORTED_FORMATS

    def test_xlsx_supported(self):
        assert ".xlsx" in SUPPORTED_FORMATS

    def test_xls_supported(self):
        assert ".xls" in SUPPORTED_FORMATS
