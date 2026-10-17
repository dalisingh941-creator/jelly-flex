from typing import Dict, Any, List


class BaseSocialAdapter:
    def __init__(self, channel_name: str):
        self.channel_name = channel_name

    def validate_payload(self, payload: Dict[str, Any]) -> bool:
        return True

    async def dispatch(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


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


class OmniSocialRegistry:
    def __init__(self):
        self._adapters: Dict[str, BaseSocialAdapter] = {
            "instagram": InstagramAdapter(),
            "youtube": YouTubeAdapter(),
            "tiktok": TikTokAdapter(),
            "x": XTwitterAdapter(),
            "twitter": XTwitterAdapter(),
            "linkedin": LinkedInAdapter(),
        }

    def get_adapter(self, channel: str) -> BaseSocialAdapter:
        ch = channel.lower().strip()
        if ch not in self._adapters:
            # Fallback generic adapter
            return BaseSocialAdapter(ch)
        return self._adapters[ch]

    def list_supported_channels(self) -> List[str]:
        return list(self._adapters.keys())
