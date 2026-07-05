# M5.5.6.1 Frontend UX Hard Simplification

## 1. Goal

Refactor the frontend from a technical demo / debugging workbench into a business-user data analysis tool.

The target user flow is:

```text
Upload Data -> Agent Analysis -> Results
```

History is for review, and Settings is for lightweight provider / language / theme preferences.

## 2. Pages Refactored

- Home: simplified to one clear action entry for uploading data and starting analysis.
- Upload Data: kept focused on CSV/Excel upload, current table context, preview, and basic quality hints.
- Agent Analysis: kept as the main analysis entry with current table, provider selection, question input, and Start Analysis.
- Results: added a lightweight business-result entry that shows recent analysis records without exposing technical details by default.
- History: removed old AI Analysis / Expert SQL type labels from the visible record language and unified records as Analysis Record.
- Settings: kept as auxiliary language / theme / basic preference surface.

## 3. Redundant Entrypoints Removed Or Weakened

- Removed Home from the primary sidebar navigation.
- Added Results to the primary sidebar navigation.
- Kept Expert SQL as an advanced mode inside Agent Analysis.
- Kept History as a review surface, not the primary workflow.
- No separate Agent Run technical entry is exposed.

Final primary navigation:

```text
Upload Data / 上传数据
Agent Analysis / Agent 分析
Results / 分析结果
History / 历史
Settings / 设置
```

## 4. UX Changes

- Home no longer uses a heavy process-arrow hero.
- Primary button copy is business oriented: Start Analysis / 开始分析.
- Agent Analysis no longer presents a debugging-console experience.
- Result rendering prioritizes answer, findings, related data, SQL, and warnings.
- Technical details such as tool calls, trace, memory details, provider debug, run id, and raw JSON are hidden in a Technical Details section.
- Mock fallback presents a user-readable fallback answer instead of only exposing the fallback process.

## 5. Visual Simplification

- Dark theme is preserved.
- Main accent moved from bright green/cyan to lower-saturation indigo / blue-purple.
- Success color remains a small-area soft green.
- Warning remains amber and error remains soft red.
- Agent Analysis card structure was simplified to avoid overlap, clipping, or visually separated debug panels.
- Existing UI components, spacing, borders, radius, and typography were reused.
- No new UI library or animation library was added.

## 6. zh-CN / en-US Sync

Both locales were updated for:

- Upload Data / 上传数据
- Agent Analysis / Agent 分析
- Results / 分析结果
- History / 历史
- Settings / 设置
- CSV/Excel upload guidance
- Start Analysis / 开始分析
- Analysis Record / 分析记录
- Technical Details / 技术细节

## 7. Validation

- frontend test: `48 passed, 1171 passed`
- frontend build: passed
- backend import: `backend import OK`
- visual check: opened `http://127.0.0.1:3000` in browser and checked Home, Upload Data, Agent Analysis, Results, History, Settings, plus zh-CN/en-US language switch.
- safety search: passed, no API key / secret / private content matches.
- old user-facing copy search: passed, no AI Query / 自然语言查询 / Run Agent / Agent Run / skeleton / runtime boundary / milestone / M5 / M6 matches in `frontend-react/src`.

## 8. Boundaries

- No backend changes.
- No README changes.
- No package.json or lockfile changes.
- No new UI library.
- No new visual system.
- M5.5.7 has not started.
- No tag was created.

