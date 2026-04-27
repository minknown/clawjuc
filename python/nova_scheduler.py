#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Nova Scheduler - Task scheduler with priorities and timeouts.

Implements a priority-based task scheduler with timeout tracking,
deferred execution, and cancellation support.
"""

from __future__ import annotations
import heapq
import random
import time
from dataclasses import dataclass, field
from enum import IntEnum
from typing import Any, Callable, Dict, List, Optional


class Priority(IntEnum):
    LOW = 3
    NORMAL = 2
    HIGH = 1
    CRITICAL = 0


@dataclass(order=True)
class ScheduledTask:
    """A task scheduled for execution with priority and optional timeout."""
    sort_key: tuple = field(compare=True)
    task_id: int = field(compare=False)
    name: str = field(compare=False)
    priority: Priority = field(compare=False)
    callback: Optional[Callable] = field(compare=False, default=None)
    timeout: Optional[float] = field(compare=False, default=None)
    payload: Any = field(compare=False, default=None)
    created_at: float = field(compare=False, default_factory=time.monotonic)

    def __post_init__(self):
        if isinstance(self.sort_key, tuple) and len(self.sort_key) == 0:
            self.sort_key = (self.priority, self.created_at, self.task_id)


class TaskScheduler:
    """Priority-based scheduler with timeout enforcement and cancellation."""

    def __init__(self, max_concurrent: int = 10):
        self.max_concurrent = max_concurrent
        self._queue: List[ScheduledTask] = []
        self._counter = 0
        self._cancelled: set = set()
        self._completed: List[dict] = []
        self._timed_out: List[dict] = []
        self._running = 0

    def schedule(self, name: str, priority: Priority = Priority.NORMAL,
                 callback: Optional[Callable] = None, timeout: Optional[float] = None,
                 payload: Any = None) -> int:
        """Add a new task to the scheduler queue."""
        self._counter += 1
        task = ScheduledTask(
            sort_key=(priority, time.monotonic(), self._counter),
            task_id=self._counter,
            name=name,
            priority=priority,
            callback=callback,
            timeout=timeout,
            payload=payload,
        )
        heapq.heappush(self._queue, task)
        return task.task_id

    def cancel(self, task_id: int) -> bool:
        """Cancel a scheduled task by its ID."""
        if task_id not in self._cancelled:
            self._cancelled.add(task_id)
            return True
        return False

    def _is_cancelled(self, task: ScheduledTask) -> bool:
        return task.task_id in self._cancelled

    def next_task(self) -> Optional[ScheduledTask]:
        """Pop and return the next non-cancelled task from the queue."""
        while self._queue:
            task = heapq.heappop(self._queue)
            if not self._is_cancelled(task):
                return task
        return None

    def process_one(self) -> Optional[dict]:
        """Process a single task from the queue."""
        if self._running >= self.max_concurrent:
            return None
        task = self.next_task()
        if task is None:
            return None
        self._running += 1
        elapsed = time.monotonic() - task.created_at
        timed_out = task.timeout is not None and elapsed > task.timeout

        result = {
            "task_id": task.task_id,
            "name": task.name,
            "priority": task.priority.name,
            "wait_time": elapsed,
            "status": "timeout" if timed_out else "completed",
        }

        if task.callback:
            try:
                task.callback(task.payload)
            except Exception:
                result["status"] = "error"

        if timed_out:
            self._timed_out.append(result)
        else:
            self._completed.append(result)
        self._running -= 1
        return result

    def process_all(self) -> List[dict]:
        """Process all remaining tasks in the queue."""
        results = []
        while True:
            result = self.process_one()
            if result is None:
                break
            results.append(result)
        return results

    @property
    def pending_count(self) -> int:
        active = sum(1 for t in self._queue if not self._is_cancelled(t))
        return active

    @property
    def stats(self) -> dict:
        return {
            "pending": self.pending_count,
            "completed": len(self._completed),
            "timed_out": len(self._timed_out),
            "cancelled": len(self._cancelled),
        }


if __name__ == "__main__":
    scheduler = TaskScheduler(max_concurrent=4)

    def dummy_callback(payload):
        return payload

    priorities = [Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL]
    names = [f"task_{i:03d}" for i in range(20)]

    for i, name in enumerate(names):
        p = random.choice(priorities)
        t = random.uniform(0.001, 0.01)
        scheduler.schedule(name, priority=p, callback=dummy_callback,
                          timeout=t, payload={"index": i})

    scheduler.cancel(3)
    scheduler.cancel(7)

    results = scheduler.process_all()
    stats = scheduler.stats
    print(f"Processed: {len(results)} tasks")
    print(f"Stats: {stats}")
    for r in results[:5]:
        print(f"  [{r['status']}] {r['name']} ({r['priority']}) wait={r['wait_time']:.4f}s")
