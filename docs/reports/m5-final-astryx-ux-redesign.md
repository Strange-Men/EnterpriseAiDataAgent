# M5 Final Astryx UX Redesign

## 1. Goal

Redesign the frontend from a technical demo / Agent debugging console into a business-user data analysis Agent tool.

The target product experience is:

- upload a CSV/Excel spreadsheet
- ask a business question in natural language
- review a readable answer, key findings, related data, warnings, and next steps
- keep SQL and technical execution details folded by default

## 2. Astryx Source And Installation

- official source: https://github.com/facebook/astryx
- npm packages:
  - `@astryxdesign/core@0.1.3`
  - `@astryxdesign/theme-neutral@0.1.3`
  - `@astryxdesign/cli@0.1.3`
- install command:
  - `npm install @astryxdesign/core@0.1.3 @astryxdesign/theme-neutral@0.1.3 @astryxdesign/cli@0.1.3 --save --ignore-scripts --cache D:/Claude_workfile/EnterpriseAiDataAgent/.npm-cache`
- Astryx install path:
  - `D:/Claude_workfile/EnterpriseAiDataAgent/frontend-react/node_modules/@astryxdesign`
- npm / npx cache path:
  - `D:/Claude_workfile/EnterpriseAiDataAgent/.npm-cache`
- project npm cache config:
  - `frontend-react/.npmrc`
- temporary log path:
  - `D:/Claude_workfile/EnterpriseAiDataAgent/.tmp`
- C drive check:
  - no `@astryxdesign` package was found under default C npm cache locations
  - the installed Astryx packages and npm cache are on D drive

## 3. Astryx Commands Used

- `node node_modules/@astryxdesign/cli/bin/astryx.mjs --help`
- `node node_modules/@astryxdesign/cli/bin/astryx.mjs docs tokens --dense`
- `node node_modules/@astryxdesign/cli/bin/astryx.mjs search app-shell --detail compact --json`
- `node node_modules/@astryxdesign/cli/bin/astryx.mjs doctor --json`

Final Astryx doctor result:

- pass: 5
- warn: 0
- fail: 0
- theme wired through `package.json` `astryx.theme`

## 4. Astryx Audit Conclusion

Astryx AppShell and token guidance reinforced that the frontend should be a task-oriented application shell with restrained surfaces, clear main content, minimal navigation noise, and semantic tokens instead of ad hoc decorative styling.

The previous frontend still exposed too much feature structure to normal users: separate upload, analysis, results, history, settings, query, and detail surfaces made the app feel like a technical control panel. SQL, trace, provider, and run metadata were too easy to encounter as primary content.

## 5. New Frontend Architecture

The default frontend experience is now a single business workbench:

- data context
- natural-language question area
- business answer area
- analysis records
- lightweight settings
- advanced SQL tools folded as an expert area

The old routes now point to the same business workbench with different initial focus:

- `/`
- `/data`
- `/analyze`
- `/results`
- `/history`
- `/settings`
- `/query`
- `/analyze/[runId]`

## 6. Old Structure Removed Or Merged

- Home hero flow was replaced by a concise business tool entry.
- Data Preview is folded into the data context area.
- Results is folded into the business answer area.
- History is folded into analysis records.
- Settings is folded into a lightweight model/language/theme panel.
- Expert SQL is no longer a primary product entry; it is folded under Advanced SQL tools.
- The old technical analysis detail route now opens the business workbench result focus.

## 7. Agent Output Redesign

Default result display now prioritizes:

- analysis conclusion
- key findings
- related data
- warnings
- next questions

Folded by default:

- SQL
- tool calls
- trace
- provider metadata
- memory details
- run id
- raw run payload

## 8. Mock And Real Provider Consistency

The frontend renders mock, Doubao, and fallback responses through the same business report layout.

Mock fallback is treated as a readable demo fallback in the UI and is not used as the main visual identity of the result. Provider details and fallback reason are shown only in Technical Details.

## 9. History And Result Recovery

New persisted store:

- `frontend-react/src/stores/astryx-workbench-store.ts`

Persisted record fields include:

- run id
- question
- table name
- answer
- findings
- evidence preview
- SQL
- warnings
- next steps
- provider used
- status
- created time
- raw run

Recent analysis records survive refresh through Zustand persistence and can restore the selected result in the workbench.

## 10. Files Changed

- `frontend-react/package.json`
- `frontend-react/package-lock.json`
- `frontend-react/.npmrc`
- `frontend-react/src/styles/globals.css`
- `frontend-react/src/components/client-providers.tsx`
- `frontend-react/src/components/astryx/astryx-data-agent-workbench.tsx`
- `frontend-react/src/stores/astryx-workbench-store.ts`
- `frontend-react/src/hooks/use-language.ts`
- `frontend-react/src/layout/sidebar.tsx`
- `frontend-react/src/i18n/en.ts`
- `frontend-react/src/i18n/zh.ts`
- `frontend-react/src/app/(shell)/*`

## 11. UIUX Check

Browser check at `http://127.0.0.1:3000` confirmed:

- dark UI renders normally
- Astryx workbench root is present
- main navigation is Upload Data / Agent Analysis / Results / History / Settings
- no visible arrow-flow hero
- no visible AI Query / Natural Language Query / Run Agent copy
- SQL and Advanced SQL tools are folded by default
- Analysis records and settings are folded by default
- zh-CN and en-US copy both render correctly

## 12. Validation

- backend import: `backend import OK`
- backend pytest: `811 passed, 31 skipped`
- frontend test: `48 test files passed, 1171 tests passed`
- frontend build: passed
- Astryx doctor: `5 pass, 0 warn, 0 fail`
- browser visual check: passed
- safety search: no real key or private content found in changed worktree scope

Notes:

- Running plain `pytest` without `PYTHONPATH=.` failed to import `backend` in this PowerShell environment. Re-running with `$env:PYTHONPATH='.'` passed.
- Existing lint warnings remain in historical test/panel files and were not introduced by this redesign.

## 13. Recommendation

M5 Final Astryx UX Redesign is ready for merge validation if branch CI passes.

Recommended next step:

```text
M5 Final Astryx UX Redesign Merge Validation
```

Do not start M6 and do not create a tag in this round.
