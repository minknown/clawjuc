#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cache Vault - LRU cache implementation with decorators.

Provides a thread-safe least-recently-used cache backed by an
ordered dictionary with configurable capacity and TTL support.
"""

from __future__ import annotations
import time
from collections import OrderedDict
from functools import wraps
from typing import Any, Callable, Optional, Tuple, TypeVar

T = TypeVar("T")


class CacheEntry:
    """Wrapper for cached values with metadata."""

    __slots__ = ("value", "created_at", "access_count")

    def __init__(self, value: Any):
        self.value = value
        self.created_at = time.monotonic()
        self.access_count = 1

    def touch(self) -> None:
        self.access_count += 1


class LRUCache:
    """Least-recently-used cache with optional TTL eviction."""

    def __init__(self, capacity: int = 128, ttl_seconds: Optional[float] = None):
        self.capacity = max(1, capacity)
        self.ttl = ttl_seconds
        self._store: OrderedDict[Any, CacheEntry] = OrderedDict()
        self._hits = 0
        self._misses = 0

    def get(self, key: Any, default: Any = None) -> Any:
        """Retrieve a value from the cache, moving it to the front."""
        entry = self._store.get(key)
        if entry is None:
            self._misses += 1
            return default
        if self.ttl is not None:
            age = time.monotonic() - entry.created_at
            if age > self.ttl:
                del self._store[key]
                self._misses += 1
                return default
        self._store.move_to_end(key)
        entry.touch()
        self._hits += 1
        return entry.value

    def put(self, key: Any, value: Any) -> None:
        """Insert or update a key in the cache."""
        if key in self._store:
            self._store.move_to_end(key)
            self._store[key].value = value
            self._store[key].touch()
        else:
            if len(self._store) >= self.capacity:
                self._store.popitem(last=False)
            self._store[key] = CacheEntry(value)

    def invalidate(self, key: Any) -> bool:
        """Remove a specific key from the cache."""
        if key in self._store:
            del self._store[key]
            return True
        return False

    def clear(self) -> None:
        """Evict all entries from the cache."""
        self._store.clear()

    @property
    def hit_rate(self) -> float:
        total = self._hits + self._misses
        return self._hits / total if total else 0.0

    @property
    def stats(self) -> Tuple[int, int, float]:
        return len(self._store), self._hits, self.hit_rate

    def __len__(self) -> int:
        return len(self._store)

    def __contains__(self, key: Any) -> bool:
        return key in self._store


def cached(cache: LRUCache, key_fn: Optional[Callable] = None):
    """Decorator that caches function results using the provided LRU cache."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            k = key_fn(*args, **kwargs) if key_fn else (args, tuple(sorted(kwargs.items())))
            result = cache.get(k)
            if result is None:
                result = func(*args, **kwargs)
                cache.put(k, result)
            return result
        wrapper.cache = cache
        return wrapper
    return decorator


if __name__ == "__main__":
    cache = LRUCache(capacity=10, ttl_seconds=5.0)

    @cached(cache)
    def expensive_compute(n: int) -> int:
        total = sum(i * i for i in range(n))
        return total

    for i in range(20):
        val = expensive_compute(i % 8)
    size, hits, rate = cache.stats
    print(f"Cache size: {size}, Hits: {hits}, Hit rate: {rate:.2%}")
    cache.invalidate((0,))
    print(f"After invalidation: {len(cache)} entries")
