import os
import sqlite3
import hashlib
from typing import Dict, Any, List, Optional
from pathlib import Path


class InviteCodeAuthManager:
    """
    Invite-Only Access Control for Open-Source JellyFlex Distribution.
    Allows creators to publish a single-time access code on GitHub (e.g. JELLYFLEX-COMMUNITY-2026).
    Once the user inputs the valid code, authorization is permanently recorded in SQLite.
    The application will never prompt the user for the code again.
    """

    DEFAULT_ALLOWED_CODES = {
        "JELLYFLEX-COMMUNITY-2026",
        "JELLYFLEX-OPEN-2026",
        "JELLYFLEX-VIP-AGENT",
        "CUE-BY-MANUS-OPENCLAW",
    }

    def __init__(self, db_path: str = "backend/database/secure_state.db"):
        self.db_path = str(Path(db_path).resolve())
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS invite_authorization (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    code_hash TEXT NOT NULL,
                    notes TEXT
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    def get_allowed_codes(self) -> set:
        codes = set(self.DEFAULT_ALLOWED_CODES)
        env_code = os.getenv("JELLYFLEX_INVITE_CODE")
        if env_code and env_code.strip():
            codes.add(env_code.strip().upper())
        return codes

    def is_authorized(self) -> bool:
        """Checks if this local instance is already permanently unlocked."""
        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute("SELECT id FROM invite_authorization WHERE id = 1").fetchone()
            return row is not None
        finally:
            conn.close()

    def verify_and_authorize(self, input_code: str) -> Dict[str, Any]:
        """Validates the input code and permanently marks the system as authorized."""
        clean_code = input_code.strip().upper()
        allowed = self.get_allowed_codes()

        if clean_code in allowed:
            code_hash = hashlib.sha256(clean_code.encode("utf-8")).hexdigest()
            conn = sqlite3.connect(self.db_path)
            try:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO invite_authorization (id, code_hash, notes)
                    VALUES (1, ?, 'Permanent One-Time Community Unlock')
                    """,
                    (code_hash,),
                )
                conn.commit()
            finally:
                conn.close()
            return {
                "success": True,
                "status": "authorized",
                "message": "Invite code verified. Access permanently granted.",
                "permanent": True,
            }

        return {
            "success": False,
            "status": "invalid_code",
            "message": "Invalid access code. Please check the GitHub repository README for the community access code.",
            "permanent": False,
        }

    def reset_authorization_for_testing(self) -> None:
        """Utility for test suites."""
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute("DELETE FROM invite_authorization WHERE id = 1")
            conn.commit()
        finally:
            conn.close()
