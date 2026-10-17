import os
from typing import Dict, Any, Optional
from skills_engine.skill_loader import DynamicSkillRegistry

try:
    from agno.agent import Agent
    from agno.models.google import Gemini
    from agno.tools.duckduckgo import DuckDuckGoTools
    AGNO_AVAILABLE = True
except ImportError:
    AGNO_AVAILABLE = False


class JellyFlexOrchestrator:
    """
    Asynchronous multi-agent orchestrator powered by Agno SDK and DynamicSkillRegistry.
    Routes between fast execution tier (Gemini 3.8 Flash) and high reasoning tier (Gemini 4 Argon).
    """

    HIGH_COMPLEXITY_KEYWORDS = {
        "campaign", "strategy", "thread", "calendar", "audit",
        "reels", "youtube", "carousel", "competitor", "outlier",
        "reverse-engineering", "benchmark", "analysis"
    }

    def __init__(self, skills_root: str = "skills", api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.skill_registry = DynamicSkillRegistry(skills_root=skills_root)

    def select_tier(self, objective: str) -> str:
        tokens = set(objective.lower().split())
        if len(objective) > 180 or (tokens & self.HIGH_COMPLEXITY_KEYWORDS):
            return "high-thinking"
        return "low-thinking"

    async def process_automated_pipeline(self, objective: str, target_channel: str = "instagram") -> Dict[str, Any]:
        tier = self.select_tier(objective)
        chained_skills = self.skill_registry.compile_chained_instructions(target_channel)
        active_skill_ids = self.skill_registry.PLATFORM_SKILL_MAP.get(
            target_channel.lower(), ["brand-profile", "voice-builder"]
        )

        if AGNO_AVAILABLE and self.api_key:
            model_id = "gemini-4-argon" if tier == "high-thinking" else "gemini-3.8-flash"
            try:
                agent = Agent(
                    name=f"JellyFlex {target_channel.capitalize()} Specialist",
                    model=Gemini(id=model_id, api_key=self.api_key),
                    tools=[DuckDuckGoTools()],
                    instructions=[
                        f"Target Platform: {target_channel.upper()}.",
                        "Never expose raw API keys or unencrypted tokens.",
                        *chained_skills,
                    ],
                    markdown=True,
                )
                response = await agent.arun(objective)
                content = response.content if hasattr(response, "content") else str(response)
            except Exception as e:
                content = (
                    f"[{target_channel.upper()} Clean-Room Fallback | Tier: {tier}]\n"
                    f"Objective: {objective}\n"
                    f"Execution Notice: LLM API call fallback ({e}).\n"
                    f"Applied Skills: {', '.join(active_skill_ids)}"
                )
        else:
            content = (
                f"[{target_channel.upper()} Clean-Room Synthesized Draft | Tier: {tier}]\n\n"
                f"Hook (0-3s): 99% of developers miss this clean-room architectural pattern—here is the verified benchmark.\n\n"
                f"Value Delivery:\n"
                f"- Isolated worker execution with 30s shutdown budget\n"
                f"- Hardware-locked PBKDF2HMAC Fernet state preservation\n"
                f"- Omni-channel lane serialization\n\n"
                f"Active Skills Chained: {', '.join(active_skill_ids)}\n"
                f"Objective Handled: {objective}"
            )

        return {
            "channel": target_channel.lower(),
            "selected_tier": tier,
            "active_skills": active_skill_ids,
            "content": content,
        }
