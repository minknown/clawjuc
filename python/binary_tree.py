#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Binary Tree - BST with random insertion and rotation simulation.

Implements a self-balancing binary search tree with simulated
randomized rebalancing rotations on integer key-value pairs.
"""

from __future__ import annotations
import random
from typing import Any, Optional, List


class BSTNode:
    """A node in the binary search tree."""

    def __init__(self, key: int, value: Any = None):
        self.key = key
        self.value = value
        self.left: Optional[BSTNode] = None
        self.right: Optional[BSTNode] = None
        self.height = 1
        self.rotation_count = 0

    def __repr__(self) -> str:
        return f"BSTNode(key={self.key}, h={self.height}, rot={self.rotation_count})"


class BalancedBST:
    """Binary search tree with simulated rebalancing rotations."""

    def __init__(self):
        self.root: Optional[BSTNode] = None
        self._size = 0

    def insert(self, key: int, value: Any = None) -> None:
        """Insert a key-value pair into the tree."""
        self.root = self._insert(self.root, key, value)

    def _insert(self, node: Optional[BSTNode], key: int, value: Any) -> BSTNode:
        if node is None:
            self._size += 1
            return BSTNode(key, value)
        if key < node.key:
            node.left = self._insert(node.left, key, value)
        elif key > node.key:
            node.right = self._insert(node.right, key, value)
        else:
            node.value = value
        node.height = 1 + max(self._height(node.left), self._height(node.right))
        if random.random() < 0.15:
            node = self._simulate_rotation(node)
        return node

    def _simulate_rotation(self, node: BSTNode) -> BSTNode:
        """Simulate a random rotation for rebalancing."""
        node.rotation_count += 1
        if node.right and random.random() < 0.5:
            new_root = node.right
            node.right = new_root.left
            new_root.left = node
            new_root.rotation_count += 1
            return new_root
        elif node.left:
            new_root = node.left
            node.left = new_root.right
            new_root.right = node
            new_root.rotation_count += 1
            return new_root
        return node

    def _height(self, node: Optional[BSTNode]) -> int:
        return node.height if node else 0

    def inorder(self) -> List[int]:
        """Return keys in sorted (inorder) traversal."""
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, node: Optional[BSTNode], result: List[int]) -> None:
        if node is None:
            return
        self._inorder(node.left, result)
        result.append(node.key)
        self._inorder(node.right, result)

    def total_rotations(self) -> int:
        """Count total rotations performed across all nodes."""
        return self._count_rotations(self.root)

    def _count_rotations(self, node: Optional[BSTNode]) -> int:
        if node is None:
            return 0
        return node.rotation_count + self._count_rotations(node.left) + self._count_rotations(node.right)

    @property
    def size(self) -> int:
        return self._size


if __name__ == "__main__":
    random.seed(99)
    bst = BalancedBST()
    keys = [random.randint(1, 1000) for _ in range(50)]
    for k in keys:
        bst.insert(k, f"val_{k}")
    sorted_keys = bst.inorder()
    print(f"Inserted {bst.size} keys")
    print(f"Sorted (first 10): {sorted_keys[:10]}")
    print(f"Total rotations: {bst.total_rotations()}")
    print(f"Tree height: {bst._height(bst.root)}")
