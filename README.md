# 🪼 JellyFlex 2.0 — The Sovereign Multi-Agent AI Suite & Autonomous Social Operator

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/dalisingh941-creator/jelly-flex?style=for-the-badge&logo=github&color=FF6B6B)](https://github.com/dalisingh941-creator/jelly-flex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&logo=opensourceinitiative)](LICENSE)
[![Framework: Agno OS 3.1](https://img.shields.io/badge/Agno%20OS-3.1%20Core-indigo?style=for-the-badge&logo=python)](https://agno.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Desktop: Electron](https://img.shields.io/badge/Desktop-Electron%20%2B%20NSIS-4B5563?style=for-the-badge&logo=electron)](electron/)
[![Architecture: Clean Room REA](https://img.shields.io/badge/Reverse%20Engineered-REA%20v6.5-06B6D4?style=for-the-badge)](https://github.com/morluto/rea)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

<br/>

<img src="frontend/public/brand-mascot.png" alt="JellyFlex 2.0 Official 3D Voxel Mascot" width="220" style="border-radius: 32px; filter: drop-shadow(0 20px 30px rgba(99, 102, 241, 0.35));" />

### *100% Local-First. Zero Subscription Fees. Bring Your Own Keys (BYOK).*
### *Reverse-Engineered from the Best of OpenClaw 2.0, CUE by Manus, and Claude Desktop.*

<p align="center">
  <a href="#-quick-download--installation">Quick Download</a> •
  <a href="#-why-jellyflex-vs-the-world">Why JellyFlex?</a> •
  <a href="#-the-squad-system">The Squad System</a> •
  <a href="#-stealth-browser--social-automation">Stealth Browser</a> •
  <a href="#-security--vault">Zero-Knowledge Vault</a> •
  <a href="#-contributing--license">License</a>
</p>

</div>

---

## ⚡ What is JellyFlex?

**JellyFlex 2.0** is the world's first **fully conversational, zero-dashboard, autonomous multi-agent operating suite**. Built for creators, founders, and engineers tired of paying $80–$200/month for cloud wrappers and cluttered dashboards, JellyFlex gives you:

1. **WhatsApp/Slack-Style Multi-Agent Squads**: Multiple specialist agents debate, divide tasks, and execute in a single unified group chat.
2. **Autonomous Social Media Automation**: End-to-end Instagram Reels, Carousels, Stories, DMs, YouTube Shorts, X Threads, and LinkedIn growth.
3. **Isolated Virtual Browser Sandbox**: Playwright-powered anti-detect browser with biological human jitter (Bézier curves, organic typing delays, and session persistence).
4. **Hardware-Locked BYOK Sovereignty**: Your API keys are encrypted on your local machine using PBKDF2HMAC (480,000 rounds) + Fernet AES-128. No cloud servers ever see your keys.
5. **No Emojis, No Slop**: Ultra-minimalist, editorial design system inspired by Anthropic Claude and Cue by Manus.

---

## 🚀 Quick Download & Installation

### Option 1: 1-Click Windows Setup (Easiest for Users)

1. Download the repository as a ZIP from GitHub:
   - Click **`Code` ➔ `Download ZIP`** above, or [Click Here to Download](https://github.com/dalisingh941-creator/jelly-flex/archive/refs/heads/master.zip).
2. Extract the ZIP file to your folder of choice.
3. Simply **double-click** the setup file:
   ```cmd
   setup_installer.bat
   ```
4. The setup will automatically:
   - Verify Python & Node.js
   - Set up the isolated `.venv` environment
   - Install Agno OS & FastAPI dependencies
   - Build the Next.js companion workspace
   - Launch your native desktop application!

---

### Option 2: Build Standalone Windows `.exe` Installer

Want a native Windows installer (`JellyFlex-Setup-2.0.0.exe`) with a desktop shortcut and start menu entry?

Run this single command in PowerShell:
```powershell
.\setup_installer.ps1 -BuildInstaller
```
Your compiled `.exe` installer will be waiting in `electron/dist/`!

---

### Option 3: Developer Git Setup (Mac, Linux & Windows)

```bash
# 1. Clone the repository
git clone https://github.com/dalisingh941-creator/jelly-flex.git
cd jelly-flex

# 2. Run automated verification test suite (19/19 passing)
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r backend/requirements.txt
pytest backend/tests/ -v

# 3. Start the Backend API (FastAPI + Agno OS)
python backend/main.py
# Running at http://127.0.0.1:8000 (Swagger docs at /docs)

# 4. In a second terminal, start the Next.js Companion UI
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

---

### Option 4: Docker Compose (1-Command Full Stack)

```bash
docker-compose up -d --build
```
Access the application instantly at `http://localhost:3000`.

---

## 🔑 Single-Time Community Invite Code

To eliminate complex registration and third-party login servers, JellyFlex ships with an open-source single-time invite gate:

```text
Community Access Code: JELLYFLEX-COMMUNITY-2026
```

- **Enter once on first launch** — verified locally in your encrypted SQLite database.
- **Never asked again** — the app permanently unlocks and remembers your machine.

---

## 📊 Why JellyFlex? (Comparison vs. The World)

| Feature | JellyFlex 2.0 | OpenClaw 2.0 | Cue by Manus | CrewAI / AutoGen |
| :--- | :---: | :---: | :---: | :---: |
| **Pricing** | **100% Free & Open Source** | Open Source | Paid SaaS ($40+/mo) | Open Source / Cloud |
| **User Experience** | **Conversational Squad Chat** | Terminal / Monorepo | Chat + Sandboxed Web | Code / Terminal |
| **API Keys** | **100% BYOK Sovereignty** | BYOK | Cloud Custodial | BYOK |
| **1-Click Windows Setup** | ✅ **`setup_installer.bat`** | ❌ Complex pnpm setup | ❌ Cloud only | ❌ Python setup only |
| **Anti-Detect Stealth Browser** | ✅ **Bézier Jitter & DOM Radar** | ✅ Playwright | ✅ Remote Cloud VM | ❌ Basic Scraping |
| **Social Media Skills Engine** | ✅ **106+ Pre-Bundled Skills** | ❌ Generic skills | ❌ Web-only | ❌ Manual Prompts |
| **Pre-Publish Viral Simulator** | ✅ **Built-in (0–100 Hook Score)** | ❌ No | ❌ No | ❌ No |
| **Zero Emojis / Clean UI** | ✅ **Anthropic / Cue Editorial** | ❌ Cluttered | ⚠️ Custom UI | ❌ Generic Streamlit |
| **Local Machine Footprint** | ✅ **< 8 MB Source Code** | ⚠️ ~350 MB | ❌ Cloud Lock-in | ⚠️ Heavy |

---

## 👥 The Squad System: Multi-Agent Group Chats

Unlike old-school AI agents that operate alone, JellyFlex introduces **Autonomous Squads** where multiple AI agents converse and hand off tasks like a real team on WhatsApp or Slack:

```
                      ┌───────────────────────┐
                      │      USER PROMPT      │
                      └───────────┬───────────┘
                                  │
                                  ▼
                     [Omni-Channel Launch Squad]
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[Scout — Researcher]      [Volt — Copy Chief]      [Aura — IG Strategist]
- Scrapes viral outliers  - Takes Scout's data     - Formats into 10-slide
- Checks competitor hooks - Generates 3 hooks       visual carousel & Reel
- Stealth browser test    - Scored 94/100 viral    - Optimizes IG SEO tags
```

### 🧠 Pre-Configured Specialist Agents:
* 🔍 **Scout (`agent-scout`)** — *Research & Outlier Scout*: Mines 30-day viral trends, audience sentiment, and competitor teardowns.
* ✨ **Aura (`agent-aura`)** — *Instagram & Visual Strategist*: 0–3s retention curves, 10-slide carousel storyboarding, Reels formatting, and SEO.
* ⚡ **Volt (`agent-volt`)** — *Viral Hook & Copy Chief*: High-CTR hooks, irresistible curiosity gaps, and shadowban avoidance.
* 💻 **Cipher (`agent-cipher`)** — *Code & Automation Engineer*: Clean-room engineering, local API bridges, and autonomous scripts.
* ➕ **Custom Agent Studio**: Create your own agents with custom personas, system prompts, model selection, and memory spaces!

---

## 🛡️ Stealth Browser & Social Automation Engine

JellyFlex features a clean-room anti-detect browser pool (`backend/apps_registry/stealth_browser.py`) designed to interact with modern social networks safely:
* **Humanized Bézier Mouse Movement**: Non-linear cursor curves simulating biological human hands.
* **Typing Jitter**: Variable keystroke speed (70–180ms) with realistic typing pauses.
* **Account Safety Radar**: Pre-flight checks before executing DMs, post actions, or carousel publishing.
* **Human-in-the-Loop Permission Broker**: Real-time approval cards (`Allow` / `Deny`) for sensitive actions before anything goes live.

---

## 🔐 Zero-Knowledge Security & Hardware Vault

Your security and privacy are non-negotiable:
* **Hardware-Bound Derivation**: Cryptographic key generated locally from your motherboard UUID + CPU serial using `PBKDF2HMAC` (480,000 rounds).
* **Fernet AES-128 Encryption**: All BYOK keys (Gemini, OpenAI, Anthropic Claude, Grok, Instagram Graph API) are stored encrypted in a local SQLite database (`backend/database/secure_state.db`).
* **DoD 5220.22-M 3-Pass Shredder**: Uninstaller scripts (`uninstall_jellyflex.bat` and `uninstall_jellyflex.ps1`) cryptographically overwrite and shred data before deletion.

---

## 📁 Repository Specifications

* **Source Code Size**: **6.22 MB** (ultra-clean, zero dependency bloat)
* **Total Size with Git History**: **7.52 MB**
* **Test Coverage**: **19/19 passing automated tests** (`pytest`)
* **Frontend Build**: **Next.js 15 App Router (0 TypeScript/Lint errors)**
* **Desktop Wrapper**: **Electron v30+ with NSIS Packager**

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Commercial Rights

Distributed under the **MIT License**.

```text
MIT License

Copyright (c) 2026 JellyFlex Contributors & dalisingh941-creator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Free for personal, commercial, and enterprise usage. You own 100% of your data and code.**

---

<div align="center">
  <sub>Built with ❤️ by creators, for creators. Star ⭐ this repository if you find JellyFlex empowering!</sub>
</div>
