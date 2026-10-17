"""
Google Antigravity SDK & Agno OS Integration Bridge.
Connects Antigravity subagent specifications (.agents/agents/*.md)
with the local Agno OS framework and FastAPI Trusted Gateway.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from skills_engine.skill_loader import DynamicSkillRegistry


class AntigravitySubagentSpec:
    def __init__(self, name: str, description: str, tools: List[str], model: str, policy: str):
        self.name = name
        self.description = description
        self.tools = tools
        self.model = model
        self.policy = policy


class AntigravitySDKBridge:
    """
    Binds Google Antigravity SDK configuration and subagents with the JellyFlex Agno OS core.
    """

    def __init__(self, agents_dir: str = ".agents", skills_root: str = "skills"):
        self.agents_dir = Path(agents_dir)
        self.skill_registry = DynamicSkillRegistry(skills_root=skills_root)
        self.subagents: Dict[str, AntigravitySubagentSpec] = {}
        self.load_subagents()

    def load_subagents(self) -> Dict[str, AntigravitySubagentSpec]:
        agents_subpath = self.agents_dir / "agents"
        if not agents_subpath.exists():
            return self.subagents

        for md_file in agents_subpath.glob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            meta, _ = DynamicSkillRegistry._parse_frontmatter(content)
            name = meta.get("name", md_file.stem)
            self.subagents[name] = AntigravitySubagentSpec(
                name=name,
                description=meta.get("description", ""),
                tools=meta.get("tools", "").split(", ") if isinstance(meta.get("tools"), str) else ["run_command"],
                model=meta.get("model", "pro"),
                policy=meta.get("commandExecutionPolicy", "eager"),
            )
        return self.subagents

    def get_antigravity_runtime_status(self) -> Dict[str, Any]:
        return {
            "sdk": "Google Antigravity 2.0 (AGY)",
            "framework": "Agno OS Multi-Agent Core",
            "registered_subagents": [
                {
                    "name": s.name,
                    "description": s.description,
                    "model": s.model,
                    "policy": s.policy,
                }
                for s in self.subagents.values()
            ],
            "hooks_configured": (self.agents_dir / "hooks.json").exists(),
            "security_rules_enforced": (self.agents_dir / "rules" / "clean-room-security.md").exists(),
        }
