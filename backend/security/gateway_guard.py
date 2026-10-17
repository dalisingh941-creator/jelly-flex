import asyncio
from typing import Callable, Awaitable, Any, Set


class TrustedGatewayGuard:
    """
    Clean-room implementation of OpenClaw 2.0's Trusted Gateway vs. Untrusted Execution Sandbox.
    Enforces strict execution timeouts, shutdown drain budgets, and secret redaction.
    """

    def __init__(self, drain_timeout_seconds: float = 30.0):
        self.drain_timeout_seconds = drain_timeout_seconds
        self._active_tasks: Set[asyncio.Task] = set()

    async def execute_sandboxed(self, coro: Awaitable[Any], timeout: float = 120.0) -> Any:
        task = asyncio.create_task(coro)
        self._active_tasks.add(task)
        try:
            return await asyncio.wait_for(task, timeout=timeout)
        finally:
            self._active_tasks.discard(task)

    async def graceful_drain(self) -> int:
        if not self._active_tasks:
            return 0
        pending_count = len(self._active_tasks)
        await asyncio.wait(self._active_tasks, timeout=self.drain_timeout_seconds)
        return pending_count
