import os
import tempfile
import time
import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from security.master_auth import MasterAuthManager
from fastapi.testclient import TestClient
from main import app, master_auth


def test_master_auth_manager_lifecycle():
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmpdir:
        db_path = os.path.join(tmpdir, "test_auth.db")
        mgr = MasterAuthManager(db_path=db_path, auto_lock_seconds=2)

        # 1. Initial state
        assert mgr.is_setup() is False
        assert mgr.is_unlocked() is False
        status = mgr.get_status()
        assert status["is_setup"] is False
        assert status["is_unlocked"] is False

        # 2. Setup with valid passcode
        setup_res = mgr.setup_passcode("secret1234")
        assert setup_res["status"] == "setup_complete"
        assert setup_res["is_setup"] is True
        token = setup_res["session_token"]
        assert len(token) == 64
        assert len(setup_res["recovery_seed"].split()) == 12
        assert mgr.is_setup() is True
        assert mgr.is_unlocked(token) is True

        # 3. Lock vault
        lock_res = mgr.lock()
        assert lock_res["status"] == "locked"
        assert mgr.is_unlocked() is False
        assert mgr.is_unlocked(token) is False

        # 4. Login with wrong passcode fails
        bad_login = mgr.login("wrongpass")
        assert bad_login["status"] == "error"
        assert mgr.is_unlocked() is False

        # 5. Login with right passcode succeeds
        good_login = mgr.login("secret1234")
        assert good_login["status"] == "authenticated"
        assert good_login["is_unlocked"] is True
        new_token = good_login["session_token"]
        assert mgr.is_unlocked(new_token) is True

        # 6. Auto-lock on inactivity
        time.sleep(2.2)
        assert mgr.validate_session(new_token) is False
        assert mgr.is_unlocked() is False

        # 7. Recovery with seed
        recovery_seed = setup_res["recovery_seed"]
        rec_res = mgr.recover_with_seed(recovery_seed, "newSecretPass999")
        assert rec_res["status"] == "recovered"
        assert mgr.is_unlocked() is True

        # New passcode works, old passcode fails
        mgr.lock()
        assert mgr.login("secret1234")["status"] == "error"
        assert mgr.login("newSecretPass999")["status"] == "authenticated"


def test_fastapi_master_auth_endpoints():
    client = TestClient(app)

    # Health endpoints
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert "status" in res_health.json()

    res_api_health = client.get("/api/v1/health")
    assert res_api_health.status_code == 200
    assert "status" in res_api_health.json()

    # Reset master_auth for clean test
    master_auth.reset_for_testing()

    # 1. Check initial status
    status_res = client.get("/api/v1/auth/status")
    assert status_res.status_code == 200
    assert status_res.json()["is_setup"] is False

    # 2. Setup passcode
    setup_payload = {"passcode": "masterpass987", "confirm_passcode": "masterpass987"}
    setup_res = client.post("/api/v1/auth/setup", json=setup_payload)
    assert setup_res.status_code == 200
    data = setup_res.json()
    assert data["status"] == "setup_complete"
    token = data["session_token"]
    seed = data["recovery_seed"]
    assert len(seed.split()) == 12

    # 3. Status with Bearer token
    status_auth = client.get("/api/v1/auth/status", headers={"Authorization": f"Bearer {token}"})
    assert status_auth.status_code == 200
    assert status_auth.json()["is_setup"] is True
    assert status_auth.json()["is_unlocked"] is True

    # 4. Lock vault
    lock_res = client.post("/api/v1/auth/lock")
    assert lock_res.status_code == 200
    assert lock_res.json()["status"] == "locked"

    # Status after lock
    status_locked = client.get("/api/v1/auth/status", headers={"Authorization": f"Bearer {token}"})
    assert status_locked.json()["is_unlocked"] is False

    # Chat should be rejected while locked
    chat_res = client.post("/api/v1/chat/agent", json={
        "agent_id": "agent-scout",
        "message": "test while locked"
    })
    assert chat_res.status_code == 401
    assert "locked" in chat_res.json()["detail"].lower()

    # 5. Login
    bad_login = client.post("/api/v1/auth/login", json={"passcode": "wrongpin"})
    assert bad_login.status_code == 401

    good_login = client.post("/api/v1/auth/login", json={"passcode": "masterpass987"})
    assert good_login.status_code == 200
    new_token = good_login.json()["session_token"]

    # 6. Recovery endpoint
    rec_res = client.post("/api/v1/auth/recover", json={
        "recovery_seed": seed,
        "new_passcode": "recoveredPass123"
    })
    assert rec_res.status_code == 200
    assert rec_res.json()["status"] == "recovered"
