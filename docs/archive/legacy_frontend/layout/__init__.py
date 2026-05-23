"""Workspace layout management.

Provides responsive column ratios and panel state management.
"""

import streamlit as st

# Predefined layout presets
LAYOUT_PRESETS = {
    "default":  [1, 2, 1.5],
    "left_wide": [1.5, 2, 1],
    "right_wide": [1, 2, 2],
    "center_focus": [1, 3, 1],
    "equal": [1, 1, 1],
}


def get_layout_ratios() -> list:
    """Get current layout column ratios."""
    preset = st.session_state.get("workspace_layout", "default")
    return LAYOUT_PRESETS.get(preset, LAYOUT_PRESETS["default"])


def set_layout(preset: str):
    """Set the workspace layout preset."""
    if preset in LAYOUT_PRESETS:
        st.session_state.workspace_layout = preset


def is_panel_collapsed(panel: str) -> bool:
    """Check if a panel is collapsed."""
    panels = st.session_state.get("panel_status", {})
    return panels.get(panel, False)


def toggle_panel(panel: str):
    """Toggle a panel's collapsed state."""
    if "panel_status" not in st.session_state:
        st.session_state.panel_status = {}
    st.session_state.panel_status[panel] = not st.session_state.panel_status.get(panel, False)
