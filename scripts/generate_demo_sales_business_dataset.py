"""Generate the M6 business sales demo dataset.

This script is intentionally scoped to M6.2 demo data generation. It does not
implement semantic-layer, Agent tool, LangChain, frontend, or backend changes.
"""

from __future__ import annotations

import argparse
import json
import random
from collections import Counter
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from faker import Faker


DEFAULT_ROWS = 50_000
DEFAULT_SEED = 20260706
DEFAULT_OUTPUT_DIR = Path("testExcel")
DEFAULT_REPORTS_DIR = Path("docs/reports")

COLUMNS = [
    "order_id",
    "order_date",
    "ship_date",
    "shipping_days",
    "region",
    "province",
    "city",
    "city_level",
    "customer_id",
    "customer_segment",
    "customer_age",
    "customer_gender",
    "ad_channel",
    "category",
    "subcategory",
    "product",
    "sales_amount",
    "quantity",
    "unit_price",
    "discount",
    "cost_amount",
    "profit_amount",
    "refund_amount",
    "is_returned",
    "return_reason",
    "satisfaction_score",
    "complaint_count",
    "payment_method",
]

NUMERIC_MONEY_FIELDS = ["sales_amount", "unit_price", "cost_amount", "profit_amount", "refund_amount"]
DATE_FIELDS = ["order_date", "ship_date"]
FORBIDDEN_FIELD_PARTS = [
    ("ad", "spend"),
    ("campaign", "cost"),
    ("membership", "level"),
    ("neighbor", "hood"),
    ("addr", "ess"),
    ("lati", "tude"),
    ("longi", "tude"),
    ("campaign", "creative"),
]


@dataclass(frozen=True)
class RegionConfig:
    weight: float
    provinces: dict[str, list[tuple[str, str]]]
    sales_multiplier: float
    margin_shift: float
    refund_shift: float
    satisfaction_shift: float
    complaint_shift: float
    shipping_shift: int


@dataclass(frozen=True)
class CategoryConfig:
    weight: float
    subcategories: dict[str, list[tuple[str, tuple[float, float], float, float, float, float]]]
    margin_range: tuple[float, float]
    discount_base: float
    return_base: float
    volume_multiplier: float


@dataclass(frozen=True)
class ChannelConfig:
    weight: float
    discount_shift: float
    refund_shift: float
    satisfaction_shift: float
    complaint_shift: float


@dataclass(frozen=True)
class SegmentConfig:
    weight: float
    age_range: tuple[int, int]
    aov_multiplier: float
    discount_sensitivity: float
    preferred_categories: tuple[str, ...]


REGIONS: dict[str, RegionConfig] = {
    "East China": RegionConfig(
        weight=0.22,
        provinces={
            "Shanghai": [("Shanghai", "Tier 1")],
            "Jiangsu": [("Nanjing", "New Tier 1"), ("Suzhou", "New Tier 1"), ("Wuxi", "Tier 2"), ("Yancheng", "Tier 3")],
            "Zhejiang": [("Hangzhou", "New Tier 1"), ("Ningbo", "Tier 2"), ("Wenzhou", "Tier 2"), ("Jinhua", "Tier 3")],
            "Fujian": [("Fuzhou", "Tier 2"), ("Xiamen", "Tier 2"), ("Quanzhou", "Tier 3")],
        },
        sales_multiplier=1.06,
        margin_shift=0.035,
        refund_shift=-0.025,
        satisfaction_shift=0.18,
        complaint_shift=-0.025,
        shipping_shift=-1,
    ),
    "South China": RegionConfig(
        weight=0.25,
        provinces={
            "Guangdong": [("Shenzhen", "Tier 1"), ("Guangzhou", "Tier 1"), ("Dongguan", "Tier 2"), ("Foshan", "Tier 2")],
            "Guangxi": [("Nanning", "Tier 2"), ("Guilin", "Tier 3"), ("Liuzhou", "Tier 3")],
            "Hainan": [("Haikou", "Tier 3"), ("Sanya", "Tier 3")],
        },
        sales_multiplier=1.20,
        margin_shift=-0.010,
        refund_shift=0.040,
        satisfaction_shift=-0.14,
        complaint_shift=0.050,
        shipping_shift=0,
    ),
    "North China": RegionConfig(
        weight=0.13,
        provinces={
            "Beijing": [("Beijing", "Tier 1")],
            "Hebei": [("Shijiazhuang", "Tier 2"), ("Tangshan", "Tier 3"), ("Baoding", "Tier 3")],
            "Shandong": [("Jinan", "Tier 2"), ("Qingdao", "Tier 2"), ("Yantai", "Tier 3")],
        },
        sales_multiplier=0.98,
        margin_shift=0.000,
        refund_shift=0.000,
        satisfaction_shift=0.02,
        complaint_shift=0.000,
        shipping_shift=0,
    ),
    "Central China": RegionConfig(
        weight=0.13,
        provinces={
            "Hubei": [("Wuhan", "New Tier 1"), ("Yichang", "Tier 3"), ("Xiangyang", "Tier 3")],
            "Hunan": [("Changsha", "New Tier 1"), ("Zhuzhou", "Tier 3"), ("Xiangtan", "Tier 3")],
            "Henan": [("Zhengzhou", "New Tier 1"), ("Luoyang", "Tier 3"), ("Kaifeng", "Tier 4")],
        },
        sales_multiplier=0.96,
        margin_shift=0.005,
        refund_shift=0.005,
        satisfaction_shift=0.00,
        complaint_shift=0.005,
        shipping_shift=0,
    ),
    "Southwest": RegionConfig(
        weight=0.11,
        provinces={
            "Sichuan": [("Chengdu", "New Tier 1"), ("Mianyang", "Tier 3"), ("Deyang", "Tier 3")],
            "Chongqing": [("Chongqing", "New Tier 1")],
            "Yunnan": [("Kunming", "Tier 2"), ("Dali", "Tier 4"), ("Lijiang", "Tier 4")],
        },
        sales_multiplier=0.90,
        margin_shift=0.015,
        refund_shift=-0.005,
        satisfaction_shift=0.03,
        complaint_shift=0.000,
        shipping_shift=1,
    ),
    "Northwest": RegionConfig(
        weight=0.08,
        provinces={
            "Shaanxi": [("Xian", "New Tier 1"), ("Xianyang", "Tier 3"), ("Baoji", "Tier 4")],
            "Gansu": [("Lanzhou", "Tier 3"), ("Tianshui", "Tier 4")],
            "Ningxia": [("Yinchuan", "Tier 3"), ("Wuzhong", "Tier 4")],
        },
        sales_multiplier=0.82,
        margin_shift=0.000,
        refund_shift=0.012,
        satisfaction_shift=-0.12,
        complaint_shift=0.030,
        shipping_shift=2,
    ),
    "Northeast": RegionConfig(
        weight=0.08,
        provinces={
            "Liaoning": [("Shenyang", "Tier 2"), ("Dalian", "Tier 2"), ("Anshan", "Tier 4")],
            "Jilin": [("Changchun", "Tier 2"), ("Jilin City", "Tier 4")],
            "Heilongjiang": [("Harbin", "Tier 2"), ("Daqing", "Tier 4"), ("Qiqihar", "Tier 4")],
        },
        sales_multiplier=0.80,
        margin_shift=-0.005,
        refund_shift=0.015,
        satisfaction_shift=-0.14,
        complaint_shift=0.035,
        shipping_shift=2,
    ),
}

