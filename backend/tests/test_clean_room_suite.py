import asyncio
import os
import sys
import tempfile
import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from security.fernet_vault import HardwareFernetVault
from security.gateway_guard import TrustedGatewayGuard
from security.byok_manager import BYOKVaultManager
from security.uninstaller_engine import CleanUninstallerAndShredder
from skills_engine.skill_loader import DynamicSkillRegistry
from agents.lane_queue import OpenClawLaneQueue
from agents.orchestrator import JellyFlexOrchestrator
from agents.viral_simulator import ViralHookAndShadowbanSimulator
from agents.content_waterfall import OmniChannelWaterfallEngine
from agents.cron_lease_manager import CronLeaseManager
from agents.antigravity_bridge import AntigravitySDKBridge
from apps_registry.stealth_browser import StealthBrowserHumanizer
from apps_registry.google_drive_sync import GoogleDriveCipherSync


def test_hardware_fernet_vault_roundtrip_and_doctor():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_file = os.path.join(tmpdir, "test_state.db")
        vault = HardwareFernetVault(db_path=db_file)
        assert vault.doctor_status["sqlite_integrity"] == "ok"

        secret_payload = '{"channel": "instagram", "caption": "Clean-room test"}'
        token = vault.save_encrypted_event("task-001", "instagram", secret_payload, fifo_seq=1)
        assert b"Clean-room test" not in token

        recovered = vault.load_decrypted_event("task-001")
        assert recovered == secret_payload


def test_dynamic_skill_registry_all_platforms():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        registry = DynamicSkillRegistry(skills_root=tmpdir)
        skills = registry.list_available_skills()
        assert len(skills) >= 13

        for platform in ["instagram", "youtube", "tiktok", "x", "linkedin", "threads", "reddit", "telegram", "discord", "pinterest"]:
            chained = registry.compile_chained_instructions(platform)
            assert len(chained) >= 3


@pytest.mark.asyncio
async def test_openclaw_lane_queue_and_orchestrator():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        queue = OpenClawLaneQueue(max_concurrent_lanes=4)
        orch = JellyFlexOrchestrator(skills_root=tmpdir)
        out = await queue.run_in_lane(
            lane_name="youtube",
            task_id="yt-101",
            coro_factory=lambda: orch.process_automated_pipeline(
                "Create a viral YouTube Shorts script and SEO chapter metadata",
                target_channel="youtube",
            ),
        )
        assert out["fifo_seq"] == 1
        assert out["result"]["selected_tier"] == "high-thinking"
        assert "youtube-suite" in out["result"]["active_skills"]


def test_viral_simulator_scoring():
    simulator = ViralHookAndShadowbanSimulator()

    # Good hook
    good_eval = simulator.evaluate_draft(
        "x",
        "How 99% of developers miss this clean-room architectural pattern.\n\nHere is the breakdown."
    )
    assert good_eval["viral_score"] >= 75
    assert len(good_eval["boosts"]) > 0

    # Bad hook with shadowban phrase
    bad_eval = simulator.evaluate_draft(
        "x",
        "https://example.com Follow for follow and dm me now for crypto giveaway!"
    )
    assert bad_eval["viral_score"] < 60
    assert len(bad_eval["shadowban_warnings"]) >= 2


@pytest.mark.asyncio
async def test_waterfall_engine():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        orch = JellyFlexOrchestrator(skills_root=tmpdir)
        waterfall = OmniChannelWaterfallEngine(orchestrator=orch)
        results = await waterfall.generate_waterfall(
            seed_idea="Clean-room reverse engineering with REA",
            channels=["instagram", "x", "linkedin"]
        )
        assert "instagram" in results
        assert "x" in results
        assert "linkedin" in results
        assert results["instagram"]["viral_audit"]["viral_score"] > 0


def test_byok_manager_write_only_masking():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_file = os.path.join(tmpdir, "secure_vault.db")
        vault = HardwareFernetVault(db_path=db_file)
        manager = BYOKVaultManager(vault=vault)

        saved = manager.save_provider_key("gemini", "AIzaSyD-1234567890abcdef", 30.0)
        assert saved["configured"] is True
        assert saved["masked_hint"] == "AIza••••••••cdef"
        assert "1234567890" not in saved["masked_hint"]

        # Decrypted key should be accessible internally only
        internal_key = manager.get_decrypted_key_internal("gemini")
        assert internal_key == "AIzaSyD-1234567890abcdef"


