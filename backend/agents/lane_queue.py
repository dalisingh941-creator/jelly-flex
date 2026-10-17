import asyncio
from collections import defaultdict
from typing import Callable, Awaitable, Any, Dict


class OpenClawLaneQueue:
    """
    Per-channel sequential execution lane with global concurrency semaphore and FIFO sequence IDs.
    Preserves FIFO outbox ordering across multi-channel dispatches.
    """

    def __init__(self, max_concurrent_lanes: int = 6):
        self._lane_locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self._global_semaphore = asyncio.Semaphore(max_concurrent_lanes)
        self._fifo_seq: int = 0

    async def run_in_lane(
        self,
        lane_name: str,
        task_id: str,
        coro_factory: Callable[[], Awaitable[Any]],
    ) -> Dict[str, Any]:
        self._fifo_seq += 1
        seq_id = self._fifo_seq
        lane_lock = self._lane_locks[lane_name.lower()]
        async with lane_lock:
            async with self._global_semaphore:
                result = await coro_factory()
                return {
                    "task_id": task_id,
                    "lane": lane_name.lower(),
                    "fifo_seq": seq_id,
                    "result": result,
                }
