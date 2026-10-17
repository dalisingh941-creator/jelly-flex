# OpenMausBot — SSE Bus, Permission Broker & Mascot Matrix Reverse-Engineering Specification
**Framework:** REA (Reverse Engineer Anything) 5-Stage Clean-Room Methodology  
**Target:** milind-soni/OpenMausBot (Cue by Manus AI / OpenAI Dots / Grok Bot Alternative)  

---

### 1. Two-Process HTTP Command + Single Canonical SSE Stream
- **Target Files [SEEN]:** `server/index.ts`, `client/src/hooks/useSSE.ts`
- **Architectural Findings [SEEN]:** UI interactions are decoupled from long-running agent tasks. User dispatches a command via `POST /api/v1/execute` which immediately returns `{ "status": "queued", "task_id": "..." }`. Real-time telemetry, state transitions, tool executions, and thought streams flow back via a single persistent SSE endpoint (`GET /api/v1/stream`).
- **Clean-Room Implementation [SEEN]:** FastAPI `StreamingResponse` broadcasting JSON payloads across connected `asyncio.Queue` subscribers (`backend/main.py`).

---

### 2. Inline Allow/Deny Permission Broker
- **Target Files [SEEN]:** `server/broker.ts`, `client/src/components/ApprovalCard.tsx`
- **Architectural Findings [SEEN]:** Destructive or public operations (publishing to social feeds, executing shell code, writing persistent state) must pause and await user authorization.
- **Async Gate [INFERRED]:** The agent loop registers an `asyncio.Event` keyed by `task_id` in `pending_approvals`. The event stream notifies the UI with state `AWAITING_APPROVAL`. The agent pauses on `await asyncio.wait_for(event.wait(), timeout=600.0)`. Clicking "Allow" hits `POST /api/v1/approve/{task_id}`, resolving the event. Clicking "Deny" rejects or removes the pending job.
- **Clean-Room Implementation [SEEN]:** `backend/main.py` endpoints `/api/v1/approve/{task_id}` and `/api/v1/deny/{task_id}`.

---

### 3. 6-State Reactive Mascot Matrix
- **Target Files [SEEN]:** `client/src/components/Mascot.tsx`
- **Architectural Findings [SEEN]:** Companion avatar provides instant non-verbal visual feedback for the agent's mental state.
- **State Space [SEEN]:**
  - `IDLE`: Resting state, breathing particle aura.
  - `THINKING`: Rapid orbital scan, purple neon glow, analyzing prompt and selecting skills.
  - `SYNCING`: Cyan data stream, encrypting state with PBKDF2HMAC Fernet cipher.
  - `AWAITING_APPROVAL`: Amber pulse, locked waiting for human authorization.
  - `COMPLETED`: Emerald victory aura, payload safely published and state sealed.
  - `ERROR`: Crimson alert pulse, reporting diagnostic details.
- **Parametric Vector Rig [SEEN]:** Implemented in `ModularAvatarSVG.tsx` with collision-free React `useId()` filter scopes and SVG paths.
