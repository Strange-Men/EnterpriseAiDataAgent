"""Generate enterprise-grade test datasets for AI Data Agent testing.

Creates 4 Excel files with realistic data including:
- Missing values (5-8%)
- Outliers (2-3%)
- Date / numeric / categorical fields
- 1200+ rows each
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
ROW_COUNT = 1200

# ── Shared lookups ──────────────────────────────────────────────

REGIONS = ["华东", "华南", "华北", "西南", "华中", "东北", "西北"]
REGION_EN = ["East China", "South China", "North China", "Southwest", "Central", "Northeast", "Northwest"]

PRODUCTS = [
    "智能手表 Pro", "无线耳机 Max", "平板电脑 S1", "笔记本电脑 X5",
    "智能音箱", "机械键盘 K9", "4K显示器", "移动硬盘 2TB",
    "路由器 AX6000", "摄像头 C300", "充电宝 20000mAh", "扩展坞 D10",
]

SALESPEOPLE = [
    "张伟", "李娜", "王磊", "赵敏", "刘洋",
    "陈静", "杨帆", "黄丽", "周杰", "吴芳",
    "孙浩", "马琳",
]

CUSTOMER_TYPES = ["企业客户", "个人客户", "政府机构", "教育机构", "中小企业"]

INDUSTRIES = ["科技", "金融", "制造", "零售", "医疗", "教育", "能源", "物流", "餐饮", "房地产"]

PROVINCES = [
    "北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "山东", "福建", "河南",
    "湖南", "安徽", "河北", "辽宁", "重庆", "陕西", "云南", "广西", "黑龙江", "江西",
]

CITIES = {
    "北京": ["朝阳区", "海淀区", "东城区"],
    "上海": ["浦东新区", "徐汇区", "静安区"],
    "广东": ["深圳", "广州", "东莞"],
    "浙江": ["杭州", "宁波", "温州"],
    "江苏": ["南京", "苏州", "无锡"],
    "四川": ["成都", "绵阳", "德阳"],
    "湖北": ["武汉", "宜昌", "襄阳"],
    "山东": ["济南", "青岛", "烟台"],
    "福建": ["福州", "厦门", "泉州"],
    "河南": ["郑州", "洛阳", "开封"],
    "湖南": ["长沙", "株洲", "湘潭"],
    "安徽": ["合肥", "芜湖", "蚌埠"],
    "河北": ["石家庄", "唐山", "保定"],
    "辽宁": ["沈阳", "大连", "鞍山"],
    "重庆": ["渝中区", "江北区", "沙坪坝区"],
    "陕西": ["西安", "咸阳", "宝鸡"],
    "云南": ["昆明", "大理", "丽江"],
    "广西": ["南宁", "桂林", "柳州"],
    "黑龙江": ["哈尔滨", "齐齐哈尔", "大庆"],
    "江西": ["南昌", "赣州", "九江"],
}

WAREHOUSES = ["北京仓", "上海仓", "广州仓", "成都仓", "武汉仓"]

PAYMENT_METHODS = ["银行转账", "支付宝", "微信支付", "信用卡", "现金"]


def _inject_missing(series: pd.Series, pct: float = 0.06) -> pd.Series:
    """Randomly set pct% of values to NaN."""
    mask = np.random.random(len(series)) < pct
    series = series.copy()
    series[mask] = np.nan
    return series


def _inject_outliers(arr: np.ndarray, pct: float = 0.025, factor: float = 8) -> np.ndarray:
    """Inject outliers by multiplying random values by a factor."""
    arr = arr.copy()
    n_outliers = max(1, int(len(arr) * pct))
    indices = np.random.choice(len(arr), n_outliers, replace=False)
    arr[indices] = arr[indices] * factor
    return arr


def _random_dates(start: str, end: str, n: int) -> list:
    """Generate n random dates between start and end."""
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    delta = (end_dt - start_dt).days
    offsets = np.random.randint(0, delta, n)
    return [start_dt + timedelta(days=int(d)) for d in offsets]


# ════════════════════════════════════════════════════════════════
# 1. Sales Data
# ════════════════════════════════════════════════════════════════

def generate_sales_data(n: int = ROW_COUNT) -> pd.DataFrame:
    dates = _random_dates("2024-01-01", "2025-12-31", n)
    regions = np.random.choice(REGIONS, n)
    products = np.random.choice(PRODUCTS, n)
    quantities = np.random.randint(1, 200, n).astype(float)
    unit_prices = np.random.choice([299, 499, 799, 1299, 1999, 2499, 3499, 4999, 6999, 9999], n)
    sales_amount = quantities * unit_prices
    margin_rates = np.random.uniform(0.08, 0.35, n)
    profit = sales_amount * margin_rates
    customer_types = np.random.choice(CUSTOMER_TYPES, n, p=[0.35, 0.25, 0.15, 0.10, 0.15])
    salespeople = np.random.choice(SALESPEOPLE, n)

    # Inject outliers (unusually high sales)
    sales_amount = _inject_outliers(sales_amount)
    profit = _inject_outliers(profit)

    df = pd.DataFrame({
        "日期": dates,
        "地区": regions,
        "产品": products,
        "销量": quantities.astype(int),
        "销售额": np.round(sales_amount, 2),
        "利润": np.round(profit, 2),
        "客户类型": customer_types,
        "销售员": salespeople,
    })

    # Inject missing values
    df["利润"] = _inject_missing(df["利润"], 0.06)
    df["客户类型"] = _inject_missing(df["客户类型"], 0.04)

    return df


# ════════════════════════════════════════════════════════════════
# 2. Customer Data
# ════════════════════════════════════════════════════════════════

def generate_customer_data(n: int = ROW_COUNT) -> pd.DataFrame:
    customer_ids = [f"C{str(i).zfill(6)}" for i in range(1, n + 1)]
    names = [f"客户_{i}" for i in range(1, n + 1)]
    industries = np.random.choice(INDUSTRIES, n)
    provinces = np.random.choice(PROVINCES, n)
    cities = [np.random.choice(CITIES.get(p, [p])) for p in provinces]
    reg_dates = _random_dates("2020-01-01", "2025-12-31", n)
    total_purchases = np.round(np.random.exponential(50000, n), 2)
    total_orders = np.random.randint(1, 200, n).astype(float)
    satisfaction = np.round(np.random.uniform(2.0, 5.0, n), 1)
    is_active = np.random.choice([True, False], n, p=[0.7, 0.3])
    credit_rating = np.random.choice(["AAA", "AA", "A", "B", "C"], n, p=[0.1, 0.2, 0.3, 0.25, 0.15])
    contact_email = [f"user{i}@company{i % 50}.com" for i in range(1, n + 1)]

    # Outliers
    total_purchases = _inject_outliers(total_purchases, 0.02, 15)

    df = pd.DataFrame({
        "客户ID": customer_ids,
        "客户名称": names,
        "行业": industries,
        "省份": provinces,
        "城市": cities,
        "注册日期": reg_dates,
        "累计消费": total_purchases,
        "订单总数": total_orders.astype(int),
        "满意度评分": satisfaction,
        "是否活跃": is_active,
        "信用等级": credit_rating,
        "联系邮箱": contact_email,
    })

    # Missing values
    df["满意度评分"] = _inject_missing(df["满意度评分"], 0.07)
    df["联系邮箱"] = _inject_missing(df["联系邮箱"], 0.05)
    df["行业"] = _inject_missing(df["行业"], 0.03)

    return df


# ════════════════════════════════════════════════════════════════
# 3. Inventory Data
# ════════════════════════════════════════════════════════════════

def generate_inventory_data(n: int = ROW_COUNT) -> pd.DataFrame:
    product_ids = [f"P{str(i).zfill(5)}" for i in range(1, n + 1)]
    products = np.random.choice(PRODUCTS, n)
    warehouses = np.random.choice(WAREHOUSES, n)
    stock_qty = np.random.randint(0, 5000, n).astype(float)
    min_stock = np.random.randint(50, 200, n)
    max_stock = np.random.randint(1000, 6000, n)
    unit_cost = np.random.choice([150, 280, 450, 680, 950, 1300, 1800, 2500], n)
    last_inbound = _random_dates("2024-06-01", "2025-12-31", n)
    last_outbound = _random_dates("2024-06-01", "2025-12-31", n)
    shelf_life_days = np.random.choice([180, 365, 730, 1095, 0], n, p=[0.15, 0.3, 0.3, 0.15, 0.1])
    status = np.where(stock_qty < min_stock, "低库存",
             np.where(stock_qty > max_stock * 0.8, "充足", "正常"))

    # Outliers: very high stock
    stock_qty = _inject_outliers(stock_qty, 0.02, 10)

    df = pd.DataFrame({
        "商品ID": product_ids,
        "商品名称": products,
        "仓库": warehouses,
        "库存数量": stock_qty.astype(int),
        "最低库存": min_stock,
        "最高库存": max_stock,
        "单位成本": unit_cost.astype(float),
        "最后入库日期": last_inbound,
        "最后出库日期": last_outbound,
        "保质期(天)": shelf_life_days,
        "库存状态": status,
    })

    # Missing values
    df["最后出库日期"] = _inject_missing(df["最后出库日期"], 0.08)
    df["保质期(天)"] = _inject_missing(df["保质期(天)"], 0.05)
    df["单位成本"] = _inject_missing(df["单位成本"], 0.04)

    return df


# ════════════════════════════════════════════════════════════════
# 4. Finance Data
# ════════════════════════════════════════════════════════════════

def generate_finance_data(n: int = ROW_COUNT) -> pd.DataFrame:
    dates = _random_dates("2023-01-01", "2025-12-31", n)
    departments = np.random.choice(
        ["销售部", "市场部", "研发部", "人力资源", "行政部", "财务部", "运营部", "客服部"],
        n, p=[0.25, 0.15, 0.2, 0.1, 0.08, 0.07, 0.1, 0.05],
    )
    categories = np.random.choice(
        ["人力成本", "营销费用", "研发投入", "办公费用", "差旅费用", "IT设备", "培训费用", "外包服务"],
        n,
    )
    amounts = np.round(np.random.exponential(15000, n), 2)
    budgets = np.round(amounts * np.random.uniform(0.8, 1.5, n), 2)
    variances = np.round(amounts - budgets, 2)
    payment_methods = np.random.choice(PAYMENT_METHODS, n)
    approved_by = np.random.choice(SALESPEOPLE[:8], n)
    is_recurring = np.random.choice([True, False], n, p=[0.4, 0.6])
    quarter = [f"Q{(d.month - 1) // 3 + 1}" for d in dates]
    year = [d.year for d in dates]

    # Outliers: unusually large expenses
    amounts = _inject_outliers(amounts, 0.03, 12)
    variances = np.round(amounts - budgets, 2)

    df = pd.DataFrame({
        "日期": dates,
        "部门": departments,
        "费用类别": categories,
        "金额": amounts,
        "预算": budgets,
        "预算差异": variances,
        "支付方式": payment_methods,
        "审批人": approved_by,
        "是否固定支出": is_recurring,
        "季度": quarter,
        "年份": year,
    })

    # Missing values
    df["审批人"] = _inject_missing(df["审批人"], 0.06)
    df["预算差异"] = _inject_missing(df["预算差异"], 0.05)
    df["支付方式"] = _inject_missing(df["支付方式"], 0.03)

    return df


# ════════════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════════════

def main():
    import sys
    sys.stdout.reconfigure(encoding="utf-8")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    datasets = {
        "sales_data.xlsx": generate_sales_data,
        "customer_data.xlsx": generate_customer_data,
        "inventory_data.xlsx": generate_inventory_data,
        "finance_data.xlsx": generate_finance_data,
    }

    for filename, generator in datasets.items():
        filepath = os.path.join(OUTPUT_DIR, filename)
        df = generator()
        df.to_excel(filepath, index=False, engine="openpyxl")

        null_count = df.isna().sum().sum()
        total_cells = df.shape[0] * df.shape[1]
        print(f"  {filename}")
        print(f"    Rows: {len(df)}  |  Columns: {len(df.columns)}  |  "
              f"Missing: {null_count} ({null_count / total_cells * 100:.1f}%)")
        print(f"    Fields: {', '.join(df.columns)}")
        print()

    print("All test datasets generated successfully.")


if __name__ == "__main__":
    main()