def test_cryptographic_file_shredder():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        test_file = Path(tmpdir) / "secret.env"
        test_file.write_text("SUPER_SECRET_API_KEY=xyz123", encoding="utf-8")
        assert test_file.exists()

        shredded = CleanUninstallerAndShredder.cryptographic_shred_file(test_file, passes=3)
        assert shredded is True
        assert not test_file.exists()


def test_stealth_browser_humanizer():
    humanizer = StealthBrowserHumanizer()
    curve = humanizer.generate_bezier_curve((0, 0), (500, 300), steps=20)
    assert len(curve) == 21
    assert curve[0] == (0.0, 0.0)
    assert curve[-1] == (500.0, 300.0)

    delays = humanizer.humanized_typing_delays("Hello, world!")
    assert len(delays) == len("Hello, world!")
    assert all(d > 0 for d in delays)

    radar = humanizer.check_account_safety_radar("instagram")
    assert radar["safe_to_proceed"] is True


@pytest.mark.asyncio
async def test_cron_lease_manager():
    manager = CronLeaseManager(default_lease_ttl=2.0)
    token1 = await manager.acquire_lease("job-sync")
    assert token1 is not None

    # Duplicate acquisition should fail while lease is active
    token2 = await manager.acquire_lease("job-sync")
    assert token2 is None

    # Release lease
    released = await manager.release_lease("job-sync", token1)
    assert released is True

    # Reacquisition should now succeed
    token3 = await manager.acquire_lease("job-sync")
    assert token3 is not None


def test_google_drive_cipher_sync():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_file = os.path.join(tmpdir, "secure_vault.db")
        vault = HardwareFernetVault(db_path=db_file)
        sync = GoogleDriveCipherSync(vault=vault)
        bundle = sync.export_encrypted_backup("task-test")
        assert bundle["zero_knowledge_verified"] is True
        assert bundle["ciphertext_length"] > 0


def test_antigravity_bridge():
    bridge = AntigravitySDKBridge(agents_dir=".agents", skills_root="skills")
    status = bridge.get_antigravity_runtime_status()
    assert status["sdk"] == "Google Antigravity 2.0 (AGY)"
    assert status["framework"] == "Agno OS Multi-Agent Core"


def test_fastapi_endpoints():
    from fastapi.testclient import TestClient
    from main import app

    client = TestClient(app)
    # Health endpoint
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "Agno OS" in data["framework"]

    # Antigravity status
    res = client.get("/api/v1/antigravity/status")
    assert res.status_code == 200
    assert res.json()["sdk"] == "Google Antigravity 2.0 (AGY)"

    # Skills endpoint
    res = client.get("/api/v1/skills")
    assert res.status_code == 200
    assert len(res.json()["skills"]) >= 10

    # Viral audit
    res = client.post("/api/v1/audit/viral-hook", json={
        "channel": "instagram",
        "content": "Why 99% of creators fail on Reels in 2026.\n\nHere is the real benchmark."
    })
    assert res.status_code == 200
    assert res.json()["viral_score"] >= 75

    # BYOK status
    res = client.get("/api/v1/security/byok/status")
    assert res.status_code == 200
    assert "providers" in res.json()

    # Panic lock & unlock cycle
    res = client.post("/api/v1/security/panic-lock")
    assert res.status_code == 200
    assert res.json()["status"] == "PANIC_LOCKED"

    res = client.post("/api/v1/security/panic-unlock")
    assert res.status_code == 200
    assert res.json()["status"] == "UNLOCKED"

    # REA summary endpoint
    res = client.get("/api/v1/rea/summary")
    assert res.status_code == 200
    assert "methodology" in res.json()

    # REA repo analysis endpoint
    res = client.get("/api/v1/rea/analyze/openclaw")
    assert res.status_code == 200
    assert res.json()["status"].upper() == "ANALYZED"

    # Encrypted backup export endpoint
    res = client.get("/api/v1/backup/export")
    assert res.status_code == 200
    assert res.json()["zero_knowledge_verified"] is True


