import math
import random
import time
from typing import List, Tuple, Dict, Any


class StealthBrowserHumanizer:
    """
    Generates biological typing intervals and cubic-bezier mouse paths
    so automated browser actions never trigger bot-detection heuristics.
    """

    def __init__(self):
        self._channel_action_timestamps: Dict[str, List[float]] = {}

    @staticmethod
    def generate_bezier_curve(
        start: Tuple[float, float], end: Tuple[float, float], steps: int = 25
    ) -> List[Tuple[float, float]]:
        x0, y0 = start
        x3, y3 = end
        # Randomized control points for natural human hand arc
        x1 = x0 + (x3 - x0) * 0.3 + random.uniform(-45, 45)
        y1 = y0 + (y3 - y0) * 0.2 + random.uniform(-45, 45)
        x2 = x0 + (x3 - x0) * 0.7 + random.uniform(-35, 35)
        y2 = y0 + (y3 - y0) * 0.8 + random.uniform(-35, 35)

        path: List[Tuple[float, float]] = []
        for i in range(steps + 1):
            t = i / steps
            u = 1 - t
            x = (u**3) * x0 + 3 * (u**2) * t * x1 + 3 * u * (t**2) * x2 + (t**3) * x3
            y = (u**3) * y0 + 3 * (u**2) * t * y1 + 3 * u * (t**2) * y2 + (t**3) * y3
            path.append((round(x, 2), round(y, 2)))
        return path

    @staticmethod
    def humanized_typing_delays(text: str, base_wpm: int = 68) -> List[float]:
        mean_delay = 60.0 / (base_wpm * 5.0)
        delays: List[float] = []
        for ch in text:
            jitter = random.gauss(mean_delay, mean_delay * 0.28)
            if ch in {".", ",", "!", "?", "\n"}:
                jitter += random.uniform(0.18, 0.42)
            delays.append(max(0.03, round(jitter, 4)))
        return delays

    def check_account_safety_radar(self, channel: str, max_hourly_actions: int = 12) -> Dict[str, Any]:
        now = time.time()
        history = [t for t in self._channel_action_timestamps.get(channel, []) if now - t < 3600]
        self._channel_action_timestamps[channel] = history
        if len(history) >= max_hourly_actions:
            return {
                "safe_to_proceed": False,
                "status": "COOLDOWN_CIRCUIT_BREAKER_TRIPPED",
                "hourly_actions": len(history),
                "recommended_wait_seconds": 1800,
            }
        history.append(now)
        return {
            "safe_to_proceed": True,
            "status": "HEALTHY_STEALTH_PROFILE",
            "hourly_actions": len(history),
            "recommended_wait_seconds": 0,
        }