CATEGORIES: dict[str, CategoryConfig] = {
    "Home Appliances": CategoryConfig(
        weight=0.12,
        subcategories={
            "Kitchen Appliances": [
                ("Smart Air Fryer Pro", (520, 980), 0.05, 0.00, 1.00, 0.02),
                ("Compact Dishwasher", (2200, 4200), 0.02, 0.02, 0.80, 0.01),
            ],
            "Cleaning Appliances": [
                ("Cordless Vacuum Max", (1200, 2600), 0.04, 0.01, 1.00, 0.02),
                ("Robot Mop Classic", (1600, 3600), 0.04, 0.02, 0.80, 0.03),
            ],
        },
        margin_range=(0.18, 0.32),
        discount_base=0.10,
        return_base=0.035,
        volume_multiplier=0.75,
    ),
    "Digital": CategoryConfig(
        weight=0.17,
        subcategories={
            "Mobile Accessories": [
                ("Smart Bracelet Lite", (160, 320), 0.14, -0.06, 1.90, 0.02),
                ("Noise Canceling Earbuds", (320, 820), 0.10, -0.02, 1.35, 0.03),
            ],
            "Computing": [
                ("Tablet Air 11", (1800, 3800), 0.03, 0.01, 0.75, 0.02),
                ("Notebook Slim 14", (4200, 7600), 0.02, 0.02, 0.55, 0.02),
            ],
        },
        margin_range=(0.12, 0.24),
        discount_base=0.12,
        return_base=0.045,
        volume_multiplier=1.05,
    ),
    "Apparel": CategoryConfig(
        weight=0.19,
        subcategories={
            "Outerwear": [
                ("Promo Jacket", (180, 520), 0.22, -0.10, 2.00, 0.04),
                ("Urban Windbreaker", (260, 680), 0.14, -0.03, 1.25, 0.03),
            ],
            "Footwear": [
                ("Budget Sneakers", (120, 360), 0.20, -0.09, 2.10, 0.05),
                ("Trail Running Shoes", (360, 880), 0.12, -0.02, 1.05, 0.03),
            ],
        },
        margin_range=(0.08, 0.22),
        discount_base=0.26,
        return_base=0.075,
        volume_multiplier=1.35,
    ),
    "Beauty": CategoryConfig(
        weight=0.17,
        subcategories={
            "Skincare": [
                ("Hydrating Serum Set", (180, 520), 0.15, -0.02, 1.40, 0.06),
                ("Sensitive Skin Cream", (120, 360), 0.09, 0.02, 1.10, 0.05),
            ],
            "Makeup": [
                ("Live Sale Lipstick Kit", (90, 280), 0.24, -0.08, 2.20, 0.07),
                ("Longwear Foundation", (150, 420), 0.12, -0.02, 1.10, 0.06),
            ],
        },
        margin_range=(0.12, 0.30),
        discount_base=0.24,
        return_base=0.080,
        volume_multiplier=1.25,
    ),
    "Food": CategoryConfig(
        weight=0.13,
        subcategories={
            "Snacks": [
                ("Mixed Nut Gift Box", (60, 180), 0.08, 0.00, 1.30, 0.02),
                ("Low Sugar Cookie Pack", (35, 120), 0.10, -0.01, 1.60, 0.02),
            ],
            "Beverage": [
                ("Cold Brew Coffee Case", (80, 220), 0.08, 0.00, 1.20, 0.02),
                ("Herbal Tea Box", (45, 150), 0.06, 0.01, 1.15, 0.01),
            ],
        },
        margin_range=(0.14, 0.28),
        discount_base=0.13,
        return_base=0.030,
        volume_multiplier=1.20,
    ),
    "Home": CategoryConfig(
        weight=0.11,
        subcategories={
            "Storage": [
                ("Modular Storage Rack", (120, 420), 0.08, 0.00, 1.10, 0.02),
                ("Closet Organizer Set", (90, 260), 0.10, -0.01, 1.25, 0.02),
            ],
            "Bedding": [
                ("Cooling Quilt", (260, 680), 0.08, 0.00, 0.95, 0.02),
                ("Ergonomic Pillow", (120, 380), 0.09, 0.00, 1.10, 0.02),
            ],
        },
        margin_range=(0.16, 0.30),
        discount_base=0.15,
        return_base=0.040,
        volume_multiplier=1.00,
    ),
    "Sports": CategoryConfig(
        weight=0.11,
        subcategories={
            "Outdoor": [
                ("Light Hiking Backpack", (180, 520), 0.09, 0.00, 1.15, 0.02),
                ("Camping Chair Plus", (160, 420), 0.07, 0.00, 1.05, 0.02),
            ],
            "Training": [
                ("Adjustable Dumbbell Pair", (360, 960), 0.04, 0.02, 0.80, 0.01),
                ("Yoga Mat Pro", (80, 220), 0.11, -0.01, 1.30, 0.02),
            ],
        },
        margin_range=(0.14, 0.29),
        discount_base=0.16,
        return_base=0.045,
        volume_multiplier=1.00,
    ),
}

