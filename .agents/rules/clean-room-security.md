# Google Antigravity Clean-Room Security Rules

## 1. Zero Knowledge Encryption Invariant
- All API keys, user tokens, and sensitive social payloads must be encrypted locally using `HardwareFernetVault` with PBKDF2HMAC (SHA-256, 480,000 iterations) and machine UUID salt.
- Never write unencrypted secrets to log files, disk, or terminal output.
- All backups to Google Drive or external stores must be pre-encrypted ciphertext only.

## 2. Permission Broker Invariant
- Every public social media post, story, reel, reply, or destructive action MUST pause at the `PermissionBroker` before execution.
- Dispatches are paused until explicit approval is received via `POST /api/v1/approve/{task_id}` or user confirmation card.

## 3. Humanized Stealth Invariant
- All browser-based actions must route through the `StealthBrowserHumanizer` with randomized cubic bezier mouse curves and biological typing intervals.
- The Cooldown Circuit Breaker enforces maximum hourly action limits per channel to prevent shadowbans.

## 4. Agno OS & Subagent Invariant
- Routine executions route to fast models (`gemini-3.8-flash`), while deep strategic tasks route to reasoning tiers (`gemini-4-argon`).
- All skill executions chain foundation skills (`brand-profile` and `voice-builder`) before platform-specific instructions.
