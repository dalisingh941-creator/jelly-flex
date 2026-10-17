import pytest
import os
import tempfile
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from security.invite_auth import InviteCodeAuthManager
from agents.agent_store import AgentManagerStore
from agents.multi_agent_coordinator import MultiAgentChatCoordinator
from agents.orchestrator import JellyFlexOrchestrator
from agents.viral_simulator import ViralHookAndShadowbanSimulator


def test_invite_code_authorization_lifecycle():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_path = os.path.join(tmpdir, "invite_test.db")
        auth_mgr = InviteCodeAuthManager(db_path=db_path)

        # Initially unauthorized
        assert auth_mgr.is_authorized() is False

        # Wrong code fails
        fail_res = auth_mgr.verify_and_authorize("WRONG-CODE-999")
        assert fail_res["success"] is False
        assert auth_mgr.is_authorized() is False

        # Valid community code succeeds permanently
        success_res = auth_mgr.verify_and_authorize("JELLYFLEX-COMMUNITY-2026")
        assert success_res["success"] is True
        assert success_res["permanent"] is True
        assert auth_mgr.is_authorized() is True

        # Re-instantiating auth manager should remember permanent authorization
        reloaded = InviteCodeAuthManager(db_path=db_path)
        assert reloaded.is_authorized() is True


def test_agent_store_and_custom_agent_creation():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_path = os.path.join(tmpdir, "agents_test.db")
        store = AgentManagerStore(db_path=db_path)

        agents = store.list_agents()
        assert len(agents) >= 4
        scout = store.get_agent("agent-scout")
        assert scout is not None
        assert scout["name"] == "Scout"
        assert "Research" in scout["role"]

        # Create custom agent
        custom = store.create_custom_agent({
            "name": "Nova",
            "role": "TikTok Sound Director",
            "color": "#10b981",
            "avatar_symbol": "🎵",
            "model": "gemini-2.0-flash",
            "persona": "Viral audio & sound curve curator.",
            "instructions": "Sync visual cuts to audio drop.",
        })
        assert custom["name"] == "Nova"
        assert custom["is_custom"] is True

        # Verify listing includes custom agent
        updated_list = store.list_agents()
        assert any(a["name"] == "Nova" for a in updated_list)


@pytest.mark.asyncio
async def test_multi_agent_coordinator_chat_and_squad():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_path = os.path.join(tmpdir, "chat_test.db")
        store = AgentManagerStore(db_path=db_path)
        orch = JellyFlexOrchestrator(skills_root=tmpdir)
        sim = ViralHookAndShadowbanSimulator()
        coord = MultiAgentChatCoordinator(store, orch, sim)

        # 1-on-1 chat with Scout
        reply = await coord.chat_one_on_one(
            agent_id="agent-scout",
            user_message="Analyze top viral patterns for open-source AI projects",
            conversation_id="conv-test-scout",
        )
        assert reply["sender_name"] == "Scout"
        assert len(reply["thought_process"]) > 0
        assert "Scout" in reply["text"] or "Intelligence" in reply["text"]

        # Check isolated history
        hist = store.get_conversation_history("conv-test-scout")
        assert len(hist) == 2  # 1 user + 1 agent
        assert hist[0]["sender_name"] == "You"
        assert hist[1]["sender_name"] == "Scout"

        # Squad group chat
        squad_replies = await coord.chat_squad_group(
            squad_id="squad-content",
            user_message="Draft hooks for our clean-room launch",
            conversation_id="conv-test-squad",
        )
        assert len(squad_replies) == 2  # Scout + Volt
        assert squad_replies[0]["sender_name"] == "Scout"
        assert squad_replies[1]["sender_name"] == "Volt"

        group_hist = store.get_conversation_history("conv-test-squad")
        assert len(group_hist) == 3  # 1 user + 2 agents
