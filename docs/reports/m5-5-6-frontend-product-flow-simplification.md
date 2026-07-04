# M5.5.6 Frontend Product Flow Simplification

## 1. Goal

Simplify the frontend product flow from a stacked feature workspace into:

```text
Upload Data -> Agent Analysis -> Result
```

Expert SQL remains available as an advanced path.

## 2. Files Changed

- `frontend-react/src/app/(shell)/data/page.tsx`
- `frontend-react/src/components/investigation/investigation-workspace.tsx`
- `frontend-react/src/panels/file-upload-panel.tsx`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/services/api/agent.ts`
- `CURRENT_SESSION.md`

## 3. Whole-Site Flow Simplification

- Dashboard now points users to Upload Data first, then Agent Analysis.
- Upload focuses on CSV / Excel upload and table selection.
- Data Preview keeps the current table, fields, sample rows, and basic quality hints.
- Analyze is now centered on Agent Analysis.
- Expert SQL remains available as an advanced mode inside the Analyze workspace.
- History is positioned as an auxiliary activity log.
- Settings is positioned as auxiliary preferences.

## 4. Agent Analysis

Agent Analysis now lets the user:

- select the current table
- select provider requested: Mock, DeepSeek, Doubao, Mimo, or OpenAI
- enter a natural-language question
- run Agent Analysis through the existing `createAgentRun` client
- view provider requested / provider used / fallback reason
- view answer, SQL, evidence, warnings, trace, and tool calls

The frontend request keeps `mode` fixed to the current backend contract and does not expose alternate agent run modes in the UI.

## 5. Expert SQL

Expert SQL remains as a second tab for advanced users who want to inspect, edit, and execute SQL directly.

AI SQL is treated as an advanced SQL-workspace helper rather than a competing ordinary-user entry point.

## 6. zh-CN / en-US Sync

Both language files were updated:

- navigation
- home/dashboard copy
- upload guidance
- preview guidance
- history/settings de-emphasis
- Agent Analysis request and result copy
- provider and fallback copy
- warnings / trace / tool calls labels

## 7. UIUX Consistency

The implementation reuses existing:

- Analyze workspace tab pattern
- cards / panels
- buttons
- badges
- textareas / selects
- loading / error presentation
- existing API client

No new UI library, animation library, or global visual system was added.

## 8. Validation

- backend import: passed
- frontend build: passed with existing lint warnings
- safety search: passed, no secrets or private content found
- engineering-word search: user-visible M5/M6/runtime-boundary/milestone copy removed; remaining hits are existing component/type names such as `PanelSkeleton` and the fixed API contract mode value
- product-flow content search: Agent Analysis / Expert SQL / Provider / Fallback / Upload Data present

## 9. Boundaries

- backend was not modified
- README / README.en were not modified
- package.json / package-lock.json were not modified
- no new dependency was installed
- no real API key or credential was added
- M5.5.7 was not started
- no tag was created

## 10. Next Step

After user review, enter:

```text
M5.5.6 Merge Validation
```

Do not start M5.5.7 in this round.
