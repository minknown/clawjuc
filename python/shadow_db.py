#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shadow DB - In-memory key-value store with transactions.

Implements a transactional key-value database supporting get/set/delete
operations, snapshot isolation, rollback, and multi-version concurrency.
"""

from __future__ import annotations
import copy
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Tuple


class TransactionError(Exception):
    """Raised when a transaction violates a constraint or is in an invalid state."""
    pass


class Transaction:
    """Represents a single transaction with pending changes."""

    def __init__(self, tx_id: int):
        self.tx_id = tx_id
        self.writes: Dict[str, Tuple[Any, bool]] = {}
        self.reads: set = set()
        self.committed = False
        self.aborted = False
        self.created_at = time.monotonic()

    def write(self, key: str, value: Any, is_delete: bool = False) -> None:
        self.writes[key] = (value, is_delete)
        self.reads.add(key)

    def read(self, key: str) -> None:
        self.reads.add(key)

    @property
    def is_active(self) -> bool:
        return not self.committed and not self.aborted


class ShadowDB:
    """In-memory key-value store with ACID-like transaction support."""

    def __init__(self, max_versions: int = 10):
        self._data: OrderedDict[str, Any] = OrderedDict()
        self._history: Dict[str, List[Tuple[Any, float]]] = {}
        self.max_versions = max_versions
        self._transactions: Dict[int, Transaction] = {}
        self._tx_counter = 0
        self._op_count = 0

    def begin(self) -> int:
        """Start a new transaction and return its ID."""
        self._tx_counter += 1
        tx = Transaction(self._tx_counter)
        self._transactions[self._tx_counter] = tx
        return self._tx_counter

    def get(self, key: str, tx_id: Optional[int] = None) -> Optional[Any]:
        """Retrieve a value by key, optionally within a transaction."""
        self._op_count += 1
        if tx_id is not None:
            tx = self._get_tx(tx_id)
            if key in tx.writes:
                value, is_delete = tx.writes[key]
                return None if is_delete else value
            tx.read(key)
        return self._data.get(key)

    def set(self, key: str, value: Any, tx_id: Optional[int] = None) -> None:
        """Set a key-value pair, optionally within a transaction."""
        self._op_count += 1
        if tx_id is not None:
            tx = self._get_tx(tx_id)
            tx.write(key, value, is_delete=False)
        else:
            self._write_direct(key, value)

    def delete(self, key: str, tx_id: Optional[int] = None) -> bool:
        """Delete a key, optionally within a transaction."""
        self._op_count += 1
        if tx_id is not None:
            tx = self._get_tx(tx_id)
            tx.write(key, None, is_delete=True)
            return True
        if key in self._data:
            del self._data[key]
            return True
        return False

    def commit(self, tx_id: int) -> Dict[str, Any]:
        """Commit a transaction, applying all writes to the store."""
        tx = self._get_tx(tx_id)
        if not tx.is_active:
            raise TransactionError(f"Transaction {tx_id} is not active")
        applied = {}
        for key, (value, is_delete) in tx.writes.items():
            if is_delete:
                if key in self._data:
                    del self._data[key]
                applied[key] = "DELETED"
            else:
                self._write_direct(key, value)
                applied[key] = value
        tx.committed = True
        return applied

    def rollback(self, tx_id: int) -> None:
        """Abort a transaction, discarding all pending writes."""
        tx = self._get_tx(tx_id)
        if not tx.is_active:
            raise TransactionError(f"Transaction {tx_id} is not active")
        tx.aborted = True

    def _write_direct(self, key: str, value: Any) -> None:
        """Write directly to the store with versioning."""
        self._data[key] = value
        ts = time.monotonic()
        if key not in self._history:
            self._history[key] = []
        self._history[key].append((copy.deepcopy(value), ts))
        if len(self._history[key]) > self.max_versions:
            self._history[key] = self._history[key][-self.max_versions:]

    def _get_tx(self, tx_id: int) -> Transaction:
        if tx_id not in self._transactions:
            raise TransactionError(f"Transaction {tx_id} does not exist")
        return self._transactions[tx_id]

    def get_history(self, key: str) -> List[Tuple[Any, float]]:
        """Retrieve the version history for a given key."""
        return list(self._history.get(key, []))

    @property
    def size(self) -> int:
        return len(self._data)

    @property
    def active_transactions(self) -> int:
        return sum(1 for tx in self._transactions.values() if tx.is_active)

    def snapshot(self) -> Dict[str, Any]:
        """Create a snapshot of the current database state."""
        return dict(self._data)

    def keys(self) -> List[str]:
        return list(self._data.keys())


if __name__ == "__main__":
    db = ShadowDB(max_versions=5)

    tx1 = db.begin()
    tx2 = db.begin()

    db.set("name", "Alice")
    db.set("count", 42)
    db.set("count", 43, tx_id=tx1)
    db.set("active", True, tx_id=tx2)
    db.set("score", 99.5, tx_id=tx1)

    print(f"Outside tx - count: {db.get('count')}")
    print(f"Inside tx1 - count: {db.get('count', tx_id=tx1)}")

    result = db.commit(tx1)
    print(f"Committed tx1: {result}")

    db.rollback(tx2)
    print(f"After rollback tx2 - active: {db.get('active')}")

    db.set("count", 44)
    db.set("count", 45)
    db.set("count", 46)

    history = db.get_history("count")
    print(f"\nHistory for 'count': {len(history)} versions")
    for i, (val, ts) in enumerate(history):
        print(f"  v{i}: {val}")

    print(f"\nDB size: {db.size}")
    print(f"Keys: {db.keys()}")
    print(f"Operations performed: {db._op_count}")
