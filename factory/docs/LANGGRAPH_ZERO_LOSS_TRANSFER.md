# LangGraph Zero-Loss Pattern Transfer — Corporate OS / Factory 1

Decision: DO NOT create a parallel LangGraph Factory. Transfer useful patterns into the existing Cloudflare Worker + Durable Object + Workflow + Queue control plane.

| LangGraph pattern | Factory disposition | 4PLANET current / target implementation |
|---|---|---|
| Explicit state graph | ADOPT / IMPLEMENTED | Canonical Run Ledger states QUEUED → LEASED → RUNNING → TESTING → EVALUATING → CORRECTING → PROVEN → terminal state. |
| Checkpoint / durable persistence | ALREADY PRESENT + HARDEN | Durable Objects + Workflow persisted steps already survive request boundaries; Run Ledger persistence is the next hardening step. |
| Resume after failure | ALREADY PRESENT + HARDEN | Workflows retry durable steps; hourly Conductor recovers interrupted work. Add run-level recovery assertions and fencing. |
| Conditional routing | ALREADY PRESENT | Batcher, dependency release, activation gates, evaluator and workflow outcomes already route based on state/evidence. |
| Local correction loops | ALREADY PRESENT | Autonomous execution has bounded correction attempts; resource budgets now cap attempts. |
| Human interrupts | ADOPT AS FOUNDER GATES | Do not pause whole Factory. PARK Founder-gated work and continue next safe Work Package. |
| Subgraph / agent isolation | ALREADY PRESENT IN PRINCIPLE | Section sub-agents have bounded roles and Work Packages; Cloudflare Sandbox becomes the stronger code-execution isolation layer after cost approval. |
| Per-thread state | ADOPT AS RUN IDENTITY | `run_id` + `attempt_id` + `input_state_hash` + idempotency key distinguish executions. |
| Replay / time travel | ADOPT AS EVIDENCE REPLAY, NOT MUTABLE HISTORY | Preserve exact run/evidence history and permit controlled replay against a pinned state. Old PASS cannot certify a new build/state. |
| Idempotent side effects | ADOPT P0 | At-least-once Queue/Workflow delivery requires deterministic idempotency for GitHub branches/commits/PRs/outcomes/learning. |

## Bounded experiment rule
A LangGraph dependency may only be introduced inside one specialised worker if a concrete, measured requirement remains materially better solved by LangGraph than by Cloudflare Workflows/Durable Objects. Such an experiment must not own portfolio scheduling, authority, canonical state or release control.

## Current conclusion
The architecture value from LangGraph is the state-machine discipline, checkpoint/resume semantics, explicit interrupts and idempotent subtask design. The existing Cloudflare stack remains the Factory control plane.
