import sqlite3
from typing import Dict, List, Any, Optional
from security.fernet_vault import HardwareFernetVault


class BYOKVaultManager:
    """
    Write-Only Bring-Your-Own-Key (BYOK) Manager.
    Encrypts API keys at rest via PBKDF2HMAC + Fernet and NEVER returns raw keys to the UI.
    """

    SUPPORTED_PROVIDERS = {
        "gemini": {"label": "Google Gemini (Argon / Flash)", "env_var": "GEMINI_API_KEY"},
        "openai": {"label": "OpenAI (GPT-4o / o3)", "env_var": "OPENAI_API_KEY"},
        "anthropic": {"label": "Anthropic Claude (Opus 5.5 / Sonnet)", "env_var": "ANTHROPIC_API_KEY"},
        "xai": {"label": "xAI Grok", "env_var": "XAI_API_KEY"},
        "instagram": {"label": "Instagram Graph API Token", "env_var": "INSTAGRAM_ACCESS_TOKEN"},
        "openrouter": {"label": "OpenRouter (Universal Fallback)", "env_var": "OPENROUTER_API_KEY"},
        "ollama": {"label": "Local Ollama (100% Free Offline)", "env_var": "OLLAMA_BASE_URL"},
    }

    def __init__(self, vault: HardwareFernetVault):
        self.vault = vault
        self._init_key_table()

    def _init_key_table(self) -> None:
        conn = sqlite3.connect(self.vault.db_path)
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS byok_credentials (
                    provider TEXT PRIMARY KEY,
                    masked_hint TEXT NOT NULL,
                    ciphertext BLOB NOT NULL,
                    monthly_budget_usd REAL DEFAULT 25.0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def _mask_key(raw_key: str) -> str:
        clean = raw_key.strip()
        if len(clean) <= 8:
            return "••••••••"
        return f"{clean[:4]}••••••••{clean[-4:]}"

    def save_provider_key(self, provider: str, raw_key: str, monthly_budget_usd: float = 25.0) -> Dict[str, Any]:
        provider_id = provider.lower().strip()
        if provider_id not in self.SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider_id}")
        masked = self._mask_key(raw_key)
        encrypted_blob = self.vault.fernet.encrypt(raw_key.strip().encode("utf-8"))
        conn = sqlite3.connect(self.vault.db_path)
        try:
            conn.execute(
                """
                INSERT OR REPLACE INTO byok_credentials (provider, masked_hint, ciphertext, monthly_budget_usd)
                VALUES (?, ?, ?, ?)
                """,
                (provider_id, masked, encrypted_blob, monthly_budget_usd),
            )
            conn.commit()
        finally:
            conn.close()
        return {
            "provider": provider_id,
            "configured": True,
            "masked_hint": masked,
            "monthly_budget_usd": monthly_budget_usd,
        }

    def get_decrypted_key_internal(self, provider: str) -> Optional[str]:
        """Strictly for internal backend agent instantiation — NEVER expose via HTTP API."""
        conn = sqlite3.connect(self.vault.db_path)
        try:
            row = conn.execute(
                "SELECT ciphertext FROM byok_credentials WHERE provider = ?",
                (provider.lower().strip(),),
            ).fetchone()
        finally:
            conn.close()
        if not row:
            return None
        return self.vault.fernet.decrypt(row[0]).decode("utf-8")

    def list_public_provider_status(self) -> List[Dict[str, Any]]:
        """Safe write-only status list for the Next.js UI."""
        conn = sqlite3.connect(self.vault.db_path)
        try:
            rows = {
                r[0]: {"masked_hint": r[1], "budget": r[2]}
                for r in conn.execute(
                    "SELECT provider, masked_hint, monthly_budget_usd FROM byok_credentials"
                ).fetchall()
            }
        finally:
            conn.close()
        status_list: List[Dict[str, Any]] = []
        for pid, meta in self.SUPPORTED_PROVIDERS.items():
            saved = rows.get(pid)
            status_list.append({
                "provider": pid,
                "label": meta["label"],
                "configured": saved is not None,
                "masked_hint": saved["masked_hint"] if saved else "Not Configured",
                "monthly_budget_usd": saved["budget"] if saved else 0.0,
            })
        return status_list

    def has_configured_keys(self) -> bool:
        """Returns True if at least one custom provider key is saved in the vault."""
        conn = sqlite3.connect(self.vault.db_path)
        try:
            count = conn.execute("SELECT COUNT(*) FROM byok_credentials").fetchone()[0]
            return count > 0
        finally:
            conn.close()
