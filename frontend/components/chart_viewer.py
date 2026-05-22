"""Chart Viewer Component.

Input:  session_state.charts, session_state.active_chart_index
Output: read-only display (Plotly charts)
"""

import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd


def render():
    """Render the chart display zone."""
    st.markdown('<div class="section-header">Visualizations</div>', unsafe_allow_html=True)

    charts = st.session_state.get("charts", [])

    if not charts:
        _render_placeholder()
        return

    _render_tabs(charts)


def _render_placeholder():
    """Show placeholder with mock chart."""
    st.caption("No charts generated yet. Showing demo chart.")

    # Mock demo chart
    df = px.data.gapminder().query("continent == 'Oceania'")
    fig = px.line(
        df, x="year", y="lifeExp", color="country",
        title="Demo — Life Expectancy (Oceania)",
        template="plotly_dark",
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font_color="#C9D1D9",
        title_font_color="#00D4AA",
    )
    st.plotly_chart(fig, use_container_width=True)


def _render_tabs(charts: list):
    """Render charts in tabs."""
    if len(charts) == 1:
        _render_single_chart(charts[0])
        return

    tab_labels = [c.get("title", f"Chart {i+1}") for i, c in enumerate(charts)]
    tabs = st.tabs(tab_labels)

    for tab, chart in zip(tabs, charts):
        with tab:
            _render_single_chart(chart)


def _render_single_chart(chart: dict):
    """Render a single chart based on its type."""
    chart_type = chart.get("type", "bar")
    data = chart.get("data", [])
    title = chart.get("title", "Chart")
    df = pd.DataFrame(data)

    if df.empty:
        st.caption("No data for this chart.")
        return

    fig = go.Figure()

    if chart_type == "bar":
        for col in df.columns[1:]:
            fig.add_trace(go.Bar(x=df.iloc[:, 0], y=df[col], name=col))
    elif chart_type == "line":
        for col in df.columns[1:]:
            fig.add_trace(go.Scatter(x=df.iloc[:, 0], y=df[col], mode="lines+markers", name=col))
    elif chart_type == "pie":
        fig = px.pie(df, names=df.columns[0], values=df.columns[1], title=title)
    else:
        fig.add_trace(go.Bar(x=df.iloc[:, 0], y=df.iloc[:, 1]))

    fig.update_layout(
        title=title,
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font_color="#C9D1D9",
        title_font_color="#00D4AA",
    )
    st.plotly_chart(fig, use_container_width=True)
