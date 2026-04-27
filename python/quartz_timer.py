#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quartz Timer - Timer and cron-like scheduler.

Provides precision timing utilities, interval tracking,
and a cron-like expression parser for scheduling periodic events.
"""

from __future__ import annotations
import re
import time
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple


@dataclass
class Timer:
    """A simple stopwatch-style timer with lap tracking."""
    name: str
    _start: Optional[float] = field(default=None, repr=False)
    _laps: List[Tuple[str, float]] = field(default_factory=list, repr=False)
    _running: bool = field(default=False, repr=False)

    def start(self) -> None:
        """Start or restart the timer."""
        self._start = time.monotonic()
        self._running = True

    def stop(self) -> float:
        """Stop the timer and return the elapsed time."""
        if self._start is None:
            return 0.0
        elapsed = time.monotonic() - self._start
        self._running = False
        return elapsed

    def lap(self, label: str = "") -> float:
        """Record a lap time and return the elapsed time since start."""
        if self._start is None:
            return 0.0
        elapsed = time.monotonic() - self._start
        self._laps.append((label, elapsed))
        return elapsed

    @property
    def elapsed(self) -> float:
        if self._start is None:
            return 0.0
        if self._running:
            return time.monotonic() - self._start
        return self._laps[-1][1] if self._laps else 0.0

    @property
    def lap_count(self) -> int:
        return len(self._laps)

    def summary(self) -> str:
        lines = [f"Timer: {self.name}", f"  Elapsed: {self.elapsed:.4f}s"]
        for label, t in self._laps:
            lines.append(f"  Lap {'(' + label + ')' if label else ''}: {t:.4f}s")
        return "\n".join(lines)


@dataclass
class CronField:
    """Represents a parsed cron field (minute, hour, day, month, weekday)."""
    name: str
    values: List[int]
    is_wildcard: bool = False


class CronExpression:
    """Parser and evaluator for simplified cron expressions (5-field)."""

    FIELD_NAMES = ["minute", "hour", "day", "month", "weekday"]
    FIELD_RANGES = {
        "minute": (0, 59), "hour": (0, 23),
        "day": (1, 31), "month": (1, 12), "weekday": (0, 6),
    }

    def __init__(self, expression: str):
        self.raw = expression
        self.fields: List[CronField] = []
        self._parse(expression)

    def _parse(self, expression: str) -> None:
        parts = expression.strip().split()
        if len(parts) != 5:
            raise ValueError(f"Expected 5 fields, got {len(parts)}")
        for name, part in zip(self.FIELD_NAMES, parts):
            field_vals = self._parse_field(part, *self.FIELD_RANGES[name])
            self.fields.append(CronField(name=name, values=field_vals, is_wildcard=(part == "*")))

    def _parse_field(self, part: str, min_val: int, max_val: int) -> List[int]:
        """Parse a single cron field into a list of matching values."""
        values = set()
        for segment in part.split(","):
            if segment == "*":
                values.update(range(min_val, max_val + 1))
            elif "/" in segment:
                base, step = segment.split("/", 1)
                step = int(step)
                start = min_val if base == "*" else int(base)
                values.update(range(start, max_val + 1, step))
            elif "-" in segment:
                start, end = segment.split("-", 1)
                values.update(range(int(start), int(end) + 1))
            else:
                values.add(int(segment))
        return sorted(v for v in values if min_val <= v <= max_val)

    def matches(self, minute: int, hour: int, day: int, month: int, weekday: int) -> bool:
        """Check if the given time components match this cron expression."""
        checks = [minute, hour, day, month, weekday]
        for cron_field, val in zip(self.fields, checks):
            if val not in cron_field.values:
                return False
        return True

    def next_matches(self, count: int = 5) -> List[str]:
        """Simulate finding the next matching times (simplified demonstration)."""
        matched = []
        for h in range(24):
            for m in range(60):
                if self.matches(m, h, 1, 1, 0):
                    matched.append(f"{h:02d}:{m:02d}")
                    if len(matched) >= count:
                        return matched
        return matched


class IntervalTracker:
    """Tracks execution intervals and detects missed deadlines."""

    def __init__(self, expected_interval: float):
        self.expected = expected_interval
        self._last_execution: Optional[float] = None
        self._delays: List[float] = []
        self._total_late: float = 0.0

    def tick(self) -> Tuple[float, bool]:
        """Record an execution tick. Returns (actual_interval, was_late)."""
        now = time.monotonic()
        if self._last_execution is None:
            self._last_execution = now
            return (0.0, False)
        actual = now - self._last_execution
        delay = max(0.0, actual - self.expected)
        is_late = delay > 0
        self._delays.append(delay)
        self._total_late += delay
        self._last_execution = now
        return (actual, is_late)

    @property
    def avg_delay(self) -> float:
        return self._total_late / len(self._delays) if self._delays else 0.0


if __name__ == "__main__":
    timer = Timer("demo_timer")
    timer.start()
    for i in range(5):
        time.sleep(0.02)
        timer.lap(f"step_{i}")
    elapsed = timer.stop()
    print(timer.summary())

    cron = CronExpression("*/15 0,12 * * 1-5")
    print(f"\nCron: {cron.raw}")
    print(f"Matches 00:15 on Monday? {cron.matches(15, 0, 1, 1, 0)}")
    print(f"Matches 00:30 on Saturday? {cron.matches(30, 0, 1, 1, 5)}")
    print(f"Sample matches: {cron.next_matches(5)}")

    tracker = IntervalTracker(expected_interval=0.05)
    for _ in range(10):
        time.sleep(0.03 + 0.02 * (hash(time.monotonic()) % 1))
        tracker.tick()
    print(f"\nAvg delay: {tracker.avg_delay:.4f}s")
