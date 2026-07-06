from pathlib import Path

import pandas as pd

from scripts.generate_demo_sales_business_dataset import (
    COLUMNS,
    compute_anomaly_profile,
    generate_dataset,
    validate_outputs,
    write_outputs,
)


def test_m6_demo_business_dataset_generator_contract(tmp_path: Path) -> None:
    df, anomaly_profile = generate_dataset(rows=1000, seed=20260706)

    assert list(df.columns) == COLUMNS
    assert len(df) == 1000
    assert df["order_id"].is_unique
    assert all(pd.to_datetime(df[field], errors="coerce").notna().all() for field in ["order_date", "ship_date"])
    assert all(pd.api.types.is_numeric_dtype(df[field]) for field in ["sales_amount", "unit_price", "cost_amount", "profit_amount", "refund_amount"])
    assert str(df["is_returned"].dtype) == "bool"

    forbidden_columns = [
        left + "_" + right
        for left, right in [
            ("ad", "spend"),
            ("campaign", "cost"),
            ("membership", "level"),
            ("neighbor", "hood"),
            ("addr", "ess"),
            ("lati", "tude"),
            ("longi", "tude"),
            ("campaign", "creative"),
        ]
    ]
    assert all(column not in df.columns for column in forbidden_columns)
    assert validate_outputs(df, anomaly_profile)["passed"] is True


def test_m6_demo_business_dataset_file_outputs_are_consistent(tmp_path: Path) -> None:
    df, anomaly_profile = generate_dataset(rows=1000, seed=20260706)
    paths = write_outputs(df, 20260706, tmp_path / "data", tmp_path / "reports", anomaly_profile)

    csv_df = pd.read_csv(paths["csv"])
    xlsx_df = pd.read_excel(paths["xlsx"])

    assert csv_df.shape == (1000, len(COLUMNS))
    assert xlsx_df.shape == (1000, len(COLUMNS))
    assert list(csv_df.columns) == COLUMNS
    assert list(xlsx_df.columns) == COLUMNS
    assert csv_df.fillna("__NA__").astype(str).equals(xlsx_df.fillna("__NA__").astype(str))
    assert paths["schema"].exists()
    assert paths["profile"].exists()

    recomputed = compute_anomaly_profile(csv_df)
    assert recomputed["missing_satisfaction_score"]["rate"] == anomaly_profile["missing_satisfaction_score"]["rate"]
    assert recomputed["missing_ad_channel"]["rate"] == anomaly_profile["missing_ad_channel"]["rate"]
