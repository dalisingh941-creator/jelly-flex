import re
from pathlib import Path
from typing import Dict, List, Tuple


class DynamicSkillRegistry:
    """
    Clean-room implementation of OpenClaw's ClawHub SKILL.md loader & social-media-skills chaining.
    """

    DEFAULT_SKILLS: Dict[str, Tuple[str, str]] = {
        "brand-profile": (
            "Foundational brand voice, positioning, audience persona, and anti-slop rules.",
            "Always maintain authentic brand tone, avoid generic AI cliches, and verify factual claims.",
        ),
        "voice-builder": (
            "Sentence-level rhythm, vocabulary, and stylistic consistency engine.",
            "Write with punchy hooks, high scanability, and platform-native formatting.",
        ),
        "instagram-suite": (
            "Instagram Reels, Carousels, Stories, and Keyword SEO Specialist.",
            "Structure Reels with a 0-3s visual/verbal hook, retention beats every 5s, slide-by-slide carousel arcs, and searchable caption keywords.",
        ),
        "youtube-suite": (
            "YouTube Long-Form, Shorts, Thumbnail Briefs, and Metadata SEO Specialist.",
            "Provide CTR-optimized title variations, thumbnail visual contrast briefs, retention-mapped scripts, and timestamped SEO chapters.",
        ),
        "tiktok-suite": (
            "TikTok Short-Form Video, Photo Mode Carousels, and Trend-Matching Specialist.",
            "Lead with an immediate pattern-interrupt hook, conversational pacing, native text-overlay cues, and sound/trend alignment.",
        ),
        "x-twitter-suite": (
            "X (Twitter) High-Signal Threads, Timeline Reply Flywheel, and Trend-Jacking Specialist.",
            "Keep individual posts under 280 characters, eliminate hashtag spam, lead threads with a high-tension claim, and craft sharp contextual replies.",
        ),
        "linkedin-suite": (
            "LinkedIn B2B Authority Posts, Document Carousels, and Strategic Commenting Specialist.",
            "Win the 'see more' fold in the first 2 lines, use clean whitespace, share concrete operational metrics, and end with a discussion-driving question.",
        ),
        "threads-facebook-suite": (
            "Meta Threads Conversation Flywheel and Facebook Groups Community Specialist.",
            "Optimize for conversational reply chains on Threads and high-trust community discussion prompts for Facebook Groups.",
        ),
        "pinterest-reddit-suite": (
            "Pinterest Visual SEO & Reddit Subreddit-Native Advisory Specialist.",
            "For Pinterest: generate keyword-rich pin titles and vertical design briefs. For Reddit: write zero-fluff, value-first community posts that respect subreddit norms.",
        ),
        "research-outlier-miner": (
            "Multi-Platform Outlier Post Detector, Comment Miner, and 30-Day Viral Trend Researcher.",
            "Identify high-performing outlier formats, extract recurring audience pain points from comments, and synthesize cross-platform angles.",
        ),
        "hook-writer": (
            "High-Velocity Hook Engineering & Curiosity Gap Crafting Specialist.",
            "Craft 3-second pattern interrupts, eliminate passive language, and inject high-tension proof statements.",
        ),
        "content-calendar": (
            "Omni-Channel Scheduling & Cross-Platform Content Cadence Planner.",
            "Balance evergreen authority pillars with trending reactive topics across multi-platform release cadences.",
        ),
        "telegram-discord-suite": (
            "Community Channel Broadcast, Discord Webhook, and Real-Time Event Specialist.",
            "Format rich Markdown alerts for Telegram channels and construct structured Discord embed payloads with role tags.",
        ),
    }

    PLATFORM_SKILL_MAP = {
        "instagram": ["brand-profile", "voice-builder", "instagram-suite", "hook-writer"],
        "youtube": ["brand-profile", "voice-builder", "youtube-suite", "content-calendar"],
        "tiktok": ["brand-profile", "voice-builder", "tiktok-suite", "hook-writer"],
        "x": ["brand-profile", "voice-builder", "x-twitter-suite", "hook-writer"],
        "twitter": ["brand-profile", "voice-builder", "x-twitter-suite", "hook-writer"],
        "linkedin": ["brand-profile", "voice-builder", "linkedin-suite", "content-calendar"],
        "threads": ["brand-profile", "voice-builder", "threads-facebook-suite"],
        "facebook": ["brand-profile", "voice-builder", "threads-facebook-suite"],
        "pinterest": ["brand-profile", "voice-builder", "pinterest-reddit-suite"],
        "reddit": ["brand-profile", "voice-builder", "pinterest-reddit-suite", "research-outlier-miner"],
        "telegram": ["brand-profile", "voice-builder", "telegram-discord-suite"],
        "discord": ["brand-profile", "voice-builder", "telegram-discord-suite"],
    }

    def __init__(self, skills_root: str = "skills"):
        self.skills_root = Path(skills_root)
        self.skills_root.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, Dict[str, str]] = {}
        self._ensure_default_skills()
        self.reload_skills()

    def _ensure_default_skills(self) -> None:
        for skill_id, (desc, body) in self.DEFAULT_SKILLS.items():
            skill_dir = self.skills_root / skill_id
            skill_file = skill_dir / "SKILL.md"
            if not skill_file.exists():
                skill_dir.mkdir(parents=True, exist_ok=True)
                skill_file.write_text(
                    f"---\nname: {skill_id}\ndescription: {desc}\n---\n# {skill_id}\n{body}\n",
                    encoding="utf-8",
                )

    def reload_skills(self) -> Dict[str, Dict[str, str]]:
        self._cache.clear()
        for skill_file in self.skills_root.glob("*/SKILL.md"):
            skill_id = skill_file.parent.name
            raw_text = skill_file.read_text(encoding="utf-8")
            meta, body = self._parse_frontmatter(raw_text)
            self._cache[skill_id] = {
                "id": skill_id,
                "name": meta.get("name", skill_id),
                "description": meta.get("description", f"Inbuilt skill for {skill_id}"),
                "instructions": body.strip(),
            }
        return self._cache

    @staticmethod
    def _parse_frontmatter(content: str) -> Tuple[Dict[str, str], str]:
        match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
        if not match:
            return {}, content
        yaml_block, body = match.group(1), match.group(2)
        meta: Dict[str, str] = {}
        for line in yaml_block.splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip().strip('"').strip("'")
        return meta, body

    def compile_chained_instructions(self, target_channel: str) -> List[str]:
        channel_key = target_channel.lower().strip()
        chain = self.PLATFORM_SKILL_MAP.get(channel_key, ["brand-profile", "voice-builder"])
        return [
            f"### [ACTIVE SKILL: {self._cache[s]['name']}]\n{self._cache[s]['instructions']}"
            for s in chain
            if s in self._cache
        ]

    def list_available_skills(self) -> List[Dict[str, str]]:
        return [
            {"id": k, "name": v["name"], "description": v["description"]}
            for k, v in sorted(self._cache.items())
        ]
