"""Styles — CSS theme loader."""

import os


def load_theme() -> str:
    """Load the dark tech theme CSS."""
    css_path = os.path.join(os.path.dirname(__file__), "theme.css")
    with open(css_path, "r", encoding="utf-8") as f:
        return f.read()
