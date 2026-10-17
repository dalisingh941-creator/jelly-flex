# JellyFlex 2.0 — Autonomous Omni-Channel Social & AI Agent Suite

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/framework-Agno%20OS%20%2B%20FastAPI-indigo)](https://agno.com)
[![SDK](https://img.shields.io/badge/SDK-Google%20Antigravity%202.0-purple)](https://antigravity.google)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2015%20%2B%20Tailwind-black)](https://nextjs.org)
[![Clean-Room Engine](https://img.shields.io/badge/engine-REA%205--Stage%20Clean--Room-emerald)](https://github.com/morluto/rea)

> **JellyFlex 2.0** is an open-source, local-first, zero-knowledge omni-channel social media and personal AI agent suite. Powered by the **Agno OS framework**, the **Google Antigravity SDK**, clean-room synthesized **7 OpenClaw 2.0 subsystems**, and an interactive **Next.js 15 companion workspace**.

---

## 1. System Architecture

```text
                       +------------------------------------------------+
                       |         JellyFlex Companion Workspace          |
                       |     (Next.js 15 + Tailwind CSS + Dark/Light)    |
                       | [MascotMatrix + Avatar Studio + Approval Cards]|
                       +-----------------------+------------------+-----+
                        HTTP Commands          |                  | Single Canonical SSE Stream
                       (POST /api/v1/execute)  |                  | (GET /api/v1/stream)
                                               v                  |
       +----------------------------------------------------------+-----------------+
       |            FastAPI Trusted Gateway & Harness (127.0.0.1:8000)             |
       |  +---------------------+  +--------------------+  +---------------------+  |
       |  | Semantic Cost Router|  | Permission Broker  |  | OpenClaw State      |  |
       |  | (Flash vs. Argon)   |  | (Inline Allow/Deny)|  | Doctor & SSE Bus    |  |
       |  +----------+----------+  +---------+----------+  +----------+----------+  |
       +-------------+-----------------------+------------------------+-------------+
                     |                       |                        |
                     v                       v                        v
       +--------------------------+ +----------------------+ +----------------------+
       |  Agno Core & Lane Queue  | | Inbuilt Skills Engine| | Zero-Knowledge Vault |
       |  - FIFO Outbox Lanes     | | - 106+ SKILL.md Hub  | | - PBKDF2 + Fernet DB |
       |  - Cron Lease Manager    | | - IG / YT / TikTok   | | - Encrypted G-Drive  |
       |  - Stealth Browser Pool  | | - X / LI / Reddit    | | - Rate-Limit Buckets |
       +--------------------------+ +----------------------+ +----------------------+
```

---

## 2. Clean-Room Reverse-Engineering & Parity Matrix

All capabilities in JellyFlex 2.0 were synthesized autonomously through the **REA (Reverse Engineer Anything)** 5-stage clean-room methodology (`Pick a feature` -> `Route by build` -> `Summary first` -> `Seen/Inferred/Unknown evidence tagging` -> `Rebuild & test`), harvesting specifications from:
- **morluto/rea**: 5-stage MCP and static/dynamic AST reverse-engineering pipeline.
- **openclaw/openclaw & openclaw/clawhub**: 7 core subsystems extracted into clean-room Python.
- **milind-soni/OpenMausBot**: Two-process HTTP command + single SSE stream and reactive companion state machine.
- **gitroomhq/postiz-app & trypostit/trypost**: Rate limiters, 1-to-11 content repurposing waterfall.
- **14 Inbuilt Social Repositories**: 106+ social skills spanning Instagram, YouTube, TikTok, X, LinkedIn, Threads, Reddit, Pinterest, Telegram, and Discord.

| Feature / Subsystem | OpenClaw 2.0 / Postiz / Cue | JellyFlex 2.0 Clean-Room Architecture |
|---|---|---|
| **Subsystem 1: Sandbox Isolation** | Node.js child processes (`gateway-prewarm.mjs`) | `TrustedGatewayGuard` with 30s graceful shutdown drain budget |
| **Subsystem 2: Concurrency & Order** | Memory queues subject to crash losses | `OpenClawLaneQueue` with channel locks, global semaphore & SQLite FIFO recovery |
| **Subsystem 3: Local Storage & Healing** | Raw SQLite with main-thread lag | `HardwareFernetVault` off-main-thread with automatic `doctor_repair()` |
| **Subsystem 4: Anti-Ban Stealth** | Basic headless browser | `StealthBrowserHumanizer` with bezier curves & biological typing jitter |
| **Subsystem 5: Skill Engine** | Proprietary ClawHub manifests | `DynamicSkillRegistry` auto-chaining Foundation + Platform `SKILL.md` playbooks |
| **Subsystem 6: Event Triggers** | Cron loops with duplicate risk | `CronLeaseManager` with lease TTL tokens preventing collision |
| **Subsystem 7: Omni-Channel Bridges** | Monolithic Node bridges | `OmniSocialRegistry` supporting 10+ social platforms & encrypted Google Drive sync |
| **UI Design System** | Generic or closed-source | Next.js 15 glassmorphic obsidian/frosted interface, dark/light modes, animated SVG icons, zero emojis |
| **Companion Avatar** | Static image or single mascot | 6-state `MascotMatrix` + 5-species Parametric `AvatarCreatorStudio` with SVG/JSON export |
| **BYOK Security & Privacy** | Plaintext config files | Write-only key masking, hardware-bound AES-128-CBC encryption, 1-click panic lock |
| **App Uninstaller** | Leaves zombie processes and databases | 1-Click DoD 3-pass cryptographic file shredder & clean uninstaller script |

---

## 3. Inbuilt Social Media Agent Skills (`skills/`)

Every platform skill chains through **Foundation** (`brand-profile` -> `voice-builder`) before applying platform-specific rules:

- **Instagram Suite (`skills/instagram-suite/`)**: 0-3s hook velocity, 5s retention beats, 10-slide carousel architecture, searchable caption keyword SEO.
- **YouTube Suite (`skills/youtube-suite/`)**: Long-form retention curves, 9:16 Shorts scripts, high-CTR title variations, thumbnail design briefs, timestamped chapters.
- **TikTok Suite (`skills/tiktok-suite/`)**: Pattern-interrupt openers, TikTok Photo Mode carousels, audio/trend synchronizers.
- **X / Twitter Suite (`skills/x-twitter-suite/`)**: 280-char high-signal single posts, high-tension thread architecture, Grok-style timeline reply flywheel.
- **LinkedIn Suite (`skills/linkedin-suite/`)**: "See more" fold hook optimization (lines 1-2), B2B document carousel slide briefs, thought leadership essays.
- **Meta Threads & Facebook (`skills/threads-facebook-suite/`)**: Conversational debate starters, Facebook Group community value prompts.
- **Pinterest & Reddit (`skills/pinterest-reddit-suite/`)**: 2:3 vertical Pin visual SEO briefs; Reddit value-first answers strictly respecting subreddit rules.
- **Research & Outlier Miner (`skills/research-outlier-miner/`)**: Outlier post detector (3x–10x median baseline), audience comment objection miner, 30-day viral trend synthesis.
- **Telegram & Discord (`skills/telegram-discord-suite/`)**: Broadcast announcements with formatted markdown, community webhook embeds.

---

## 4. Quickstart

### Prerequisites
- Python 3.12+ (or [uv](https://github.com/astral-sh/uv))
- Node.js 20+ and npm

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/your-username/jelly-flex-core.git
cd jelly-flex-core

# Using uv (fastest):
uv venv
uv pip install -r backend/requirements.txt

# Run automated clean-room verification suite:
uv run pytest
```

### 2. Start Backend FastAPI Server
```bash
uv run python backend/main.py
# Server runs at http://127.0.0.1:8000
# API Docs available at http://127.0.0.1:8000/docs
```

### 3. Start Frontend Companion Workspace
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### 4. Or Run With Docker Compose
```bash
docker-compose up --build
```

---

## 5. Security & Cryptographic Invariants

1. **Hardware-Locked Key Derivation**: Keys are generated locally via `PBKDF2HMAC` (SHA-256, 480,000 iterations) using the host machine's hardware UUID salt combined with `Fernet` AES-128-CBC encryption.
2. **Write-Only BYOK Masking**: API keys entered into the UI are encrypted at rest immediately. The UI only ever sees masked fingerprints (e.g. `AIza••••8f2a`).
3. **1-Click Emergency Panic Lock**: Instantly cancels running asyncio tasks, closes browser contexts, and seals the SQLite vault via `POST /api/v1/security/panic-lock`.
4. **DoD 3-Pass Cryptographic Shredder**: The in-app uninstaller overwrites database files and `.env` secrets with cryptographically random bytes 3 times before unlinking them from disk.

---

## 6. License

This project is licensed under the [MIT License](LICENSE).
