# Postiz & TryPost — Omni-Channel Social Scheduler Reverse-Engineering Specification
**Framework:** REA (Reverse Engineer Anything) 5-Stage Clean-Room Methodology  
**Target:** gitroomhq/postiz-app & trypostit/trypost  

---

### 1. Token-Bucket Rate Limiting & Account Cooldowns
- **Target Files [SEEN]:** `apps/backend/src/services/queue.service.ts`, `packages/core/src/limiter.ts`
- **Architectural Findings [SEEN]:** Social media APIs enforce strict hourly and daily rate limits. Exceeding limits triggers shadowbans or account blocks.
- **Clean-Room Implementation [SEEN]:** `StealthBrowserHumanizer.check_account_safety_radar()` in `backend/apps_registry/stealth_browser.py` enforces sliding-window rate tracking (default 12 actions/hour).

---

### 2. Multi-Network Content Repurposing (1-to-11 Waterfall)
- **Target Files [SEEN]:** `apps/frontend/src/components/social-editor/`, `trypost/scheduler`
- **Architectural Findings [SEEN]:** Users submit one piece of cornerstone content, and the engine transforms it into platform-native variants:
  - Instagram: 4:5 Carousel slides + Reels hooks + caption SEO.
  - YouTube: 16:9 Chapters + CTR titles + Shorts scripts.
  - TikTok: 9:16 Pattern interrupt + Photo mode.
  - X: 280-char hook post + threaded expansion.
  - LinkedIn: "See more" fold-focused authority post.
  - Threads / Reddit: Conversation-starter questions and value-first breakdown.
- **Clean-Room Implementation [SEEN]:** `OmniChannelWaterfallEngine` in `backend/agents/content_waterfall.py`.
