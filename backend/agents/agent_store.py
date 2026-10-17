import os
import sqlite3
import json
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path


DEFAULT_AGENTS = [
    {
        "id": "agent-scout",
        "name": "Scout",
        "role": "Research & Outlier Scout",
        "color": "#06b6d4",  # Cyan
        "badge_bg": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        "avatar_symbol": "🔍",
        "model": "gemini-2.0-flash",
        "persona": "Analytical, data-driven scout that mines 30-day viral trend outliers, audience sentiment, and competitor teardowns.",
        "instructions": (
            "You are Scout, the Research & Outlier Scout in JellyFlex. "
            "Your superpower is finding 3x-10x viral outlier content, extracting data-backed patterns, "
            "and providing audience objection analyses. Always cite trends, metrics, and actionable evidence. "
            "Never use robotic corporate jargon."
        ),
        "tools": ["DuckDuckGo Search", "Outlier Trend Miner", "Google Drive Cipher"],
        "starters": [
            "Mine top 30-day viral AI automation outliers on Reddit and X",
            "Perform competitor teardown on top 5 creator growth tools",
            "Analyze audience objections for open-source AI desktop apps",
        ],
    },
    {
        "id": "agent-aura",
        "name": "Aura",
        "role": "Instagram & Visual Strategist",
        "color": "#ec4899",  # Pink
        "badge_bg": "bg-pink-500/10 text-pink-400 border-pink-500/30",
        "avatar_symbol": "✨",
        "model": "gemini-2.0-flash",
        "persona": "Aesthetic director and retention architect specializing in 0-3s hook velocity, 10-slide carousel storyboarding, and IG SEO.",
        "instructions": (
            "You are Aura, the Instagram & Visual Strategist in JellyFlex. "
            "You engineer visual retention curves, 0-3s pattern interrupts, 10-slide carousel outlines, "
            "and searchable IG keyword captions. Focus on high visual appeal and creator pacing."
        ),
        "tools": ["Instagram Suite", "Hook Writer", "Visual Carousel Briefs"],
        "starters": [
            "Draft a 10-slide carousel breaking down clean-room architecture",
            "Generate 3 viral 0-3s retention hooks for a coding workflow Reel",
            "Optimize an Instagram caption with high-volume searchable keywords",
        ],
    },
    {
        "id": "agent-volt",
        "name": "Volt",
        "role": "Viral Hook & Copy Chief",
        "color": "#f59e0b",  # Amber
        "badge_bg": "bg-amber-500/10 text-amber-400 border-amber-500/30",
        "avatar_symbol": "⚡",
        "model": "gemini-2.0-flash",
        "persona": "Sharp, provocative copywriter that transforms complex concepts into high-CTR hooks, threads, and viral scripts.",
        "instructions": (
            "You are Volt, the Viral Hook & Copy Chief in JellyFlex. "
            "You specialize in high-tension hooks, high-CTR storytelling, and shadowban avoidance. "
            "Keep copy crisp, punchy, and irresistible to scroll past."
        ),
        "tools": ["Viral Simulator", "Shadowban Radar", "X-Twitter Suite"],
        "starters": [
            "Write an 8-tweet viral thread with an irresistible curiosity gap",
            "Audit my hook draft and calculate its viral retention score",
            "Draft a YouTube title and chapter hook package",
        ],
    },
    {
        "id": "agent-cipher",
        "name": "Cipher",
        "role": "Code & Automation Engineer",
        "color": "#8b5cf6",  # Indigo/Purple
        "badge_bg": "bg-purple-500/10 text-purple-400 border-purple-500/30",
        "avatar_symbol": "💻",
        "model": "gemini-2.0-flash",
        "persona": "Precise full-stack software engineer specializing in clean-room reverse engineering, local APIs, and automation scripts.",
        "instructions": (
            "You are Cipher, the Code & Automation Engineer in JellyFlex. "
            "You write robust, clean-room compliant code, design zero-knowledge encryption routines, "
            "and build autonomous Python, FastAPI, Next.js, and Electron pipelines."
        ),
        "tools": ["REA Clean-Room Engine", "Hardware Fernet Vault", "Agno OS Workflows"],
        "starters": [
            "Generate an autonomous Python script to sync local state with Fernet encryption",
            "Explain the 7 OpenClaw clean-room subsystems implemented in JellyFlex",
            "Write a FastAPI endpoint with rate limiting and SSE streaming",
        ],
    },
]

