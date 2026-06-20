# Render Backend Docker 部署修复报告

**日期**: 2026-06-20
**分支**: fix-render-docker-data-dir
**修复范围**: Dockerfile 最小修复

## Render 失败日志摘要

```
Dockerfile:18 COPY data/ data/
"/data": not found
```

## Root Cause

`data/` 目录未被 git 跟踪。`git ls-files data/` 返回为空 — 只有本地的 `enterprise.duckdb`（149MB，被 `.gitignore` 排除）和 `.gitkeep`（未提交）。

Render 构建上下文来自 git 仓库，因此 `data/` 目录不存在，`COPY data/ data/` 失败。

## 修改内容

### Dockerfile（唯一修改文件）

**Before:**
```dockerfile
COPY backend/ backend/
COPY database/ database/
COPY data/ data/
```

**After:**
```dockerfile
COPY backend/ backend/
COPY database/ database/
COPY scripts/ scripts/
COPY testExcel/ testExcel/
RUN mkdir -p data
```

### 为什么不复制 data 目录

- `data/enterprise.duckdb` 是运行时数据库，不应打包进镜像
- `data/` 目录本身未被 git 跟踪，无法 COPY
- `RUN mkdir -p data` 在容器内创建空目录，运行时由应用初始化

### 为什么新增 scripts/ 和 testExcel/

- 后端启动时检查 `SEED_DEMO_DATA` 环境变量
- 若为 `true`，调用 `scripts/seed-demo-data.py`
- 该脚本读取 `testExcel/large_sales_data.csv` 写入 DuckDB
- 两者均已被 git 跟踪，打包进镜像安全

## .dockerignore

无需修改。已确认：
- `testExcel/` 未被排除
- `scripts/` 未被排除
- `data/*.duckdb` 仅排除数据库文件，不影响 `RUN mkdir`

## 本地测试结果

- `python -c "from backend.main import app"` — **通过**
- 本地 Docker 不可用，等待 Render 验证

## 下一步

1. Push 分支 `fix-render-docker-data-dir`
2. 在 Render Dashboard 触发重新部署
3. 确认构建成功且健康检查通过
