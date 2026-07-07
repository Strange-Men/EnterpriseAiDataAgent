# M6 Manual Test Guide

## 1. Pull Latest Master

```bash
cd D:/Claude_workfile/EnterpriseAiDataAgent
git checkout master
git pull origin master
```

本指南面向 M6.8 之后的 `master` 手动测试。M6 final tag 尚未创建，建议先完成手动验收，再决定是否打 M6 final tag。

## 2. Backend Setup

安装后端依赖：

```bash
cd D:/Claude_workfile/EnterpriseAiDataAgent
python -m pip install --upgrade pip
pip install -r requirements.txt
```

启动后端：

```bash
cd D:/Claude_workfile/EnterpriseAiDataAgent
uvicorn backend.main:app --reload --port 8000
```

快速检查：

```bash
python -c "from backend.main import app; print('backend import OK')"
```

## 3. Frontend Setup

安装前端依赖：

```bash
cd D:/Claude_workfile/EnterpriseAiDataAgent/frontend-react
npm ci
```

启动前端：

```bash
cd D:/Claude_workfile/EnterpriseAiDataAgent/frontend-react
npm run dev
```

默认访问：

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## 4. Demo Data

M6 demo business dataset:

- CSV: `testExcel/demo_sales_business_50k.csv`
- XLSX: `testExcel/demo_sales_business_50k.xlsx`

建议优先上传 CSV；如需验证 Excel 上传兼容，再上传 XLSX。

## 5. Suggested Manual Questions

建议按顺序测试，后两题用于验证多轮追问 memory。

1. 帮我评估这张表整体经营健康度，先给结论，再说明主要风险和机会。
2. 哪些地区是高收入但高风险？
3. 哪些品类存在促销依赖风险？
4. 哪些渠道带来了订单，但客户体验可能不好？
5. 发货效率有没有拖累客户体验？
6. 这张表有哪些明显的数据质量问题？
7. 帮我输出一份面向老板的经营简报。
8. 我想知道广告花费 ROI，帮我分析。
9. 按会员等级分析复购率。
10. 用户来自哪些小区？
11. 基于刚才的高风险地区，继续看具体品类原因。
12. 基于上一题，给我一个一周内能执行的整改计划。

## 6. Manual Acceptance Criteria

默认输出应满足：

- 默认看到业务报告，不是 SQL 日志。
- 有一句话总判断。
- 有核心结论。
- 有关键数据依据。
- 有风险优先级。
- 有行动建议。
- 有下一步追问建议。
- 数据限制或缺字段时明确说明。
- SQL / trace / tool_calls / provider / run_id / memory 默认折叠。
- ROI / 会员等级 / 小区字段不能胡编。
- 追问能基于上一轮上下文继续。

## 7. Technical Details Check

在业务报告下方查看技术细节区域：

- 默认应处于折叠状态。
- 展开后才允许看到 SQL、trace、tool_calls、provider、run_id、memory 或 raw JSON 类信息。
- 如果这些技术字段默认出现在主报告中，视为 M6.6/M6.8 回归问题。

## 8. Provider Notes

默认手动测试可以使用 mock provider。

如果本地配置了安全可用的 Doubao provider 环境变量，可以额外做一次真实 provider smoke；不要把 key 写入仓库，不要截图或复制 key 到报告中。

如果 provider fallback 发生：

- UI 或响应应明确说明 fallback / mock / 降级状态。
- 不能把模拟结果伪装成真实 provider 洞察。
- business_report 仍应保持业务报告结构。

## 9. Troubleshooting

### Backend Start Failed

1. 确认当前目录是 `D:/Claude_workfile/EnterpriseAiDataAgent`。
2. 重新安装依赖：`pip install -r requirements.txt`。
3. 执行 import 检查：`python -c "from backend.main import app; print('backend import OK')"`。
4. 确认 8000 端口未被其他进程占用。

### Frontend Start Failed

1. 确认当前目录是 `D:/Claude_workfile/EnterpriseAiDataAgent/frontend-react`。
2. 重新安装依赖：`npm ci`。
3. 如端口 3000 被占用，根据 Next.js 提示改用其他端口。
4. 执行 `npm run build` 确认生产构建可通过。

### Upload Failed

1. 优先使用 `testExcel/demo_sales_business_50k.csv`。
2. 确认后端正在 `http://localhost:8000` 运行。
3. 确认文件未被 Excel 或其他程序锁定。
4. 如 CSV 上传通过但 XLSX 失败，记录具体错误并保留复现步骤。

### Business Report Not Displayed

1. 确认使用的是 M6.8 之后的 `master`。
2. 确认问题属于业务分析类，而不是普通 SQL 查询。
3. 检查后端响应中是否存在 `business_report`。
4. 如 `business_report` 存在但前端未展示，记录前端复现截图和浏览器控制台错误。

### Technical Details Expanded By Default

1. 刷新页面重新测试。
2. 确认 SQL / trace / tool_calls 不在业务报告主体中。
3. 如果刷新后仍默认展开，记录问题和复现步骤。

### Provider Fallback

1. mock provider 下 fallback 是可接受行为。
2. 真实 provider smoke 只在本地已安全配置 key 时执行。
3. 任何 provider fallback 都必须有明确提示，不能伪装成真实模型成功。