DEFAULT_SQUADS = [
    {
        "id": "squad-omni",
        "name": "Omni-Channel Launch Squad",
        "description": "Cross-functional team coordinating research, copy, visual strategy, and distribution in real-time.",
        "member_ids": ["agent-scout", "agent-volt", "agent-aura", "agent-cipher"],
        "starters": [
            "Plan a 360-degree product launch across Instagram, X, and YouTube",
            "Take our new AI feature and develop research, hooks, visuals, and code specs",
            "Debate the best viral growth tactic for open-source AI desktop tools",
        ],
    },
    {
        "id": "squad-content",
        "name": "Viral Research & Copy Team",
        "description": "Fast-turnaround squad focused on outlier trend intelligence and rapid hook drafting.",
        "member_ids": ["agent-scout", "agent-volt"],
        "starters": [
            "Find today's trending tech debate and draft 3 provocative angles",
            "Analyze why recent AI developer videos went viral and write our own version",
        ],
    },
]


class AgentManagerStore:
    """
    Manages custom and pre-configured agents, custom squads, and isolated chat memory
    stored persistently in SQLite.
    """

    def __init__(self, db_path: str = "backend/database/secure_state.db"):
        self.db_path = str(Path(db_path).resolve())
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS agents (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    color TEXT NOT NULL,
                    badge_bg TEXT NOT NULL,
                    avatar_symbol TEXT NOT NULL,
                    model TEXT NOT NULL,
                    persona TEXT NOT NULL,
                    instructions TEXT NOT NULL,
                    tools_json TEXT NOT NULL,
                    starters_json TEXT NOT NULL,
                    is_custom INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS squads (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    member_ids_json TEXT NOT NULL,
                    starters_json TEXT NOT NULL,
                    is_custom INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    sender_id TEXT NOT NULL,
                    sender_name TEXT NOT NULL,
                    sender_role TEXT NOT NULL,
                    sender_color TEXT NOT NULL,
                    sender_avatar TEXT NOT NULL,
                    is_agent INTEGER DEFAULT 1,
                    text TEXT NOT NULL,
                    thought_process_json TEXT,
                    tools_used_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()

            # Seed default agents if not present
            for agent in DEFAULT_AGENTS:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO agents 
                    (id, name, role, color, badge_bg, avatar_symbol, model, persona, instructions, tools_json, starters_json, is_custom)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                    """,
                    (
                        agent["id"],
                        agent["name"],
                        agent["role"],
                        agent["color"],
                        agent["badge_bg"],
                        agent["avatar_symbol"],
                        agent["model"],
                        agent["persona"],
                        agent["instructions"],
                        json.dumps(agent["tools"]),
                        json.dumps(agent["starters"]),
                    ),
                )

            # Seed default squads if not present
            for sq in DEFAULT_SQUADS:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO squads
                    (id, name, description, member_ids_json, starters_json, is_custom)
                    VALUES (?, ?, ?, ?, ?, 0)
                    """,
                    (
                        sq["id"],
                        sq["name"],
                        sq["description"],
                        json.dumps(sq["member_ids"]),
                        json.dumps(sq["starters"]),
                    ),
                )
            conn.commit()
        finally:
            conn.close()

    def list_agents(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        try:
            rows = conn.execute("SELECT * FROM agents ORDER BY is_custom ASC, created_at ASC").fetchall()
            agents = []
            for r in rows:
                agents.append({
                    "id": r[0],
                    "name": r[1],
                    "role": r[2],
                    "color": r[3],
                    "badge_bg": r[4],
                    "avatar_symbol": r[5],
                    "model": r[6],
                    "persona": r[7],
                    "instructions": r[8],
                    "tools": json.loads(r[9]),
                    "starters": json.loads(r[10]),
                    "is_custom": bool(r[11]),
                })
            return agents
        finally:
            conn.close()

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        try:
            r = conn.execute("SELECT * FROM agents WHERE id = ?", (agent_id,)).fetchone()
            if not r:
                return None
            return {
                "id": r[0],
                "name": r[1],
                "role": r[2],
                "color": r[3],
                "badge_bg": r[4],
                "avatar_symbol": r[5],
                "model": r[6],
                "persona": r[7],
                "instructions": r[8],
                "tools": json.loads(r[9]),
                "starters": json.loads(r[10]),
                "is_custom": bool(r[11]),
            }
        finally:
            conn.close()

    def create_custom_agent(self, data: Dict[str, Any]) -> Dict[str, Any]:
        agent_id = f"agent-custom-{uuid.uuid4().hex[:6]}"
        name = data.get("name", "Custom Agent").strip()
        role = data.get("role", "Specialist").strip()
        color = data.get("color", "#6366f1")
        badge_bg = f"bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
        avatar_symbol = data.get("avatar_symbol", "🤖")
        model = data.get("model", "gemini-2.0-flash")
        persona = data.get("persona", f"{name} is an autonomous specialist agent.")
        instructions = data.get("instructions", "Assist the user cleanly and authoritatively.")
        tools = data.get("tools", ["Search", "Reasoning"])
        starters = data.get("starters", [f"How can {name} assist with your workflow?"])

        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT INTO agents
                (id, name, role, color, badge_bg, avatar_symbol, model, persona, instructions, tools_json, starters_json, is_custom)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                """,
                (
                    agent_id,
                    name,
                    role,
                    color,
                    badge_bg,
                    avatar_symbol,
                    model,
                    persona,
                    instructions,
                    json.dumps(tools),
                    json.dumps(starters),
                ),
            )
            conn.commit()
        finally:
            conn.close()

        return self.get_agent(agent_id)

    def list_squads(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        try:
            rows = conn.execute("SELECT * FROM squads ORDER BY is_custom ASC, created_at ASC").fetchall()
            squads = []
            for r in rows:
                squads.append({
                    "id": r[0],
                    "name": r[1],
                    "description": r[2],
                    "member_ids": json.loads(r[3]),
                    "starters": json.loads(r[4]),
                    "is_custom": bool(r[5]),
                })
            return squads
        finally:
            conn.close()

    def create_custom_squad(self, data: Dict[str, Any]) -> Dict[str, Any]:
        squad_id = f"squad-custom-{uuid.uuid4().hex[:6]}"
        name = data.get("name", "Custom Squad").strip()
        description = data.get("description", "Collaborative AI squad.")
        member_ids = data.get("member_ids", ["agent-scout", "agent-volt"])
        starters = data.get("starters", ["Collaborate on our next campaign objective"])

        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT INTO squads
                (id, name, description, member_ids_json, starters_json, is_custom)
                VALUES (?, ?, ?, ?, ?, 1)
                """,
                (squad_id, name, description, json.dumps(member_ids), json.dumps(starters)),
            )
            conn.commit()
        finally:
            conn.close()

        return {
            "id": squad_id,
            "name": name,
            "description": description,
            "member_ids": member_ids,
            "starters": starters,
            "is_custom": True,
        }

    def save_chat_message(
        self,
        conversation_id: str,
        sender_id: str,
        sender_name: str,
        sender_role: str,
        sender_color: str,
        sender_avatar: str,
        text: str,
        is_agent: bool = True,
        thought_process: Optional[List[str]] = None,
        tools_used: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        msg_id = f"msg-{uuid.uuid4().hex[:8]}"
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT INTO chat_messages
                (id, conversation_id, sender_id, sender_name, sender_role, sender_color, sender_avatar, is_agent, text, thought_process_json, tools_used_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    msg_id,
                    conversation_id,
                    sender_id,
                    sender_name,
                    sender_role,
                    sender_color,
                    sender_avatar,
                    1 if is_agent else 0,
                    text,
                    json.dumps(thought_process or []),
                    json.dumps(tools_used or []),
                ),
            )
            conn.commit()
        finally:
            conn.close()

        return {
            "id": msg_id,
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "sender_role": sender_role,
            "sender_color": sender_color,
            "sender_avatar": sender_avatar,
            "is_agent": is_agent,
            "text": text,
            "thought_process": thought_process or [],
            "tools_used": tools_used or [],
        }

    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        try:
            rows = conn.execute(
                """
                SELECT id, conversation_id, sender_id, sender_name, sender_role, sender_color, sender_avatar, is_agent, text, thought_process_json, tools_used_json, created_at
                FROM chat_messages
                WHERE conversation_id = ?
                ORDER BY created_at ASC
                """,
                (conversation_id,),
            ).fetchall()

            history = []
            for r in rows:
                history.append({
                    "id": r[0],
                    "conversation_id": r[1],
                    "sender_id": r[2],
                    "sender_name": r[3],
                    "sender_role": r[4],
                    "sender_color": r[5],
                    "sender_avatar": r[6],
                    "is_agent": bool(r[7]),
                    "text": r[8],
                    "thought_process": json.loads(r[9] or "[]"),
                    "tools_used": json.loads(r[10] or "[]"),
                    "created_at": r[11],
                })
            return history
        finally:
            conn.close()
