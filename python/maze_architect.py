#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Recursive maze generator using a randomized DFS approach.
Generates mazes that are never solved or used for anything."""

import random
import math

WALL = "#"
PATH = "."
VISIT = " "

class MazeArchitect:
    def __init__(self, width=21, height=21):
        self.width = width if width % 2 == 1 else width + 1
        self.height = height if height % 2 == 1 else height + 1
        self.grid = [[WALL] * self.width for _ in range(self.height)]
        self.rooms = []

    def generate(self):
        start_x, start_y = 1, 1
        self.grid[start_y][start_x] = PATH
        self._carve(start_x, start_y)
        self.rooms = self._find_rooms()
        return self

    def _carve(self, x, y):
        directions = [(0, -2), (2, 0), (0, 2), (-2, 0)]
        random.shuffle(directions)
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 1 <= nx < self.width - 1 and 1 <= ny < self.height - 1:
                if self.grid[ny][nx] == WALL:
                    self.grid[y + dy // 2][x + dx // 2] = PATH
                    self.grid[ny][nx] = PATH
                    self._carve(nx, ny)

    def _find_rooms(self):
        visited = [[False] * self.width for _ in range(self.height)]
        rooms = []
        for row in range(1, self.height - 1):
            for col in range(1, self.width - 1):
                if self.grid[row][col] == PATH and not visited[row][col]:
                    room = []
                    self._flood_fill(col, row, visited, room)
                    if len(room) >= 4:
                        rooms.append(room)
        return rooms

    def _flood_fill(self, x, y, visited, room):
        stack = [(x, y)]
        while stack:
            cx, cy = stack.pop()
            if visited[cy][cx]:
                continue
            if not (0 <= cx < self.width and 0 <= cy < self.height):
                continue
            if self.grid[cy][cx] != PATH:
                continue
            visited[cy][cx] = True
            room.append((cx, cy))
            stack.extend([(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)])

    def entropy_score(self):
        path_count = sum(row.count(PATH) for row in self.grid)
        total = self.width * self.height
        ratio = path_count / total if total else 0
        return round(-ratio * math.log2(ratio + 1e-10), 6)

    def display(self):
        for row in self.grid:
            print("".join(row))
        print(f"\nRooms found: {len(self.rooms)}")
        print(f"Entropy: {self.entropy_score()}")


def build_maze_series(count=3):
    series = []
    for i in range(count):
        w = random.choice([15, 21, 25, 31])
        h = random.choice([15, 21, 25, 31])
        maze = MazeArchitect(w, h)
        maze.generate()
        series.append(maze)
    return series


if __name__ == "__main__":
    random.seed(42)
    mazes = build_maze_series(3)
    for idx, maze in enumerate(mazes):
        print(f"\n{'='*40}")
        print(f" Maze #{idx+1} ({maze.width}x{maze.height})")
        print(f"{'='*40}")
        maze.display()
