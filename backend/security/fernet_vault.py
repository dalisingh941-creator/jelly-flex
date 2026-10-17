import asyncio
import base64
import hashlib
import os
import sqlite3
import uuid
from pathlib import Path
from typing import Dict, Any, List
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class HardwareFernetVault:
    """
    Hardware-locked SQLite & payload encryptor with OpenClaw-style
    off-main-thread execution and startup 'Doctor' state self-healing.
    """

    def __init__(self, db_path: str = "backend/database/secure_state.db"):
        self.db_path = str(Path(db_path).resolve())
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.fernet = self._derive_hardware_cipher()
        self._init_db()
        self.doctor_status = self.doctor_repair()

    def _derive_hardware_cipher(self) -> Fernet:
        machine_node = str(uuid.getnode()).encode("utf-8")
        local_secret = os.getenv("JELLYFLEX_MASTER_PEPPER", "jellyflex-local-default-salt").encode("utf-8")
        salt = hashlib.sha256(machine_node).digest()[:16]
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=480_000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(local_secret + machine_node))
        return Fernet(key)

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS encrypted_events (
                    task_id TEXT PRIMARY KEY,
                    channel TEXT NOT NULL,
                    fifo_seq INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'completed',
                    ciphertext BLOB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    def doctor_repair(self) -> Dict[str, Any]:
        """OpenClaw-inspired startup state doctor: checks WAL integrity and repairs orphaned locks."""
        conn = sqlite3.connect(self.db_path)
        try:
            integrity = conn.execute("PRAGMA integrity_check;").fetchone()[0]
            repaired = conn.execute(
                "UPDATE encrypted_events SET status = 'recovered' WHERE status = 'running'"
            ).rowcount
            conn.commit()
        finally:
            conn.close()
        return {"sqlite_integrity": integrity, "orphaned_tasks_repaired": repaired}

    def save_encrypted_event(self, task_id: str, channel: str, plaintext_json: str, fifo_seq: int = 0) -> bytes:
        token = self.fernet.encrypt(plaintext_json.encode("utf-8"))
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT OR REPLACE INTO encrypted_events (task_id, channel, fifo_seq, status, ciphertext)
                VALUES (?, ?, ?, 'completed', ?)
                """,
                (task_id, channel, fifo_seq, token),
            )
            conn.commit()
        finally:
            conn.close()
        return token

    async def save_encrypted_event_async(self, task_id: str, channel: str, plaintext_json: str, fifo_seq: int = 0) -> bytes:
        return await asyncio.to_thread(self.save_encrypted_event, task_id, channel, plaintext_json, fifo_seq)

    def load_decrypted_event(self, task_id: str) -> str:
        conn = sqlite3.connect(self.db_path)
        try:
            row = conn.execute(
                "SELECT ciphertext FROM encrypted_events WHERE task_id = ?", (task_id,)
            ).fetchone()
        finally:
            conn.close()
        if not row:
            raise KeyError(f"Task {task_id} not found in secure state.")
        return self.fernet.decrypt(row[0]).decode("utf-8")

    async def load_decrypted_event_async(self, task_id: str) -> str:
        return await asyncio.to_thread(self.load_decrypted_event, task_id)