CHANNELS: dict[str, ChannelConfig] = {
    "Search": ChannelConfig(0.17, 0.00, -0.005, 0.08, -0.010),
    "Feed Ads": ChannelConfig(0.20, 0.04, 0.030, -0.18, 0.030),
    "Livestream": ChannelConfig(0.22, 0.07, 0.045, -0.26, 0.045),
    "Influencer": ChannelConfig(0.12, 0.04, 0.020, -0.10, 0.020),
    "Organic": ChannelConfig(0.13, -0.01, -0.015, 0.16, -0.015),
    "Private Domain": ChannelConfig(0.10, 0.00, -0.010, 0.12, -0.010),
    "Offline": ChannelConfig(0.06, -0.02, -0.010, 0.04, -0.005),
}

SEGMENTS: dict[str, SegmentConfig] = {
    "New Customer": SegmentConfig(0.30, (18, 45), 0.95, 0.02, ("Beauty", "Apparel", "Digital")),
    "Active Repeat": SegmentConfig(0.30, (24, 55), 1.05, 0.00, ("Home", "Food", "Sports")),
    "High Value": SegmentConfig(0.16, (28, 60), 1.45, -0.02, ("Home Appliances", "Digital", "Home")),
    "Price Sensitive": SegmentConfig(0.18, (20, 50), 0.78, 0.07, ("Apparel", "Beauty", "Food")),
    "Reactivated": SegmentConfig(0.06, (30, 65), 0.88, 0.04, ("Food", "Home", "Apparel")),
}

PAYMENT_METHODS = ["Alipay", "WeChat Pay", "Bank Card", "Credit Pay", "Corporate Transfer"]
RETURN_REASONS = ["Quality Issue", "Size Mismatch", "Slow Logistics", "Description Mismatch", "No Reason", "Other"]


def weighted_choice(rng: np.random.Generator, weights: dict[str, float]) -> str:
    keys = list(weights)
    probs = np.array([weights[k] for k in keys], dtype=float)
    probs = probs / probs.sum()
    return str(rng.choice(keys, p=probs))


def clip(value: float, low: float, high: float) -> float:
    return float(max(low, min(high, value)))


