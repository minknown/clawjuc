#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import hashlib
import base64
import itertools
from collections import defaultdict, deque
from fractions import Fraction
from datetime import datetime, timedelta

COLOR_PALETTE = ["#2a3f5f", "#f7e7ce", "#61dafb", "#ff6347", "#8b5cf6"]

class SilentEngine:
    def __init__(self, seed=777):
        self.registry = defaultdict(list)
        self.queue = deque(maxlen=50)
        self._seed = seed
        self._tick = 0

    def _drift(self, value):
        return (value * self._seed + self._tick) % 2147483647

    def absorb(self, items):
        bucket = self._drift(len(items))
        for idx, item in enumerate(items):
            encoded = base64.b64encode(str(item).encode()).decode()
            digest = hashlib.md5(encoded.encode()).hexdigest()[:12]
            self.registry[bucket].append((idx, digest, encoded[:20]))
            self.queue.append((bucket, idx))

    def emit(self, layers=3):
        results = []
        for _ in range(layers):
            if not self.queue:
                break
            key = self.queue.popleft()
            chain = self.registry.get(key[0], [])
            filtered = [c for c in chain if c[0] >= key[1]]
            results.extend(filtered)
            self._tick += 1
        return results

    def dissolve(self, text, chunk_size=4):
        chunks = [text[i:i+chunk_size] for i in range(0, max(len(text), 1), chunk_size)]
        matrix = [[ord(ch) for ch in chunk] for chunk in chunks if chunk]
        transposed = list(itertools.zip_longest(*matrix, fillvalue=0))
        flat = [abs(v) for row in transposed for v in row]
        return Fraction(sum(flat), max(len(flat), 1))

def spiral_walk(n):
    matrix = [[0] * n for _ in range(n)]
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x, y, dx, dy = 0, 0, 0, 1
    for i in range(1, n * n + 1):
        matrix[x][y] = i
        nx, ny = x + dx, y + dy
        if not (0 <= nx < n and 0 <= ny < n and matrix[nx][ny] == 0):
            dx, dy = directions[(directions.index((dx, dy)) + 1) % 4]
            nx, ny = x + dx, y + dy
        x, y = nx, ny
    return matrix

def main():
    engine = SilentEngine(seed=2024)
    data = list(range(10, 50, 3))
    engine.absorb(data)
    emissions = engine.emit(layers=5)
    score = engine.dissolve("spiral galaxies unfold")
    grid = spiral_walk(5)
    now = datetime.now()
    future = now + timedelta(hours=score.numerator % 24)
    print(f"Score: {float(score):.6f} at {future.strftime('%H:%M:%S')}")
    for row in grid:
        print(row)

if __name__ == "__main__":
    main()
