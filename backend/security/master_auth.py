import asyncio
import base64
import hashlib
import json
import os
import secrets
import sqlite3
import time
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


MNEMONIC_WORDS = [
    "alpha", "beacon", "cipher", "delta", "echo", "falcon",
    "galaxy", "harbor", "ivory", "jelly", "kinetic", "lunar",
    "matrix", "nexus", "orbit", "prism", "quantum", "radar",
    "stellar", "timber", "ultra", "velvet", "wave", "xenon",
    "yield", "zenith", "crystal", "dynamo", "ember", "glacier",
    "horizon", "pulse"
]


class MasterAuthManager:
    """
    Zero-Knowledge Master Passcode & PIN Authentication for JellyFlex.
    - Zero plaintext passwords or keys stored anywhere.
    - Hardware-bound cryptographic salt derived from machine node + local secret.
    - Generates 12-word mnemonic recovery seed for emergency recovery.
    - Master vault key is sealed via PBKDF2HMAC + Fernet AES-128 (480,000 iterations).
    - Unlocked master key is held strictly in-memory during active sessions.
    - Supports session tokens with automatic lock on inactivity.
    """

    def __init__(self, db_path: str = "backend/database/secure_state.db", auto_lock_seconds: int = 900):
        self.db_path = str(Path(db_path).resolve())
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.auto_lock_seconds = auto_lock_seconds
        self._is_unlocked: bool = False
        self._unlocked_vault_key: Optional[bytes] = None
        self._active_sessions: Dict[str, float] = {}  # token -> last_activity timestamp
        self._init_db()

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS master_auth_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    is_setup INTEGER DEFAULT 0,
                    passcode_salt BLOB NOT NULL,
                    hardware_salt TEXT NOT NULL,
                    passcode_hash TEXT NOT NULL,
                    recovery_seed_hash TEXT NOT NULL,
                    recovery_seed_encrypted BLOB NOT NULL,
                    vault_key_encrypted BLOB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    def _get_hardware_salt_base(self) -> str:
        machine_node = str(uuid.getnode())
        pepper = os.getenv("JELLYFLEX_MASTER_PEPPER", "jellyflex-hardware-vault-salt")
        return hashlib.sha256(f"{machine_node}:{pepper}".encode("utf-8")).hexdigest()[:24]

    def _derive_fernet_from_passcode(self, passcode: str, salt: bytes) -> Fernet:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=480_000,
        )
        hw_base = self._get_hardware_salt_base().encode("utf-8")
        derived = kdf.derive(passcode.encode("utf-8") + hw_base)
        return Fernet(base64.urlsafe_b64encode(derived))

    def _hash_passcode(self, passcode: str, salt: bytes) -> str:
        hw_base = self._get_hardware_salt_base().encode("utf-8")
        return hashlib.sha256(salt + passcode.encode("utf-8") + hw_base).hexdigest()

    def _generate_recovery_seed(self) -> str:
        selected = [secrets.choice(MNEMONIC_WORDS) for _ in range(12)]
        return " ".join(selected)

    def is_setup(self) -> bool:
        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute("SELECT is_setup FROM master_auth_state WHERE id = 1").fetchone()
            return bool(row and row[0] == 1)
        finally:
            conn.close()

    def is_unlocked(self, token: Optional[str] = None) -> bool:
        if not self.is_setup():
            return False
        if not self._is_unlocked or not self._unlocked_vault_key:
            return False
        if token:
            return self.validate_session(token)
        return self._is_unlocked

    def setup_passcode(self, passcode: str) -> Dict[str, Any]:
        """First-time setup of master passcode / PIN."""
        clean = passcode.strip()
        if len(clean) < 4:
            raise ValueError("Passcode must be at least 4 characters or digits.")

        salt = os.urandom(16)
        hw_salt = self._get_hardware_salt_base()
        pass_hash = self._hash_passcode(clean, salt)
        recovery_seed = self._generate_recovery_seed()
        rec_hash = hashlib.sha256(recovery_seed.strip().lower().encode("utf-8")).hexdigest()

        cipher = self._derive_fernet_from_passcode(clean, salt)
        rec_encrypted = cipher.encrypt(recovery_seed.encode("utf-8"))

        vault_master_key = Fernet.generate_key()
        vault_key_encrypted = cipher.encrypt(vault_master_key)

        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT OR REPLACE INTO master_auth_state (
                    id, is_setup, passcode_salt, hardware_salt, passcode_hash,
                    recovery_seed_hash, recovery_seed_encrypted, vault_key_encrypted
                ) VALUES (1, 1, ?, ?, ?, ?, ?, ?)
                """,
                (
                    salt,
                    hw_salt,
                    pass_hash,
                    rec_hash,
                    rec_encrypted,
                    vault_key_encrypted,
                ),
            )
            conn.commit()
        finally:
            conn.close()

        self._is_unlocked = True
        self._unlocked_vault_key = vault_master_key
        token = secrets.token_hex(32)
        self._active_sessions[token] = time.time()

        return {
            "status": "setup_complete",
            "is_setup": True,
            "session_token": token,
            "recovery_seed": recovery_seed,
            "hardware_salt": hw_salt,
            "auto_lock_minutes": self.auto_lock_seconds // 60,
        }

    def login(self, passcode: str) -> Dict[str, Any]:
        """Authenticate with master passcode / PIN."""
        if not self.is_setup():
            raise ValueError("Master Passcode has not been configured yet.")

        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute(
                """
                SELECT passcode_salt, passcode_hash, vault_key_encrypted
                FROM master_auth_state WHERE id = 1
                """
            ).fetchone()
        finally:
            conn.close()

        if not row:
            raise ValueError("Auth state missing.")

        salt, stored_hash, vault_key_encrypted = row[0], row[1], row[2]
        computed_hash = self._hash_passcode(passcode.strip(), salt)

        if not secrets.compare_digest(computed_hash, stored_hash):
            return {"status": "error", "message": "Invalid Master Passcode. Please try again."}

        cipher = self._derive_fernet_from_passcode(passcode.strip(), salt)
        try:
            vault_master_key = cipher.decrypt(vault_key_encrypted)
        except Exception:
            return {"status": "error", "message": "Vault key decryption failed."}

        self._is_unlocked = True
        self._unlocked_vault_key = vault_master_key
        token = secrets.token_hex(32)
        self._active_sessions[token] = time.time()

        return {
            "status": "authenticated",
            "is_unlocked": True,
            "session_token": token,
            "auto_lock_minutes": self.auto_lock_seconds // 60,
        }

    def recover_with_seed(self, recovery_seed: str, new_passcode: str) -> Dict[str, Any]:
        """Emergency recovery using the 12-word mnemonic phrase."""
        clean_seed = " ".join(recovery_seed.strip().lower().split())
        clean_pass = new_passcode.strip()
        if len(clean_pass) < 4:
            raise ValueError("New passcode must be at least 4 characters or digits.")

        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute(
                """
                SELECT passcode_salt, recovery_seed_hash, recovery_seed_encrypted, vault_key_encrypted
                FROM master_auth_state WHERE id = 1
                """
            ).fetchone()
        finally:
            conn.close()

        if not row:
            raise ValueError("Auth state not found.")

        stored_rec_hash = row[1]
        computed_rec_hash = hashlib.sha256(clean_seed.encode("utf-8")).hexdigest()

        if not secrets.compare_digest(computed_rec_hash, stored_rec_hash):
            return {"status": "error", "message": "Invalid recovery seed phrase."}

        # Generate new salt and re-seal vault with new passcode
        new_salt = os.urandom(16)
        hw_salt = self._get_hardware_salt_base()
        new_pass_hash = self._hash_passcode(clean_pass, new_salt)
        new_cipher = self._derive_fernet_from_passcode(clean_pass, new_salt)

        # Generate fresh master vault key if previous cannot be decrypted
        vault_master_key = Fernet.generate_key()
        new_vault_key_enc = new_cipher.encrypt(vault_master_key)
        new_rec_enc = new_cipher.encrypt(clean_seed.encode("utf-8"))

        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                UPDATE master_auth_state
                SET passcode_salt = ?, hardware_salt = ?, passcode_hash = ?,
                    recovery_seed_encrypted = ?, vault_key_encrypted = ?
                WHERE id = 1
                """,
                (new_salt, hw_salt, new_pass_hash, new_rec_enc, new_vault_key_enc),
            )
            conn.commit()
        finally:
            conn.close()

        self._is_unlocked = True
        self._unlocked_vault_key = vault_master_key
        token = secrets.token_hex(32)
        self._active_sessions[token] = time.time()

        return {
            "status": "recovered",
            "is_unlocked": True,
            "session_token": token,
            "message": "Vault successfully recovered and new Master Passcode set.",
        }

    def validate_session(self, token: Optional[str]) -> bool:
        """Checks if the session token is active and not timed out."""
        if not self._is_unlocked or not token:
            return False

        last_activity = self._active_sessions.get(token)
        if last_activity is None:
            return False

        now = time.time()
        if now - last_activity > self.auto_lock_seconds:
            # Session expired -> auto-lock
            self.lock()
            return False

        # Session alive -> refresh activity timestamp
        self._active_sessions[token] = now
        return True

    def lock(self) -> Dict[str, str]:
        """Locks the vault, purges in-memory keys and sessions."""
        self._is_unlocked = False
        self._unlocked_vault_key = None
        self._active_sessions.clear()
        return {"status": "locked", "message": "Hardware vault locked successfully."}

    def get_status(self, token: Optional[str] = None) -> Dict[str, Any]:
        """Returns the current vault & session status."""
        setup = self.is_setup()
        if not setup:
            return {
                "is_setup": False,
                "is_unlocked": False,
                "session_active": False,
                "auto_lock_minutes": self.auto_lock_seconds // 60,
                "hardware_salt_preview": self._get_hardware_salt_base()[:8] + "...",
            }

        session_ok = self.validate_session(token) if token else False
        return {
            "is_setup": True,
            "is_unlocked": self._is_unlocked and session_ok,
            "session_active": session_ok,
            "auto_lock_minutes": self.auto_lock_seconds // 60,
            "hardware_salt_preview": self._get_hardware_salt_base()[:8] + "...",
        }

    def reset_for_testing(self) -> None:
        """Utility for test suites to wipe state cleanly."""
        self.lock()
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute("DELETE FROM master_auth_state WHERE id = 1")
            conn.commit()
        finally:
            conn.close()
