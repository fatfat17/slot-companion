<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Slot Companion Project Rules

## Project Status Maintenance Rule

`Slot_Companion_Project_Status.md` is the single source of truth for project progress.

Codex must update this file whenever any of the following happens:

- A new version or sub-version is completed
- A major feature is added
- Important QA or regression tests are completed
- A known issue is discovered or resolved
- An important architecture decision changes
- The current work or next step changes

At minimum, update these sections when relevant:

- Current Version
- Completed
- Verified QA
- Important Findings / Known Issues
- Current Work
- Next Step

### Rules

1. Do not mark planned work as completed.
2. Do not record unverified assumptions as facts.
3. TEST DATA must always remain clearly labeled as TEST DATA.
4. After finishing a version, update `Slot_Companion_Project_Status.md` before the final reply.
5. In the final reply, explicitly state whether the status file was updated.
6. Small cosmetic UI or copy changes do not require a status update unless they affect product behavior.

## Startup Rule

At the beginning of a new Codex conversation, before making changes, read:

- `Slot_Companion_Project_Status.md`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`

Then confirm:

- Current Version
- Current Work
- Known Issues
- Next Step

Do not modify code until the current project state has been understood.