from typing import Dict, Any, List


class BaseSocialAdapter:
    def __init__(self, channel_name: str):
        self.channel_name = channel_name

    def validate_payload(self, payload: Dict[str, Any]) -> bool:
        return True

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": self.channel_name,
            "format": payload.get("format", "standard"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "channel_type": "omni_social_clean_room",
        }


class InstagramAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("instagram")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "instagram",
            "format": payload.get("format", "reels"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "caption_keywords": ["ai", "clean-room", "reverse-engineering"],
        }


class YouTubeAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("youtube")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "youtube",
            "format": payload.get("format", "shorts"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "ctr_title": payload.get("title", "Clean-Room Reverse Engineering Benchmark"),
        }


class TikTokAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("tiktok")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "tiktok",
            "format": payload.get("format", "video"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "pattern_interrupt_hook": True,
        }


class XTwitterAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("x")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "x",
            "format": payload.get("format", "thread"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "timeline_flywheel": True,
        }


class LinkedInAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("linkedin")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "linkedin",
            "format": payload.get("format", "carousel"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "see_more_optimized": True,
        }


class ThreadsAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("threads")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "threads",
            "format": payload.get("format", "conversation"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "engagement_prompt": True,
        }


class RedditAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("reddit")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "reddit",
            "format": payload.get("format", "value_post"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "outlier_mined": True,
        }


class PinterestAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("pinterest")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "pinterest",
            "format": payload.get("format", "vertical_pin"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "visual_seo": True,
        }


class TelegramAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("telegram")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "telegram",
            "format": payload.get("format", "broadcast"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "markdown_formatted": True,
        }


class DiscordAdapter(BaseSocialAdapter):
    def __init__(self):
        super().__init__("discord")

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "channel": "discord",
            "format": payload.get("format", "webhook_embed"),
            "status": "DISPATCHED_TO_STEALTH_EMULATOR",
            "embed_ready": True,
        }


class OmniSocialRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseSocialAdapter] = {
            "instagram": InstagramAdapter(),
            "youtube": YouTubeAdapter(),
            "tiktok": TikTokAdapter(),
            "x": XTwitterAdapter(),
            "twitter": XTwitterAdapter(),
            "linkedin": LinkedInAdapter(),
            "threads": ThreadsAdapter(),
            "facebook": ThreadsAdapter(),
            "reddit": RedditAdapter(),
            "pinterest": PinterestAdapter(),
            "telegram": TelegramAdapter(),
            "discord": DiscordAdapter(),
        }

    def get_adapter(self, channel: str) -> BaseSocialAdapter:
        ch = channel.lower().strip()
        if ch not in self._adapters:
            return BaseSocialAdapter(ch)
        return self._adapters[ch]

    def list_supported_channels(self) -> List[str]:
        return list(self._adapters.keys())
