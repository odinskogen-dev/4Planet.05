# 4PLANET repository instructions

Treat this repository as an execution surface, not the authoritative source for current 4PLANET programme state. Programme priorities, Founder decisions, cross-project status and current authority must come from a fresh AXE / GPT Project Lead BRAIN handoff when they matter to the task.

Before changing code, inspect the assigned task/PR, exact branch, recent relevant git history and existing components/contracts. Do not create parallel architecture when an existing implementation can be extended.

Never state that GitHub, a connector, deployment route, branch, tool or permission is unavailable without checking the relevant capability in the current run, unless a higher-level rule forbids the check.

Keep status exact: SPECIFIED != IMPLEMENTED != VERIFIED != FOUNDER ACCEPTED != MERGED != DEPLOYED != PRODUCTION. Never promote a status by wording.

`king/test` is the only moving 4PLANET integration/convergence line. LIVE KING is production state and requires separate promotion authority. Historical product branches are donors/recovery evidence; unknown historical branches remain candidates until dispositioned under issue #132.

Normal validation commands: `npm ci`, `npm run typecheck`, `npm run assets:verify`, `npm run lint`, `npm run build`, `npm run test:smoke`, and `npm run test:e2e` for applicable UI/runtime journeys. Verify user-visible behaviour for UI work, not only compilation.

Every material return must include project/task identity, branch, exact commit SHA, PR/issue if applicable, changed files or visible change, tests/runtime evidence, donor decisions, limitations, exact status and next gate. Preserve failed approaches and their evidence when they teach a reusable lesson.

Do not infer or change Locked Canon, Founder decisions, production release state, binding commitments, legal/accounting conclusions or external relationship status from repository context.