"""File Loader Module.

Reads CSV and Excel files from uploaded file objects,
returns pandas DataFrames with validation and error handling.
"""

import io
import pandas as pd


SUPPORTED_FORMATS = {
    ".csv": "csv",
    ".xlsx": "excel",
    ".xls": "excel",
}


class FileLoadError(Exception):
    """Raised when a file cannot be read or parsed."""
    pass


def load_file(uploaded_file) -> pd.DataFrame:
    """Load an uploaded file (Streamlit UploadedFile) into a DataFrame.

    Args:
        uploaded_file: A Streamlit UploadedFile-like object with .name, .read()

    Returns:
        pd.DataFrame

    Raises:
        FileLoadError: If the file format is unsupported or reading fails.
    """
    filename = uploaded_file.name
    ext = _get_extension(filename)
    file_type = SUPPORTED_FORMATS.get(ext)

    if file_type is None:
        raise FileLoadError(
            f"Unsupported file format '{ext}'. "
            f"Supported formats: {', '.join(SUPPORTED_FORMATS.keys())}"
        )

    try:
        # Reset file pointer to beginning
        uploaded_file.seek(0)
        raw_bytes = uploaded_file.read()

        if file_type == "csv":
            return _load_csv(raw_bytes, filename)
        elif file_type == "excel":
            return _load_excel(raw_bytes, filename)
    except FileLoadError:
        raise
    except Exception as e:
        raise FileLoadError(f"Failed to read '{filename}': {e}")


def _get_extension(filename: str) -> str:
    """Extract file extension in lowercase."""
    if "." in filename:
        return "." + filename.rsplit(".", 1)[-1].lower()
    return ""


def _load_csv(raw_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse CSV bytes into a DataFrame."""
    encodings = ["utf-8", "utf-8-sig", "gbk", "gb2312", "latin-1"]
    for enc in encodings:
        try:
            text = raw_bytes.decode(enc)
            df = pd.read_csv(io.StringIO(text))
            if df.empty:
                raise FileLoadError(f"File '{filename}' is empty.")
            return df
        except UnicodeDecodeError:
            continue
    raise FileLoadError(
        f"Cannot decode '{filename}'. Tried encodings: {', '.join(encodings)}"
    )


def _load_excel(raw_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse Excel bytes into a DataFrame (first sheet only)."""
    try:
        df = pd.read_excel(io.BytesIO(raw_bytes), engine="openpyxl")
        if df.empty:
            raise FileLoadError(f"File '{filename}' is empty.")
        return df
    except FileLoadError:
        raise
    except Exception as e:
        raise FileLoadError(f"Failed to parse Excel file '{filename}': {e}")


def get_file_info(uploaded_file) -> dict:
    """Extract metadata from an uploaded file without fully loading it."""
    return {
        "name": uploaded_file.name,
        "size_bytes": uploaded_file.size if hasattr(uploaded_file, "size") else 0,
        "size_kb": round(uploaded_file.size / 1024, 1) if hasattr(uploaded_file, "size") else 0,
        "extension": _get_extension(uploaded_file.name),
        "supported": _get_extension(uploaded_file.name) in SUPPORTED_FORMATS,
    }
