"""Schema Semantic Mapping — 将中文业务词映射到真实数据库字段。

解决 LLM 不认识中文业务术语导致 CANNOT_ANSWER 误判的问题。
"""

from __future__ import annotations

# ── 中文 → 英文字段候选映射 ──────────────────────────────────────

# 每个语义角色对应一组可能的中文关键词和候选字段名
SEMANTIC_FIELD_MAP: dict[str, dict] = {
    "region": {
        "aliases": ["地区", "区域", "客户地区", "销售区域", "片区"],
        "candidates": ["customer_region", "region", "area", "sales_region", "district"],
    },
    "category": {
        "aliases": ["品类", "类别", "商品类别", "产品类别", "分类"],
        "candidates": ["category", "product_category", "item_category"],
    },
    "subcategory": {
        "aliases": ["子品类", "子类别", "二级分类", "细分品类"],
        "candidates": ["subcategory", "sub_category", "sub_category_name"],
    },
    "sales_amount": {
        "aliases": ["销售额", "金额", "营收", "销售收入", "总销售额"],
        "candidates": ["sales_amount", "amount", "revenue", "total_sales", "sales"],
    },
    "quantity": {
        "aliases": ["数量", "件数", "销售数量", "购买数量"],
        "candidates": ["quantity", "qty", "count", "order_quantity"],
    },
    "discount": {
        "aliases": ["折扣", "优惠", "平均折扣", "折扣率"],
        "candidates": ["discount", "discount_rate", "discount_pct"],
    },
    "is_returned": {
        "aliases": ["退货", "是否退货", "退货率", "退货标记"],
        "candidates": ["is_returned", "returned", "return_flag", "is_refund"],
    },
    "order_date": {
        "aliases": ["日期", "下单日期", "年份", "月份", "订单日期", "购买日期"],
        "candidates": ["order_date", "date", "purchase_date", "created_at", "transaction_date"],
    },
    "ship_date": {
        "aliases": ["发货日期", "配送日期", "运输日期"],
        "candidates": ["ship_date", "shipping_date", "delivery_date"],
    },
    "order_id": {
        "aliases": ["订单号", "订单编号", "订单ID"],
        "candidates": ["order_id", "order_no", "order_number", "transaction_id"],
    },
    "customer_id": {
        "aliases": ["客户", "客户ID", "客户编号", "买家"],
        "candidates": ["customer_id", "customer_no", "user_id", "buyer_id"],
    },
    "product_name": {
        "aliases": ["商品名称", "产品名称", "商品名", "品名"],
        "candidates": ["product_name", "item_name", "product", "item"],
    },
    "profit": {
        "aliases": ["利润", "盈利", "毛利"],
        "candidates": ["profit", "margin", "gross_profit", "net_profit"],
    },
}


def build_semantic_aliases(columns: list[str]) -> dict[str, str]:
    """基于实际存在的列，构建中文别名 → 真实字段名的映射。

    Args:
        columns: 实际数据库列名列表。

    Returns:
        dict mapping 中文别名 → 真实字段名。
        只包含实际存在的字段的映射。
    """
    col_set = {c.lower() for c in columns}
    col_lookup = {c.lower(): c for c in columns}  # lowercase → original case

    aliases: dict[str, str] = {}
    for _role, spec in SEMANTIC_FIELD_MAP.items():
        real_col = None
        for candidate in spec["candidates"]:
            if candidate.lower() in col_set:
                real_col = col_lookup[candidate.lower()]
                break
        if real_col:
            for alias in spec["aliases"]:
                aliases[alias] = real_col

    return aliases


def build_semantic_context(columns: list[str]) -> str:
    """构建语义映射上下文文本，注入到 SQL generation prompt。

    输出格式:
        Semantic field mapping (Chinese business term → actual column):
        - 地区/区域/客户地区 → customer_region
        - 品类/类别/商品类别 → category
        ...
    """
    aliases = build_semantic_aliases(columns)
    if not aliases:
        return ""

    # 按真实字段分组
    reverse: dict[str, list[str]] = {}
    for alias, real in aliases.items():
        reverse.setdefault(real, []).append(alias)

    lines = ["Semantic field mapping (Chinese business term → actual column):"]
    for real_col, alias_list in reverse.items():
        alias_str = "/".join(alias_list)
        lines.append(f"  - {alias_str} → {real_col}")

    return "\n".join(lines)


def get_missing_fields(columns: list[str], required_roles: list[str]) -> list[str]:
    """检查哪些语义角色的字段在当前表中不存在。

    Args:
        columns: 实际数据库列名列表。
        required_roles: 需要的语义角色列表 (如 ["region", "category", "sales_amount"])。

    Returns:
        缺失的语义角色列表。
    """
    col_set = {c.lower() for c in columns}
    missing = []
    for role in required_roles:
        spec = SEMANTIC_FIELD_MAP.get(role)
        if not spec:
            missing.append(role)
            continue
        found = any(c.lower() in col_set for c in spec["candidates"])
        if not found:
            missing.append(role)
    return missing


def resolve_field(chinese_term: str, columns: list[str]) -> str | None:
    """将单个中文词解析为真实字段名。

    Args:
        chinese_term: 中文业务词 (如 "地区")。
        columns: 实际数据库列名列表。

    Returns:
        对应的真实字段名，或 None。
    """
    aliases = build_semantic_aliases(columns)
    return aliases.get(chinese_term)
