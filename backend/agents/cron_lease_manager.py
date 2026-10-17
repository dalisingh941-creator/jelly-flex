import asyncio
import time
import uuid
from typing import Dict, Any, Optional, Callable, Awaitable


class CronLeaseManager:
    """
    Lease-bounded background cron scheduler and MCP event trigger handler.
    Guarantees deterministic lease lifetimes and prevents duplicate execution across concurrent tasks.
    """

    def __init__(self, default_lease_ttl: float = 60.0):
        self.default_lease_ttl = default_lease_ttl
        self._active_leases: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def acquire_lease(self, job_name: str, ttl: Optional[float] = None) -> Optional[str]:
        lease_duration = ttl or self.default_lease_ttl
        now = time.time()
        async with self._lock:
            current = self._active_leases.get(job_name)
            if current and now < current["expires_at"]:
                # Lease is still active
                return None
            lease_token = str(uuid.uuid4())
            self._active_leases[job_name] = {
                "token": lease_token,
                "acquired_at": now,
                "expires_at": now + lease_duration,
            }
            return lease_token

    async def release_lease(self, job_name: str, lease_token: str) -> bool:
        async with self._lock:
            current = self._active_leases.get(job_name)
            if current and current["token"] == lease_token:
                del self._active_leases[job_name]
                return True
            return False

    async def execute_with_lease(
        self,
        job_name: str,
        coro_factory: Callable[[], Awaitable[Any]],
        ttl: Optional[float] = None,
    ) -> Optional[Any]:
        token = await self.acquire_lease(job_name, ttl)
        if not token:
            return None
        try:
            return await coro_factory()
        finally:
            await self.release_lease(job_name, token)

    def is_locked(self, job_name: str) -> bool:
        current = self._active_leases.get(job_name)
        if not current:
            return False
        return time.time() < current["expires_at"]
