# OpenClaw 2.0 — 7 Core Architectural Subsystems Reverse-Engineering Specification
**Framework:** REA (Reverse Engineer Anything) 5-Stage Clean-Room Methodology  
**Target:** openclaw/openclaw & openclaw/clawhub  

---

### Subsystem 1: Trusted Gateway vs. Untrusted Execution Sandbox
- **Target Files [SEEN]:** `gateway-prewarm.mjs`, `gateway-run-argv.mjs`, `gateway-shutdown-budget.mjs`, `security/`
- **Architectural Findings [SEEN]:** Untrusted tool runs, dynamic code execution, and stealth browser tasks are strictly cordoned off from the primary API process. Worker processes run with bounded CPU and memory limits.
- **Shutdown Drain Budget [INFERRED]:** The gateway maintains a registered set of active async tasks (`_active_tasks`). Upon SIGTERM/SIGINT, it enforces a 30-second graceful drain timeout (`graceful_drain()`) allowing pending network flushes to finalize before terminating child processes.
- **Clean-Room Implementation [SEEN]:** `backend/security/gateway_guard.py` (`TrustedGatewayGuard`).

---

### Subsystem 2: Context-Engine FIFO Outbox & Lane Concurrency
- **Target Files [SEEN]:** `packages/`, `src/context/`, `outbox/`
- **Architectural Findings [SEEN]:** Omni-channel dispatches require strict sequential delivery per account/channel to avoid out-of-order replies and timeline race conditions.
- **Concurrency Isolation [INFERRED]:** A dictionary of `asyncio.Lock` instances mapped to each social channel (`instagram`, `youtube`, `tiktok`, `x`, `linkedin`, etc.) guarantees single-flight serialized actions per lane. A global `asyncio.Semaphore(max_concurrent_lanes)` limits aggregate concurrent outbound requests.
- **FIFO State Persistence [SEEN]:** Incremental integer `fifo_seq` IDs are attached to each transaction and logged to SQLite for crash recovery.
- **Clean-Room Implementation [SEEN]:** `backend/agents/lane_queue.py` (`OpenClawLaneQueue`).

---

### Subsystem 3: Off-Main-Thread SQLite & Startup "Doctor" State Repair
- **Target Files [SEEN]:** `node-sqlite.mjs`, `cli-root-options.mjs`, `doctor.mjs`
- **Architectural Findings [SEEN]:** Heavy disk I/O on SQLite causes event loop stuttering. OpenClaw offloads database calls to worker threads and runs automated integrity checks upon startup.
- **Self-Healing State Repair [INFERRED]:** If the application previously crashed mid-transaction, orphaned tasks marked as `running` are automatically reset to `recovered` by `doctor_repair()` during startup.
- **Hardware Cryptographic Lock [SEEN]:** Enhanced in JellyFlex 2.0 with host machine UUID salt + PBKDF2HMAC (480,000 iterations) + Fernet AES-128-CBC encryption.
- **Clean-Room Implementation [SEEN]:** `backend/security/fernet_vault.py` (`HardwareFernetVault`).

---

### Subsystem 4: OpenClaw-Managed Stealth Browser Pool & Control UI Profiler
- **Target Files [SEEN]:** `deploy/`, `ui/`, `.agents/browser/`
- **Architectural Findings [SEEN]:** Automated social interactions are vulnerable to headless browser fingerprinting.
- **Humanized Jitter & Bezier Curves [INFERRED]:** Mouse movements are calculated using randomized cubic-bezier curves with control point displacement. Keystroke timing uses gaussian-distributed delays with extra pauses at punctuation.
- **Account Health Radar [SEEN]:** Hourly action sliding-window limiter prevents rate limit triggers and shadowbans.
- **Clean-Room Implementation [SEEN]:** `backend/apps_registry/stealth_browser.py` (`StealthBrowserHumanizer`).

---

### Subsystem 5: ClawHub Dynamic SKILL.md Loader & Custodian Checks
- **Target Files [SEEN]:** `skills/`, `custodian-skills/`, `clawhub/`
- **Architectural Findings [SEEN]:** Skills are distributed as modular directories containing `SKILL.md` with YAML frontmatter and structured markdown instructions.
- **Chained Skill Injection [INFERRED]:** Platform workflows dynamically load and chain Foundation skills (`brand-profile` and `voice-builder`) with channel-specific skills into the system prompt.
- **Clean-Room Implementation [SEEN]:** `backend/skills_engine/skill_loader.py` (`DynamicSkillRegistry`).

---

### Subsystem 6: MCP Event-Driven Automation Triggers & Cron Leases
- **Target Files [SEEN]:** `pnpm-lock.yaml`, `.crabbox.yaml`, `scripts/`
- **Architectural Findings [SEEN]:** Background triggers from cron intervals or external Model Context Protocol (MCP) tool events.
- **Deterministic Lease Management [INFERRED]:** Background jobs acquire lease tokens with fixed TTLs to prevent duplicate execution across clustered nodes or multi-process runs.
- **Clean-Room Implementation [SEEN]:** `backend/agents/cron_lease_manager.py` (`CronLeaseManager`).

---

### Subsystem 7: Omni-Channel Messaging & Social Bridge Registry
- **Target Files [SEEN]:** `extensions/`, `apps/`, `bridges/`
- **Architectural Findings [SEEN]:** Unified abstraction layer supporting Instagram, YouTube, TikTok, X (Twitter), LinkedIn, Threads, Facebook, Pinterest, Reddit, Telegram, and Discord.
- **Payload Normalization [UNKNOWN]:** External API requirements and changes are abstracted through pluggable adapter interfaces with fallback to stealth browser emulation.
- **Clean-Room Implementation [SEEN]:** `backend/apps_registry/omni_social_adapters.py`.
