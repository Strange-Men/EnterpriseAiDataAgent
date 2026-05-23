"""Mock data seed — populates session_state with demo data."""

import streamlit as st
from frontend.state import append_chat_message, append_agent_log, set_system_status


def seed_mock_data():
    """Seed session_state with mock data for demo purposes."""
    # Skip if already seeded
    if st.session_state.get("_mock_seeded"):
        return

    # ── System status ──
    set_system_status("api", "ok")
    set_system_status("db", "ok")
    set_system_status("rag", "unknown")
    st.session_state.system_status["uptime"] = "0:42:17"
    st.session_state.system_status["version"] = "0.2.0"

    # ── Chat history ──
    append_chat_message("user", "What are the top 5 products by revenue this quarter?")
    append_chat_message(
        "assistant",
        "Based on the uploaded sales data, here are the top 5 products by revenue:\n\n"
        "| Rank | Product | Revenue |\n"
        "|------|---------|---------|\n"
        "| 1 | Widget Pro | $124,500 |\n"
        "| 2 | Gadget X | $98,200 |\n"
        "| 3 | Sensor Kit | $87,100 |\n"
        "| 4 | Module A | $76,400 |\n"
        "| 5 | Adapter V2 | $65,800 |",
    )

    # ── Analysis result ──
    st.session_state.analysis_result = {
        "summary": "Dataset contains 1,247 rows across 8 columns. Revenue column shows normal distribution with mean $45,230.",
        "stats": {
            "total_rows": 1247,
            "columns": 8,
            "null_values": 23,
            "duplicates": 5,
            "memory_mb": 2.1,
        },
        "tables": [
            {
                "name": "Revenue by Category",
                "data": [
                    {"Category": "Electronics", "Revenue": 520000, "Growth": "+12%"},
                    {"Category": "Accessories", "Revenue": 310000, "Growth": "+8%"},
                    {"Category": "Software", "Revenue": 185000, "Growth": "+22%"},
                    {"Category": "Services", "Revenue": 95000, "Growth": "-3%"},
                ],
            },
        ],
    }
    st.session_state.analysis_status = "done"

    # ── Charts ──
    st.session_state.charts = [
        {
            "type": "bar",
            "title": "Revenue by Category",
            "data": [
                {"Category": "Electronics", "Revenue": 520000},
                {"Category": "Accessories", "Revenue": 310000},
                {"Category": "Software", "Revenue": 185000},
                {"Category": "Services", "Revenue": 95000},
            ],
        },
        {
            "type": "line",
            "title": "Monthly Trend",
            "data": [
                {"Month": "Jan", "Revenue": 85000, "Target": 80000},
                {"Month": "Feb", "Revenue": 92000, "Target": 85000},
                {"Month": "Mar", "Revenue": 78000, "Target": 90000},
                {"Month": "Apr", "Revenue": 105000, "Target": 95000},
                {"Month": "May", "Revenue": 112000, "Target": 100000},
            ],
        },
        {
            "type": "pie",
            "title": "Market Share",
            "data": [
                {"Segment": "Enterprise", "Share": 45},
                {"Segment": "SMB", "Share": 30},
                {"Segment": "Startup", "Share": 15},
                {"Segment": "Individual", "Share": 10},
            ],
        },
    ]

    # ── Agent logs ──
    append_agent_log("data", "load_file", "done", "Loaded sales_data.csv (1247 rows, 8 columns)")
    append_agent_log("data", "validate_schema", "done", "All columns validated successfully")
    append_agent_log("data", "compute_stats", "done", "Generated summary statistics for 6 numeric columns")
    append_agent_log("chat", "query_parse", "done", "Parsed intent: top_products_by_revenue")
    append_agent_log("chat", "generate_response", "done", "Generated table response with 5 rows")
    append_agent_log("report", "create_chart", "done", "Created bar chart: Revenue by Category")

    st.session_state._mock_seeded = True
