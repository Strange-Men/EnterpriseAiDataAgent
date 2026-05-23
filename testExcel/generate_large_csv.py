import csv
import random
from datetime import datetime, timedelta

random.seed(42)

TOTAL_ROWS = 50_000

# Category → subcategories mapping
CATEGORY_MAP = {
    "Electronics": ["Laptop", "Phone", "Tablet", "Headphones", "Camera"],
    "Clothing": ["Shirt", "Pants", "Dress", "Shoes", "Jacket"],
    "Home": ["Furniture", "Kitchen", "Bedding", "Lighting"],
    "Books": ["Fiction", "Non-Fiction", "Textbook", "Comics"],
    "Toys": ["Board Games", "Action Figures", "Puzzles", "Dolls", "Building Blocks"],
    "Sports": ["Fitness", "Outdoor", "Team Sports", "Water Sports"],
}

CATEGORIES = list(CATEGORY_MAP.keys())
REGIONS = ["North", "South", "East", "West", "International"]
REGION_WEIGHTS = [0.24, 0.24, 0.24, 0.24, 0.04]  # International < 5%

START_DATE = datetime(2020, 1, 1)
END_DATE = datetime(2025, 12, 31)
DATE_RANGE_DAYS = (END_DATE - START_DATE).days

MISSING_RATE = 0.02   # 2%
ANOMALY_RATE = 0.01   # 1%
RETURN_RATE = 0.05    # 5%


def random_date():
    offset = random.randint(0, DATE_RANGE_DAYS)
    return START_DATE + timedelta(days=offset)


def generate_row():
    order_dt = random_date()
    cat = random.choice(CATEGORIES)
    subcat = random.choice(CATEGORY_MAP[cat])
    region = random.choices(REGIONS, weights=REGION_WEIGHTS, k=1)[0]
    is_returned = 1 if random.random() < RETURN_RATE else 0

    # ship_date: 1~10 days after order_date, ~2% NULL
    if random.random() < MISSING_RATE:
        ship_date = ""
    else:
        ship_date = (order_dt + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d")

    order_date_str = order_dt.strftime("%Y-%m-%d")

    # sales_amount: ~2% NULL, ~1% negative anomaly, else 10~5000 with occasional 0
    r = random.random()
    if r < MISSING_RATE:
        sales_amount = ""
    elif r < MISSING_RATE + ANOMALY_RATE:
        sales_amount = f"{random.randint(-100, -1):.2f}"
    elif random.random() < 0.02:  # occasional zero
        sales_amount = "0.00"
    else:
        sales_amount = f"{random.uniform(10, 5000):.2f}"

    # quantity: 1~100, ~1% anomaly (0 or 999)
    if random.random() < ANOMALY_RATE:
        quantity = random.choice([0, 999])
    else:
        quantity = random.randint(1, 100)

    # discount: 0~0.5, ~2% NULL
    if random.random() < MISSING_RATE:
        discount = ""
    else:
        discount = f"{random.uniform(0, 0.5):.4f}"

    return [
        order_date_str, ship_date, cat, subcat,
        sales_amount, str(quantity), discount, region, str(is_returned)
    ]


HEADER = [
    "order_date", "ship_date", "category", "subcategory",
    "sales_amount", "quantity", "discount", "customer_region", "is_returned"
]

OUTPUT = "testExcel/large_sales_data.csv"

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    for _ in range(TOTAL_ROWS):
        writer.writerow(generate_row())

print(f"Done: {TOTAL_ROWS} rows written to {OUTPUT}")
