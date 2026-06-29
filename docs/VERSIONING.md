# Versioning

## Current Version

- app version: 1.4.1
- release tag: v1.4.1-m4-engineering-complete

## Rules

- Use semantic version style: 1.x.x.
- Use annotated Git tags for stable milestones.
- Keep `backend/VERSION`, `frontend-react/package.json`, and release docs aligned.
- Do not invent ad-hoc versions in prompts or reports.
- Stage suffixes may appear in Git tags, for example:
  - `v1.4.1-m4-engineering-complete`
  - `v1.5.0-m5-agent-mvp`

## Before Tagging

Check:

- `backend/VERSION`
- `frontend-react/package.json`
- `frontend-react/package-lock.json` if present
- `CURRENT_SESSION.md`
- `README.md` / `README.en.md`
- latest release report

## Governance Notes

- Pure app version fields use `1.x.x`.
- Release tags may include milestone suffixes for context.
- Historical reports can keep their original version references.
- New release docs should state both the app version and the release tag.
