# M4-8.6.1 Merge Validation

## 1. Merge Result

- **Source branch**: `m4-8-6-1-data-header-upload-guidance`
- **Target branch**: `master`
- **Merge type**: Fast-forward
- **Commit**: `70c0102` now in master ✅
- **Previous master tip**: `ee8699f`

## 2. Why This Merge Was Needed

GitHub showed `m4-8-6-1-data-header-upload-guidance had recent pushes`, meaning the branch changes were not yet visible on master / Vercel. The commit `70c0102` was only in the feature branch, not master.

## 3. Upload Copy Check

- **Old drag/drop copy in dropzone**: Removed ✅
- **Chinese dropzone**: "点击选择文件" (no "拖拽") ✅
- **English dropzone**: "Click to select files" (no "Drag") ✅
- **Drag/drop event handlers**: None found ✅
- **Upload copy is now guidance-focused**: Yes ✅
- **Note**: `zh.ts:707` onboarding tooltip still contains "拖拽文件到上传区域" — separate context (onboarding flow), not the upload dropzone

## 4. What Was Not Changed

- 未改上传逻辑
- 未改拖拽上传行为
- 未改 API
- 未改 Store
- 未改后端
- 未开始 M4-8.6.2
- 未开始 M5 Agent

## 5. Local Validation

| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ Pass |
| tests (38 files, 839 tests) | ✅ All passed |
| build (9/9 pages) | ✅ Pass |
| lint | ✅ Pass (pre-existing warnings only) |
| backend import | ✅ Pass |

## 6. Next Step

等待用户人工检查线上 Vercel 页面。

如果合并后线上仍有误导性拖拽文案，再做 M4-8.6.1.1 Upload Copy Hotfix。

暂不进入 M4-8.6.2。
暂不进入 M5 Agent。
暂不打 tag。