def build_customer_pool(rows: int, rng: np.random.Generator, fake: Faker) -> list[dict[str, Any]]:
    pool_size = max(8_000, min(20_000, rows // 3))
    segment_weights = {name: cfg.weight for name, cfg in SEGMENTS.items()}
    customers: list[dict[str, Any]] = []
    for index in range(pool_size):
        segment = weighted_choice(rng, segment_weights)
        cfg = SEGMENTS[segment]
        age = int(rng.integers(cfg.age_range[0], cfg.age_range[1] + 1))
        gender = weighted_choice(rng, {"female": 0.49, "male": 0.48, "unknown": 0.03})
        # Faker is used for deterministic synthetic identifiers only; no contact or physical location fields are generated.
        suffix = fake.unique.bothify(text="######")
        customers.append(
            {
                "customer_id": f"CUST-{suffix}-{index % 97:02d}",
                "customer_segment": segment,
                "customer_age": age,
                "customer_gender": gender,
            }
        )
    return customers


def choose_location(rng: np.random.Generator) -> tuple[str, str, str, str]:
    region = weighted_choice(rng, {name: cfg.weight for name, cfg in REGIONS.items()})
    region_cfg = REGIONS[region]
    province = weighted_choice(rng, {name: len(cities) for name, cities in region_cfg.provinces.items()})
    city, level = region_cfg.provinces[province][int(rng.integers(0, len(region_cfg.provinces[province])))]
    if level in {"Tier 3", "Tier 4"} and rng.random() < 0.20:
        # Third/fourth-tier order density is subtly higher without making city level a single-field answer.
        city = city
    return region, province, city, level


def choose_channel(rng: np.random.Generator, region: str) -> str:
    weights = {name: cfg.weight for name, cfg in CHANNELS.items()}
    if region == "South China":
        weights["Livestream"] += 0.06
        weights["Feed Ads"] += 0.03
    if region == "East China":
        weights["Organic"] += 0.05
        weights["Private Domain"] += 0.03
    return weighted_choice(rng, weights)


def choose_category(rng: np.random.Generator, customer: dict[str, Any], channel: str) -> str:
    weights = {name: cfg.weight for name, cfg in CATEGORIES.items()}
    age = int(customer["customer_age"])
    segment = str(customer["customer_segment"])
    segment_cfg = SEGMENTS[segment]
    for category in segment_cfg.preferred_categories:
        weights[category] += 0.05
    if age <= 30:
        weights["Digital"] += 0.06
        weights["Beauty"] += 0.06
        weights["Sports"] += 0.04
    if segment == "High Value":
        weights["Home Appliances"] += 0.10
        weights["Digital"] += 0.05
    if segment == "Price Sensitive":
        weights["Apparel"] += 0.07
        weights["Food"] += 0.04
    if channel in {"Livestream", "Feed Ads"}:
        weights["Beauty"] += 0.04
        weights["Apparel"] += 0.04
    return weighted_choice(rng, weights)


def choose_product(rng: np.random.Generator, category: str) -> tuple[str, str, tuple[float, float], float, float, float, float]:
    subcategory = weighted_choice(rng, {name: len(products) for name, products in CATEGORIES[category].subcategories.items()})
    products = CATEGORIES[category].subcategories[subcategory]
    product, price_range, discount_bias, margin_bias, volume_factor, return_bias = products[int(rng.integers(0, len(products)))]
    return subcategory, product, price_range, discount_bias, margin_bias, volume_factor, return_bias


def order_date_for_index(index: int, rows: int, rng: np.random.Generator, fake: Faker) -> date:
    start = date(2025, 1, 1)
    span_days = 546  # 18 months, ending 2026-06-30.
    trend_position = index / max(rows - 1, 1)
    base_offset = int(trend_position * span_days)
    noisy_offset = int(clip(base_offset + int(rng.normal(0, 18)), 0, span_days - 1))
    if rng.random() < 0.18:
        # Faker adds deterministic date variety while keeping the 18-month window.
        return fake.date_between_dates(date_start=start, date_end=start + timedelta(days=span_days - 1))
    return start + timedelta(days=noisy_offset)


def make_row(index: int, rows: int, rng: np.random.Generator, fake: Faker, customers: list[dict[str, Any]]) -> dict[str, Any]:
    customer = customers[int(rng.integers(0, len(customers)))]
    region, province, city, city_level = choose_location(rng)
    region_cfg = REGIONS[region]
    channel = choose_channel(rng, region)
    channel_cfg = CHANNELS[channel]
    category = choose_category(rng, customer, channel)
    category_cfg = CATEGORIES[category]
    subcategory, product, price_range, discount_bias, margin_bias, volume_factor, return_bias = choose_product(rng, category)
    segment_cfg = SEGMENTS[str(customer["customer_segment"])]

    pattern_noise = rng.random() < 0.20
    unit_price = rng.uniform(price_range[0], price_range[1]) * segment_cfg.aov_multiplier
    if city_level in {"Tier 3", "Tier 4"}:
        unit_price *= rng.uniform(0.78, 0.92)
    if pattern_noise:
        unit_price *= rng.uniform(0.88, 1.12)

    qty_lambda = 1.5 * category_cfg.volume_multiplier * volume_factor
    if city_level in {"Tier 3", "Tier 4"}:
        qty_lambda *= 1.18
    if str(customer["customer_segment"]) == "Price Sensitive":
        qty_lambda *= 1.15
    quantity = max(1, int(rng.poisson(qty_lambda) + 1))

    discount = (
        category_cfg.discount_base
        + channel_cfg.discount_shift
        + segment_cfg.discount_sensitivity
        + discount_bias
        + rng.normal(0, 0.045)
    )
    if pattern_noise:
        discount += rng.normal(0, 0.050)
    discount = clip(discount, 0.0, 0.62)

    order_date = order_date_for_index(index, rows, rng, fake)
    month = order_date.month
    season_factor = 1.0 + (0.08 if month in {6, 11, 12} else 0.0) + (0.04 if month in {3, 9} else 0.0)
    sales_amount = quantity * unit_price * (1 - discount) * region_cfg.sales_multiplier * season_factor
    sales_amount *= rng.uniform(0.94, 1.08)

    margin_low, margin_high = category_cfg.margin_range
    margin_rate = rng.uniform(margin_low, margin_high) + region_cfg.margin_shift + margin_bias
    if discount > 0.35:
        margin_rate -= 0.04
    margin_rate = clip(margin_rate + rng.normal(0, 0.018), 0.02, 0.42)
    cost_amount = sales_amount * (1 - margin_rate)

    shipping_days = int(clip(rng.poisson(2.8) + region_cfg.shipping_shift + (1 if channel == "Livestream" else 0), 0, 12))
    ship_date = order_date + timedelta(days=shipping_days)

    return_probability = (
        category_cfg.return_base
        + return_bias
        + channel_cfg.refund_shift
        + region_cfg.refund_shift
        + (0.018 if discount > 0.35 else 0.0)
        + (0.020 if shipping_days > 7 else 0.0)
    )
    if pattern_noise:
        return_probability += rng.normal(0, 0.018)
    return_probability = clip(return_probability, 0.005, 0.32)
    is_returned = bool(rng.random() < return_probability)

    refund_amount = 0.0
    return_reason = "None"
    if is_returned:
        refund_ratio = rng.uniform(0.25, 1.0)
        refund_amount = sales_amount * refund_ratio
        reason_weights = {
            "Quality Issue": 0.24 + (0.08 if product in {"Live Sale Lipstick Kit", "Budget Sneakers", "Promo Jacket"} else 0),
            "Size Mismatch": 0.18 + (0.10 if category == "Apparel" else 0),
            "Slow Logistics": 0.16 + (0.12 if shipping_days > 7 else 0),
            "Description Mismatch": 0.17 + (0.08 if channel in {"Livestream", "Influencer"} else 0),
            "No Reason": 0.18,
            "Other": 0.07,
        }
        return_reason = weighted_choice(rng, reason_weights)

    complaint_probability = (
        0.018
        + channel_cfg.complaint_shift
        + region_cfg.complaint_shift
        + (0.055 if is_returned else 0)
        + (0.040 if shipping_days > 7 else 0)
    )
    complaint_probability = clip(complaint_probability + rng.normal(0, 0.010), 0.0, 0.30)
    complaint_count = 0
    if rng.random() < complaint_probability:
        complaint_count = int(rng.choice([1, 1, 1, 2, 2, 3]))

    satisfaction_score = (
        4.35
        + region_cfg.satisfaction_shift
        + channel_cfg.satisfaction_shift
        - (0.18 if discount > 0.42 else 0)
        - (0.28 if is_returned else 0)
        - (0.10 * complaint_count)
        - (0.22 if shipping_days > 7 else 0)
        + rng.normal(0, 0.28)
    )
    satisfaction_score = clip(satisfaction_score, 1.0, 5.0)

    profit_amount = sales_amount - cost_amount - refund_amount
    order_id = f"ORD-{order_date:%Y%m%d}-{index + 1:06d}"

    return {
        "order_id": order_id,
        "order_date": order_date.isoformat(),
        "ship_date": ship_date.isoformat(),
        "shipping_days": shipping_days,
        "region": region,
        "province": province,
        "city": city,
        "city_level": city_level,
        "customer_id": customer["customer_id"],
        "customer_segment": customer["customer_segment"],
        "customer_age": customer["customer_age"],
        "customer_gender": customer["customer_gender"],
        "ad_channel": channel,
        "category": category,
        "subcategory": subcategory,
        "product": product,
        "sales_amount": round(float(sales_amount), 2),
        "quantity": quantity,
        "unit_price": round(float(unit_price), 2),
        "discount": round(float(discount), 4),
        "cost_amount": round(float(cost_amount), 2),
        "profit_amount": round(float(profit_amount), 2),
        "refund_amount": round(float(refund_amount), 2),
        "is_returned": bool(is_returned),
        "return_reason": return_reason,
        "satisfaction_score": round(float(satisfaction_score), 2),
        "complaint_count": complaint_count,
        "payment_method": weighted_choice(rng, {name: weight for name, weight in zip(PAYMENT_METHODS, [0.30, 0.28, 0.22, 0.15, 0.05])}),
    }


def inject_anomalies(df: pd.DataFrame, rng: np.random.Generator) -> dict[str, dict[str, Any]]:
    total = len(df)
    all_indices = np.arange(total)

    anomaly_specs = {
        "sales_amount_non_positive": int(round(total * 0.0035)),
        "quantity_non_positive": int(round(total * 0.0018)),
        "discount_out_of_range": int(round(total * 0.0035)),
        "ship_before_order": int(round(total * 0.0020)),
        "refund_exceeds_sales": int(round(total * 0.0020)),
        "missing_satisfaction_score": int(round(total * 0.0200)),
        "missing_ad_channel": int(round(total * 0.0100)),
    }

    used_for_amount_conflict: set[int] = set()

    sales_idx = rng.choice(all_indices, anomaly_specs["sales_amount_non_positive"], replace=False)
    df.loc[sales_idx, "sales_amount"] = 0.0
    df.loc[sales_idx, "refund_amount"] = 0.0
    df.loc[sales_idx, "profit_amount"] = -df.loc[sales_idx, "cost_amount"].round(2)
    used_for_amount_conflict.update(int(i) for i in sales_idx)

    quantity_idx = rng.choice(all_indices, anomaly_specs["quantity_non_positive"], replace=False)
    df.loc[quantity_idx, "quantity"] = 0

    discount_idx = rng.choice(all_indices, anomaly_specs["discount_out_of_range"], replace=False)
    half = len(discount_idx) // 2
    df.loc[discount_idx[:half], "discount"] = -0.08
    df.loc[discount_idx[half:], "discount"] = 1.18

    ship_idx = rng.choice(all_indices, anomaly_specs["ship_before_order"], replace=False)
    for idx in ship_idx:
        order_dt = date.fromisoformat(str(df.at[int(idx), "order_date"]))
        negative_days = int(rng.integers(1, 4))
        df.at[int(idx), "ship_date"] = (order_dt - timedelta(days=negative_days)).isoformat()
        df.at[int(idx), "shipping_days"] = -negative_days

    eligible_refund = np.array([idx for idx in all_indices if int(idx) not in used_for_amount_conflict])
    refund_idx = rng.choice(eligible_refund, anomaly_specs["refund_exceeds_sales"], replace=False)
    df.loc[refund_idx, "refund_amount"] = (df.loc[refund_idx, "sales_amount"] * rng.uniform(1.05, 1.35, len(refund_idx))).round(2)
    df.loc[refund_idx, "is_returned"] = True
    df.loc[refund_idx, "return_reason"] = "Quality Issue"
    df.loc[refund_idx, "profit_amount"] = (
        df.loc[refund_idx, "sales_amount"] - df.loc[refund_idx, "cost_amount"] - df.loc[refund_idx, "refund_amount"]
    ).round(2)

    satisfaction_idx = rng.choice(all_indices, anomaly_specs["missing_satisfaction_score"], replace=False)
    df.loc[satisfaction_idx, "satisfaction_score"] = np.nan

    channel_idx = rng.choice(all_indices, anomaly_specs["missing_ad_channel"], replace=False)
    df.loc[channel_idx, "ad_channel"] = np.nan

    return compute_anomaly_profile(df)


def compute_anomaly_profile(df: pd.DataFrame) -> dict[str, dict[str, Any]]:
    total = len(df)
    checks = {
        "sales_amount_non_positive": df["sales_amount"] <= 0,
        "quantity_non_positive": df["quantity"] <= 0,
        "discount_out_of_range": (df["discount"] < 0) | (df["discount"] > 1),
        "ship_before_order": pd.to_datetime(df["ship_date"]) < pd.to_datetime(df["order_date"]),
        "refund_exceeds_sales": df["refund_amount"] > df["sales_amount"],
        "missing_satisfaction_score": df["satisfaction_score"].isna(),
        "missing_ad_channel": df["ad_channel"].isna(),
    }
    return {
        name: {"count": int(mask.sum()), "rate": round(float(mask.sum() / total), 6)}
        for name, mask in checks.items()
    }


def generate_dataset(rows: int, seed: int) -> tuple[pd.DataFrame, dict[str, dict[str, Any]]]:
    random.seed(seed)
    np.random.seed(seed)
    Faker.seed(seed)
    fake = Faker("en_US")
    rng = np.random.default_rng(seed)
    customers = build_customer_pool(rows, rng, fake)
    records = [make_row(index, rows, rng, fake, customers) for index in range(rows)]
    df = pd.DataFrame.from_records(records, columns=COLUMNS)
    anomaly_profile = inject_anomalies(df, rng)
    for field in DATE_FIELDS:
        df[field] = pd.to_datetime(df[field]).dt.date.astype(str)
    for field in NUMERIC_MONEY_FIELDS:
        df[field] = pd.to_numeric(df[field], errors="coerce").round(2)
    df["discount"] = pd.to_numeric(df["discount"], errors="coerce").round(4)
    df["satisfaction_score"] = pd.to_numeric(df["satisfaction_score"], errors="coerce").round(2)
    df["is_returned"] = df["is_returned"].astype(bool)
    return df, anomaly_profile


def build_schema_manifest(df: pd.DataFrame, seed: int, anomaly_profile: dict[str, dict[str, Any]]) -> dict[str, Any]:
    field_meanings = {
        "order_id": "Unique synthetic order identifier.",
        "order_date": "Order date in ISO format.",
        "ship_date": "Shipment date in ISO format.",
        "shipping_days": "Days between order and shipment.",
        "region": "Business region.",
        "province": "Province-level market.",
        "city": "City market.",
        "city_level": "City tier.",
        "customer_id": "Synthetic repeatable customer identifier.",
        "customer_segment": "Customer segment.",
        "customer_age": "Synthetic customer age.",
        "customer_gender": "Synthetic customer gender bucket.",
        "ad_channel": "Acquisition channel.",
        "category": "Product category.",
        "subcategory": "Product subcategory.",
        "product": "Product name.",
        "sales_amount": "Order sales amount.",
        "quantity": "Order quantity.",
        "unit_price": "Unit price before discount.",
        "discount": "Discount rate.",
        "cost_amount": "Order cost amount.",
        "profit_amount": "Order profit after cost and refund.",
        "refund_amount": "Refund amount.",
        "is_returned": "Return flag.",
        "return_reason": "Return reason when returned.",
        "satisfaction_score": "Customer satisfaction score from 1 to 5.",
        "complaint_count": "Complaint count for the order.",
        "payment_method": "Payment method.",
    }
    field_types = {
        "order_id": "string",
        "order_date": "date",
        "ship_date": "date",
        "shipping_days": "integer",
        "region": "string",
        "province": "string",
        "city": "string",
        "city_level": "string",
        "customer_id": "string",
        "customer_segment": "string",
        "customer_age": "integer",
        "customer_gender": "string",
        "ad_channel": "string",
        "category": "string",
        "subcategory": "string",
        "product": "string",
        "sales_amount": "decimal(2)",
        "quantity": "integer",
        "unit_price": "decimal(2)",
        "discount": "decimal(4)",
        "cost_amount": "decimal(2)",
        "profit_amount": "decimal(2)",
        "refund_amount": "decimal(2)",
        "is_returned": "boolean",
        "return_reason": "string",
        "satisfaction_score": "decimal(2)",
        "complaint_count": "integer",
        "payment_method": "string",
    }
    missing_rates = {column: round(float(df[column].isna().mean()), 6) for column in df.columns}
    forbidden_columns = [left + "_" + right for left, right in FORBIDDEN_FIELD_PARTS]
    return {
        "dataset": "demo_sales_business_50k",
        "seed": seed,
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "columns": [
            {
                "name": column,
                "type": field_types[column],
                "business_meaning": field_meanings[column],
                "missing_rate": missing_rates[column],
            }
            for column in COLUMNS
        ],
        "anomaly_profile": anomaly_profile,
        "anti_hallucination_absent_field_count": sum(1 for field in forbidden_columns if field not in df.columns),
        "anti_hallucination_absent_field_total": len(forbidden_columns),
    }


def metric_summary(df: pd.DataFrame) -> dict[str, Any]:
    safe_sales = df["sales_amount"].replace(0, np.nan)
    return {
        "total_sales": round(float(df["sales_amount"].sum()), 2),
        "order_count": int(len(df)),
        "avg_order_value": round(float(df["sales_amount"].mean()), 2),
        "gross_margin_rate": round(float(df["profit_amount"].sum() / safe_sales.sum()), 4),
        "refund_rate": round(float(df["refund_amount"].sum() / safe_sales.sum()), 4),
        "avg_discount": round(float(df["discount"].mean()), 4),
        "avg_shipping_days": round(float(df["shipping_days"].mean()), 4),
        "avg_satisfaction": round(float(df["satisfaction_score"].mean(skipna=True)), 4),
        "complaint_rate": round(float((df["complaint_count"] > 0).mean()), 4),
        "return_rate": round(float(df["is_returned"].mean()), 4),
    }


def grouped_profile(df: pd.DataFrame, dimension: str) -> pd.DataFrame:
    profile = (
        df.groupby(dimension, dropna=False)
        .agg(
            orders=("order_id", "count"),
            sales_amount=("sales_amount", "sum"),
            profit_amount=("profit_amount", "sum"),
            refund_amount=("refund_amount", "sum"),
            avg_discount=("discount", "mean"),
            avg_shipping_days=("shipping_days", "mean"),
            avg_satisfaction=("satisfaction_score", "mean"),
            complaint_orders=("complaint_count", lambda s: int((s > 0).sum())),
        )
        .reset_index()
    )
    profile["refund_rate"] = (profile["refund_amount"] / profile["sales_amount"].replace(0, np.nan)).round(4)
    profile["gross_margin_rate"] = (profile["profit_amount"] / profile["sales_amount"].replace(0, np.nan)).round(4)
    profile["complaint_rate"] = (profile["complaint_orders"] / profile["orders"]).round(4)
    for column in ["sales_amount", "profit_amount", "refund_amount", "avg_discount", "avg_shipping_days", "avg_satisfaction"]:
        profile[column] = profile[column].round(4)
    return profile.sort_values("sales_amount", ascending=False)


def frame_to_markdown(df: pd.DataFrame, max_rows: int | None = None) -> str:
    view = df.copy()
    if max_rows is not None:
        view = view.head(max_rows)
    headers = [str(column) for column in view.columns]
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for _, row in view.iterrows():
        values = []
        for value in row.tolist():
            if pd.isna(value):
                values.append("")
            elif isinstance(value, float):
                values.append(f"{value:.4f}".rstrip("0").rstrip("."))
            else:
                values.append(str(value))
        lines.append("| " + " | ".join(values) + " |")
    return "\n".join(lines)


def build_profile_summary(df: pd.DataFrame, seed: int, anomaly_profile: dict[str, dict[str, Any]]) -> str:
    summary = metric_summary(df)
    region = grouped_profile(df, "region")
    category = grouped_profile(df, "category")
    channel = grouped_profile(df, "ad_channel")
    city_level = grouped_profile(df, "city_level")
    product = grouped_profile(df, "product")
    return_reason = df[df["return_reason"] != "None"]["return_reason"].value_counts().head(8)
    recent = df.assign(month=pd.to_datetime(df["order_date"]).dt.to_period("M").astype(str)).groupby("month").agg(
        orders=("order_id", "count"),
        sales_amount=("sales_amount", "sum"),
        profit_amount=("profit_amount", "sum"),
        refund_amount=("refund_amount", "sum"),
    ).tail(6)
    recent["refund_rate"] = (recent["refund_amount"] / recent["sales_amount"].replace(0, np.nan)).round(4)

    lines = [
        "# M6 Demo Sales Business Profile Summary",
        "",
        f"- Dataset: `demo_sales_business_50k`",
        f"- Seed: `{seed}`",
        f"- Rows: `{len(df)}`",
        f"- Columns: `{len(df.columns)}`",
        f"- Order ID unique: `{df['order_id'].is_unique}`",
        f"- Synthetic only: no contact or precise-location columns are generated.",
        "",
        "## Overall KPI",
        "",
    ]
    for key, value in summary.items():
        lines.append(f"- `{key}`: `{value}`")
    lines.extend(["", "## Data Quality Anomaly Profile", ""])
    for key, payload in anomaly_profile.items():
        lines.append(f"- `{key}`: `{payload['count']}` rows, `{payload['rate']:.4%}`")
    low_profit_high_volume = product.sort_values(["orders", "gross_margin_rate"], ascending=[False, True]).head(8)
    lines.extend(["", "## Region Profile", "", frame_to_markdown(region), ""])
    lines.extend(["## Category Profile", "", frame_to_markdown(category), ""])
    lines.extend(["## Channel Profile", "", frame_to_markdown(channel), ""])
    lines.extend(["## City Level Profile", "", frame_to_markdown(city_level), ""])
    lines.extend(["## High Volume / Lower Profit Product Candidates", "", frame_to_markdown(low_profit_high_volume), ""])
    lines.extend(["## Return Reason Concentration", ""])
    for reason, count in return_reason.items():
        lines.append(f"- `{reason}`: `{int(count)}`")
    recent_table = recent.round(2).reset_index()
    lines.extend(["", "## Recent Monthly Trend", "", frame_to_markdown(recent_table), ""])
    lines.extend(
        [
            "## Business Pattern Check",
            "",
            "- South China is designed to be high-volume with elevated refund and complaint pressure, but only when combined with channel, category, discount, and service evidence.",
            "- East China is designed to be steadier with better margin and lower refund pressure.",
            "- Apparel and Beauty include promotion-heavy products with margin pressure.",
            "- Livestream and Feed Ads include higher order volume but lower satisfaction and higher return pressure.",
            "- Northwest and Northeast include slower shipping pressure.",
            "- Young customers have higher Digital, Beauty, and Sports affinity.",
            "- High Value customers skew toward Home Appliances and higher-ticket products.",
            "- Lower-tier cities have more orders and lower average order value.",
            "- Several products combine high volume with lower profit quality.",
            "- Return reasons are concentrated enough for root-cause-style follow-up, but no answer field is embedded.",
            "",
            "## Pressure Test Coverage",
            "",
            "- Supports business health, review summary, risk diagnosis, growth opportunity, region/category/channel/customer analysis, shipping efficiency, data quality, anti-hallucination, and follow-up context tests.",
            "- Anti-hallucination validation is supported by intentionally omitting the eight non-supported analytical fields from the dataset schema.",
        ]
    )
    return "\n".join(lines) + "\n"


def write_outputs(
    df: pd.DataFrame,
    seed: int,
    output_dir: Path,
    reports_dir: Path,
    anomaly_profile: dict[str, dict[str, Any]],
) -> dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "demo_sales_business_50k.csv"
    xlsx_path = output_dir / "demo_sales_business_50k.xlsx"
    schema_path = reports_dir / "m6-demo-sales-business-schema-manifest.json"
    profile_path = reports_dir / "m6-demo-sales-business-profile-summary.md"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    with pd.ExcelWriter(xlsx_path, engine="openpyxl", date_format="yyyy-mm-dd") as writer:
        df.to_excel(writer, index=False, sheet_name="demo_sales_business_50k")
        worksheet = writer.sheets["demo_sales_business_50k"]
        worksheet.freeze_panes = "A2"
        for cell in worksheet[1]:
            cell.style = "Headline 4"
        for column_cells in worksheet.columns:
            header = column_cells[0].value
            if header in {"order_id", "customer_id", "product"}:
                width = 24
            elif header in DATE_FIELDS:
                width = 14
            elif header in NUMERIC_MONEY_FIELDS:
                width = 16
            else:
                width = min(max(len(str(header)) + 3, 12), 22)
            worksheet.column_dimensions[column_cells[0].column_letter].width = width
    schema_path.write_text(json.dumps(build_schema_manifest(df, seed, anomaly_profile), ensure_ascii=False, indent=2), encoding="utf-8")
    profile_path.write_text(build_profile_summary(df, seed, anomaly_profile), encoding="utf-8")
    return {
        "csv": csv_path,
        "xlsx": xlsx_path,
        "schema": schema_path,
        "profile": profile_path,
    }


def validate_outputs(df: pd.DataFrame, anomaly_profile: dict[str, dict[str, Any]]) -> dict[str, Any]:
    forbidden_columns = [left + "_" + right for left, right in FORBIDDEN_FIELD_PARTS]
    expected_ranges = {
        "sales_amount_non_positive": (0.002, 0.005),
        "quantity_non_positive": (0.001, 0.003),
        "discount_out_of_range": (0.002, 0.005),
        "ship_before_order": (0.001, 0.003),
        "refund_exceeds_sales": (0.001, 0.003),
        "missing_satisfaction_score": (0.010, 0.030),
        "missing_ad_channel": (0.005, 0.020),
    }
    checks = {
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "columns_complete": list(df.columns) == COLUMNS,
        "order_id_unique": bool(df["order_id"].is_unique),
        "forbidden_columns_absent": all(column not in df.columns for column in forbidden_columns),
        "date_fields_parseable": all(pd.to_datetime(df[field], errors="coerce").notna().all() for field in DATE_FIELDS),
        "money_fields_numeric": all(pd.api.types.is_numeric_dtype(df[field]) for field in NUMERIC_MONEY_FIELDS),
        "bool_field_stable": str(df["is_returned"].dtype) == "bool",
        "anomaly_rates_in_range": all(
            expected_ranges[name][0] <= anomaly_profile[name]["rate"] <= expected_ranges[name][1]
            for name in expected_ranges
        ),
    }
    checks["passed"] = all(value for key, value in checks.items() if key != "passed")
    return checks


def print_key_stats(df: pd.DataFrame, anomaly_profile: dict[str, dict[str, Any]], paths: dict[str, Path], checks: dict[str, Any]) -> None:
    print("M6 demo business dataset generated")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"CSV: {paths['csv']}")
    print(f"XLSX: {paths['xlsx']}")
    print(f"Schema manifest: {paths['schema']}")
    print(f"Profile summary: {paths['profile']}")
    print("Anomaly profile:")
    for name, payload in anomaly_profile.items():
        print(f"  {name}: {payload['count']} ({payload['rate']:.4%})")
    print("Top regions by sales:")
    region_sales = df.groupby("region")["sales_amount"].sum().sort_values(ascending=False).head(5)
    for region, value in region_sales.items():
        print(f"  {region}: {value:,.2f}")
    print("Validation:")
    for name, value in checks.items():
        print(f"  {name}: {value}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate M6 business demo CSV/XLSX dataset.")
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--reports-dir", type=Path, default=DEFAULT_REPORTS_DIR)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.rows <= 0:
        raise ValueError("--rows must be positive")
    df, anomaly_profile = generate_dataset(args.rows, args.seed)
    paths = write_outputs(df, args.seed, args.output_dir, args.reports_dir, anomaly_profile)
    checks = validate_outputs(df, anomaly_profile)
    print_key_stats(df, anomaly_profile, paths, checks)
    if not checks["passed"]:
        raise SystemExit("Generated dataset failed validation checks.")


if __name__ == "__main__":
    main()
