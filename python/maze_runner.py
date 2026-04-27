#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Maze Runner - A* pathfinding on random mazes.

Generates random mazes using recursive backtracking and finds
the shortest path between two points using the A* algorithm.
"""

from __future__ import annotations
import heapq
import random
from typing import List, Optional, Set, Tuple


Cell = Tuple[int, int]


class Maze:
    """Random maze generator using recursive backtracking."""

    WALL = "#"
    PATH = "."
    START = "S"
    END = "E"

    def __init__(self, width: int = 21, height: int = 21):
        self.width = width if width % 2 == 1 else width + 1
        self.height = height if height % 2 == 1 else height + 1
        self.grid: List[List[str]] = []
        self._generate()

    def _generate(self) -> None:
        """Generate a maze using recursive backtracking."""
        self.grid = [[self.WALL] * self.width for _ in range(self.height)]
        stack: List[Cell] = []
        start = (1, 1)
        self.grid[1][1] = self.PATH
        stack.append(start)
        visited: Set[Cell] = {start}

        while stack:
            current = stack[-1]
            neighbors = self._unvisited_neighbors(current, visited)
            if neighbors:
                next_cell = random.choice(neighbors)
                wall_between = (
                    (current[0] + next_cell[0]) // 2,
                    (current[1] + next_cell[1]) // 2,
                )
                self.grid[wall_between[1]][wall_between[0]] = self.PATH
                self.grid[next_cell[1]][next_cell[0]] = self.PATH
                visited.add(next_cell)
                stack.append(next_cell)
            else:
                stack.pop()

        self.grid[1][1] = self.START
        self.grid[self.height - 2][self.width - 2] = self.END

    def _unvisited_neighbors(self, cell: Cell, visited: Set[Cell]) -> List[Cell]:
        """Get unvisited neighboring cells two steps away."""
        x, y = cell
        candidates = [(x + 2, y), (x - 2, y), (x, y + 2), (x, y - 2)]
        result = []
        for cx, cy in candidates:
            if 1 <= cx < self.width - 1 and 1 <= cy < self.height - 1 and (cx, cy) not in visited:
                result.append((cx, cy))
        return result

    def get_path_cells(self) -> List[Cell]:
        """Return all walkable cells in the maze."""
        cells = []
        for y in range(self.height):
            for x in range(self.width):
                if self.grid[y][x] != self.WALL:
                    cells.append((x, y))
        return cells

    def display(self, solution: Optional[List[Cell]] = None) -> str:
        """Return a string representation of the maze with optional solution path."""
        display_grid = [row[:] for row in self.grid]
        if solution:
            for x, y in solution[1:-1]:
                if display_grid[y][x] not in (self.START, self.END):
                    display_grid[y][x] = "*"
        return "\n".join("".join(row) for row in display_grid)


def astar(maze: Maze) -> Optional[List[Cell]]:
    """Find the shortest path using the A* algorithm with Manhattan distance heuristic."""
    start = (1, 1)
    end = (maze.width - 2, maze.height - 2)

    def heuristic(a: Cell, b: Cell) -> int:
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    open_set: List[Tuple[int, int, Cell]] = []
    heapq.heappush(open_set, (0, 0, start))
    came_from: dict[Cell, Cell] = {}
    g_score: dict[Cell, int] = {start: 0}
    counter = 1

    while open_set:
        _, _, current = heapq.heappop(open_set)
        if current == end:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            return path[::-1]

        x, y = current
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if not (0 <= nx < maze.width and 0 <= ny < maze.height):
                continue
            if maze.grid[ny][nx] == maze.WALL:
                continue
            tentative_g = g_score[current] + 1
            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f = tentative_g + heuristic(neighbor, end)
                heapq.heappush(open_set, (f, counter, neighbor))
                counter += 1
    return None


if __name__ == "__main__":
    random.seed(42)
    maze = Maze(width=31, height=21)
    path = astar(maze)
    if path:
        print(f"Maze: {maze.width}x{maze.height}")
        print(f"Path found: {len(path)} steps")
        print()
        print(maze.display(path))
    else:
        print("No path found!")