@pytest.mark.asyncio
async def test_permission_broker_approval_lifecycle():
    from main import app, _run_task_lifecycle, AutomationTask, pending_approvals, vault

    task = AutomationTask(
        task_id="test-approval-task",
        target_channel="instagram",
        objective="Draft clean-room Instagram Reels hook",
        require_human_approval=True,
    )

    lifecycle_future = asyncio.create_task(_run_task_lifecycle(task))

    # Wait until task enters pending_approvals
    for _ in range(50):
        if "test-approval-task" in pending_approvals:
            break
        await asyncio.sleep(0.05)

    assert "test-approval-task" in pending_approvals
    gate = pending_approvals["test-approval-task"]
    assert gate.approved is False

    # Simulate user approval
    gate.approved = True
    gate.event.set()

    await asyncio.wait_for(lifecycle_future, timeout=5.0)
    assert "test-approval-task" not in pending_approvals

    # Verify state was saved to encrypted vault
    decrypted = vault.load_decrypted_event("test-approval-task")
    assert "test-approval-task" in decrypted


@pytest.mark.asyncio
async def test_permission_broker_denial_unblocks_immediately():
    from main import _run_task_lifecycle, AutomationTask, pending_approvals, vault

    task = AutomationTask(
        task_id="test-deny-task",
        target_channel="tiktok",
        objective="Draft test TikTok script to deny",
        require_human_approval=True,
    )

    lifecycle_future = asyncio.create_task(_run_task_lifecycle(task))

    for _ in range(50):
        if "test-deny-task" in pending_approvals:
            break
        await asyncio.sleep(0.05)

    assert "test-deny-task" in pending_approvals
    gate = pending_approvals["test-deny-task"]

    # Simulate user denial: set approved=False and signal event
    gate.approved = False
    gate.event.set()

    # Must unblock and complete within 1.0 second, NOT hang for 600s!
    await asyncio.wait_for(lifecycle_future, timeout=2.0)
    assert "test-deny-task" not in pending_approvals

    # Verify denied task was NOT written to vault as completed publish
    with pytest.raises(KeyError):
        vault.load_decrypted_event("test-deny-task")


@pytest.mark.asyncio
async def test_omni_social_adapters_all_channels():
    from apps_registry.omni_social_adapters import OmniSocialRegistry

    registry = OmniSocialRegistry()
    supported = registry.list_supported_channels()
    assert len(supported) >= 10

    for ch in ["instagram", "youtube", "tiktok", "x", "linkedin", "threads", "reddit", "pinterest", "telegram", "discord"]:
        adapter = registry.get_adapter(ch)
        payload = {"format": "standard", "content": "Clean-room test"}
        assert adapter.validate_payload(payload) is True
        result = await adapter.dispatch(payload)
        assert result["channel"] == ch
        assert "DISPATCHED" in result["status"]


def test_byok_orchestrator_dynamic_resolution():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_file = os.path.join(tmpdir, "vault.db")
        vault = HardwareFernetVault(db_path=db_file)
        byok = BYOKVaultManager(vault=vault)

        # Initially no key
        orch = JellyFlexOrchestrator(skills_root=tmpdir, byok_manager=byok)
        assert orch.get_effective_gemini_key() is None or orch.get_effective_gemini_key() == os.getenv("GEMINI_API_KEY")

        # Save key in vault
        byok.save_provider_key("gemini", "AIzaSyTestDynamicKey12345", 25.0)

        # Orchestrator should now dynamically resolve the key
        orch_with_vault = JellyFlexOrchestrator(skills_root=tmpdir, api_key=None, byok_manager=byok)
        # Clear env var temporarily for test
        old_env = os.environ.pop("GEMINI_API_KEY", None)
        try:
            assert orch_with_vault.get_effective_gemini_key() == "AIzaSyTestDynamicKey12345"
        finally:
            if old_env is not None:
                os.environ["GEMINI_API_KEY"] = old_env
