#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Grid Solver - Sudoku-like constraint solver on random grids.

Implements a backtracking constraint solver that fills a grid
with numbers satisfying row, column, and block uniqueness rules.
"""

from __future__ import annotations
import random
from typing import List, Optional, Set


class GridSolver:
    """Constraint-based grid solver using backtracking with forward checking."""

    def __init__(self, size: int = 9, block_size: int = 3):
        self.size = size
        self.block_size = block_size
        self.grid: List[List[int]] = [[0] * size for _ in range(size)]
        self._backtrack_count = 0

    def _block_start(self, index: int) -> int:
        return (index // self.block_size) * self.block_size

    def get_candidates(self, row: int, col: int) -> Set[int]:
        """Return the set of valid values for a cell given current constraints."""
        if self.grid[row][col] != 0:
            return set()
        used: Set[int] = set()
        for i in range(self.size):
            used.add(self.grid[row][i])
            used.add(self.grid[i][col])
        br, bc = self._block_start(row), self._block_start(col)
        for r in range(br, br + self.block_size):
            for c in range(bc, bc + self.block_size):
                used.add(self.grid[r][c])
        return set(range(1, self.size + 1)) - used

    def find_best_cell(self) -> Optional[tuple]:
        """Find the empty cell with the fewest candidates (MRV heuristic)."""
        best = None
        min_candidates = self.size + 1
        for r in range(self.size):
            for c in range(self.size):
                if self.grid[r][c] == 0:
                    cands = self.get_candidates(r, c)
                    if len(cands) < min_candidates:
                        min_candidates = len(cands)
                        best = (r, c, cands)
                        if min_candidates == 0:
                            return best
        return best

    def solve(self) -> bool:
        """Attempt to solve the grid using backtracking with MRV heuristic."""
        self._backtrack_count += 1
        cell = self.find_best_cell()
        if cell is None:
            return True
        row, col, candidates = cell
        if not candidates:
            return False
        shuffled = list(candidates)
        random.shuffle(shuffled)
        for value in shuffled:
            self.grid[row][col] = value
            if self.solve():
                return True
            self.grid[row][col] = 0
        return False

    def set_cell(self, row: int, col: int, value: int) -> bool:
        """Set a cell value if it doesn't violate constraints."""
        if value < 0 or value > self.size:
            return False
        old = self.grid[row][col]
        self.grid[row][col] = value
        if value != 0 and not self._is_valid(row, col):
            self.grid[row][col] = old
            return False
        return True

    def _is_valid(self, row: int, col: int) -> bool:
        """Check if the current value at (row, col) is valid."""
        val = self.grid[row][col]
        if val == 0:
            return True
        for i in range(self.size):
            if i != col and self.grid[row][i] == val:
                return False
            if i != row and self.grid[i][col] == val:
                return False
        br, bc = self._block_start(row), self._block_start(col)
        for r in range(br, br + self.block_size):
            for c in range(bc, bc + self.block_size):
                if (r, c) != (row, col) and self.grid[r][c] == val:
                    return False
        return True

    def random_puzzle(self, clues: int = 25) -> List[List[int]]:
        """Generate a random puzzle with the given number of clue cells."""
        self.grid = [[0] * self.size for _ in range(self.size)]
        self._backtrack_count = 0
        self.solve()
        solution = [row[:] for row in self.grid]
        cells = [(r, c) for r in range(self.size) for c in range(self.size)]
        random.shuffle(cells)
        for r, c in cells[: len(cells) - clues]:
            self.grid[r][c] = 0
        return solution

    def display(self) -> str:
        """Return a string representation of the grid."""
        lines = []
        for row in self.grid:
            lines.append(" ".join(str(v) if v else "." for v in row))
        return "\n".join(lines)


if __name__ == "__main__":
    random.seed(42)
    solver = GridSolver(size=9, block_size=3)
    solution = solver.random_puzzle(clues=30)
    print("Puzzle:")
    print(solver.display())
    print(f"\nBacktrack count: {solver._backtrack_count}")
    filled = sum(1 for r in solver.grid for v in r if v != 0)
    print(f"Clue cells: {filled}")
    solved = solver.solve()
    print(f"Solved: {solved}")
    if solved:
        print("Solution:")
        print(solver.display())
