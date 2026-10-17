import asyncio
from typing import Dict, Any, List, Optional
from agents.orchestrator import JellyFlexOrchestrator
from agents.viral_simulator import ViralHookAndShadowbanSimulator


class OmniChannelWaterfallEngine:
    """
    Transforms 1 core idea into platform-native drafts across Instagram, YouTube,
    TikTok, X, LinkedIn, Threads, Reddit, Pinterest, Telegram, and Discord concurrently.
    """

    DEFAULT_WATERFALL_CHANNELS = [
        "instagram",
        "youtube",
        "tiktok",
        "x",
        "linkedin",
        "threads",
        "reddit",
        "pinterest",
        "telegram",
        "discord",
    ]

    def __init__(self, orchestrator: JellyFlexOrchestrator):
        self.orchestrator = orchestrator
        self.simulator = ViralHookAndShadowbanSimulator()

    async def generate_waterfall(
        self, seed_idea: str, channels: Optional[List[str]] = None
    ) -> Dict[str, Dict[str, Any]]:
        target_channels = channels or self.DEFAULT_WATERFALL_CHANNELS

        async def _build_for_channel(ch: str) -> tuple[str, Dict[str, Any]]:
            draft_out = await self.orchestrator.process_automated_pipeline(
                objective=f"Repurpose this core idea natively for {ch.upper()}: {seed_idea}",
                target_channel=ch,
            )
            audit = self.simulator.evaluate_draft(ch, draft_out["content"])
            return ch, {**draft_out, "viral_audit": audit}

        pairs = await asyncio.gather(*[_build_for_channel(c) for c in target_channels])
        return dict(pairs)
