import os
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger("agno.os.system")

try:
    from agno.agent import Agent
    from agno.team import Team
    from agno.workflow import Workflow
    from agno.models.google import Gemini
    from agno.tools.duckduckgo import DuckDuckGoTools
    from agno.db.sqlite import SqliteDb
    from agno.os import AgentOS
    AGNO_OS_AVAILABLE = True
except ImportError as err:
    logger.warning(f"Agno OS full modules import notice: {err}")
    AGNO_OS_AVAILABLE = False


class AgnoOSCoreManager:
    """
    Production Agno OS Framework Integration Manager.
    Equips JellyFlex 2.0 with the full Agno OS operating system layer,
    including AgentOS application routes, multi-agent squads, workflows,
    and persistent Sqlite storage.
    """

    def __init__(self, db_path: str = "backend/data/agno_os.db", api_key: Optional[str] = None):
        self.db_path = db_path
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or "cleanroom-mock-key"
        self.db = None
        self.agents: List[Any] = []
        self.teams: List[Any] = []
        self.workflows: List[Any] = []
        self.agent_os: Optional[Any] = None
        self._initialized = False

        Path(os.path.dirname(self.db_path)).mkdir(parents=True, exist_ok=True)
        self._build_components()

    def _get_model(self, model_id: str = "gemini-2.0-flash"):
        if not AGNO_OS_AVAILABLE:
            return None
        return Gemini(id=model_id, api_key=self.api_key)

    def _build_components(self):
        if not AGNO_OS_AVAILABLE:
            return

        try:
            self.db = SqliteDb(db_file=self.db_path)
            model = self._get_model()

            tools = []
            try:
                tools = [DuckDuckGoTools()]
            except Exception:
                pass

            # 1. Instagram Specialist Agent
            ig_agent = Agent(
                id="jellyflex-instagram-specialist",
                name="JellyFlex Instagram Specialist",
                model=model,
                tools=tools,
                instructions=[
                    "Expert in 0-3 second hook velocity, 5-second retention pacing, 10-slide carousel architecture.",
                    "Generate high-CTR hooks, carousel slide breakdowns, and searchable keyword-dense captions.",
                    "Always output clean, structured, non-robotic copy.",
                ],
                markdown=True,
            )

            # 2. YouTube Specialist Agent
            yt_agent = Agent(
                id="jellyflex-youtube-specialist",
                name="JellyFlex YouTube Specialist",
                model=model,
                tools=tools,
                instructions=[
                    "Expert in long-form retention curves and high-retention 9:16 Shorts scripts.",
                    "Produce 3 high-CTR title variations (pattern interrupt, curiosity gap, bold claim).",
                    "Format full chapter breakdowns with timestamped hooks.",
                ],
                markdown=True,
            )

            # 3. TikTok Specialist Agent
            tiktok_agent = Agent(
                id="jellyflex-tiktok-specialist",
                name="JellyFlex TikTok Specialist",
                model=model,
                tools=tools,
                instructions=[
                    "Specialize in 0-2 second pattern interrupts, TikTok Photo Mode carousels, and audio-first pacing.",
                    "Ensure text overlays are positioned in the TikTok safe zone.",
                ],
                markdown=True,
            )

            # 4. X / Twitter Specialist Agent
            x_agent = Agent(
                id="jellyflex-x-specialist",
                name="JellyFlex X Specialist",
                model=model,
                tools=tools,
                instructions=[
                    "Master of 280-character high-density single posts and high-tension thread architecture.",
                    "Incorporate the Grok-style timeline reply flywheel and conversational debates.",
                ],
                markdown=True,
            )

            # 5. LinkedIn Specialist Agent
            li_agent = Agent(
                id="jellyflex-linkedin-specialist",
                name="JellyFlex LinkedIn Specialist",
                model=model,
                tools=tools,
                instructions=[
                    "Expert in 'See more' fold optimization (lines 1-2), B2B document carousel slide briefs.",
                    "Write authoritative thought-leadership copy without corporate cringe.",
                ],
                markdown=True,
            )

            # 6. Outlier Research & Trend Miner Agent
            research_agent = Agent(
                id="jellyflex-outlier-miner",
                name="JellyFlex Outlier Research Miner",
                model=model,
                tools=tools,
                instructions=[
                    "Mine 30-day viral trend outliers performing 3x-10x above median baseline.",
                    "Identify audience objection triggers and objection-rebuttal hooks.",
                ],
                markdown=True,
            )

            self.agents = [ig_agent, yt_agent, tiktok_agent, x_agent, li_agent, research_agent]

            # Agno OS Multi-Agent Team (OmniSocialSquad)
            omni_team = Team(
                id="jellyflex-omni-squad",
                name="JellyFlex Omni-Channel Squad",
                members=self.agents,
                model=model,
                instructions=[
                    "Coordinate across all social specialist agents to repurpose a single seed idea into 11 channel-optimized formats.",
                    "Ensure tone consistency while adapting to platform-specific algorithm mechanics.",
                ],
            )
            self.teams = [omni_team]

            # Agno OS Multi-Step Workflow
            waterfall_workflow = Workflow(
                id="jellyflex-waterfall-workflow",
                name="Omni-Channel Content Waterfall Workflow",
                description="Synthesizes and transforms a core idea into multi-channel native formats",
                db=self.db,
            )
            self.workflows = [waterfall_workflow]

        except Exception as e:
            logger.error(f"Error configuring Agno OS components: {e}")

    def mount_to_fastapi(self, app):
        """
        Mounts the full Agno OS operating system directly into the FastAPI application.
        """
        if not AGNO_OS_AVAILABLE:
            return app

        try:
            self.agent_os = AgentOS(
                id="jellyflex-agno-os",
                name="JellyFlex Agno OS",
                description="Clean-room local-first Agno OS omni-channel multi-agent operating system",
                version="2.0.0",
                agents=self.agents,
                teams=self.teams,
                workflows=self.workflows,
                db=self.db,
                base_app=app,
                on_route_conflict="preserve_base_app",
            )
            mounted_app = self.agent_os.get_app()
            self._initialized = True
            return mounted_app
        except Exception as exc:
            logger.error(f"Failed to mount Agno OS to FastAPI: {exc}")
            return app

    def update_gemini_key(self, new_key: str):
        self.api_key = new_key
        # Rebuild model on agents
        if AGNO_OS_AVAILABLE:
            new_model = self._get_model()
            for ag in self.agents:
                if hasattr(ag, "model"):
                    ag.model = new_model
            for tm in self.teams:
                if hasattr(tm, "model"):
                    tm.model = new_model

    def get_os_status(self) -> Dict[str, Any]:
        return {
            "status": "online" if self._initialized else "standby",
            "full_framework": "Agno OS Framework (AgentOS Core)",
            "agno_available": AGNO_OS_AVAILABLE,
            "registered_agents": [
                {
                    "id": getattr(a, "id", a.name),
                    "name": getattr(a, "name", "Specialist"),
                    "model": getattr(getattr(a, "model", None), "id", "gemini-2.0-flash"),
                }
                for a in self.agents
            ],
            "registered_teams": [
                {
                    "id": getattr(t, "id", t.name),
                    "name": getattr(t, "name", "Squad"),
                    "members_count": len(getattr(t, "members", [])),
                }
                for t in self.teams
            ],
            "registered_workflows": [
                {
                    "id": getattr(w, "id", w.name),
                    "name": getattr(w, "name", "Workflow"),
                }
                for w in self.workflows
            ],
            "db_backend": "SqliteDb (agno.db.sqlite.SqliteDb)",
        }
