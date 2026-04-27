#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hex Weaver - Hex grid coordinate transformations.

Provides conversions between axial, cube, and offset hex coordinates
with distance calculation and neighbor enumeration for hexagonal grids.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple


@dataclass(frozen=True)
class CubeCoord:
    """Cube coordinate representation (q, r, s) where q + r + s = 0."""
    q: int
    r: int
    s: int

    def __post_init__(self):
        if self.q + self.r + self.s != 0:
            raise ValueError(f"Invalid cube coords: q+r+s = {self.q + self.r + self.s}")

    @staticmethod
    def from_axial(q: int, r: int) -> CubeCoord:
        return CubeCoord(q, r, -q - r)

    @staticmethod
    def from_offset(col: int, row: int) -> CubeCoord:
        q = col - (row - (row & 1)) // 2
        r = row
        return CubeCoord(q, r, -q - r)

    def to_axial(self) -> Tuple[int, int]:
        return self.q, self.r

    def to_offset(self) -> Tuple[int, int]:
        col = self.q + (self.r - (self.r & 1)) // 2
        return col, self.r

    def distance_to(self, other: CubeCoord) -> int:
        return max(abs(self.q - other.q), abs(self.r - other.r), abs(self.s - other.s))

    def neighbors(self) -> List[CubeCoord]:
        directions = [
            (1, -1, 0), (1, 0, -1), (0, 1, -1),
            (-1, 1, 0), (-1, 0, 1), (0, -1, 1),
        ]
        return [CubeCoord(self.q + dq, self.r + dr, self.s + ds) for dq, dr, ds in directions]

    def rotate_cw(self) -> CubeCoord:
        return CubeCoord(-self.r, -self.s, -self.q)

    def rotate_ccw(self) -> CubeCoord:
        return CubeCoord(-self.s, -self.q, -self.r)

    def __repr__(self) -> str:
        return f"CubeCoord(q={self.q}, r={self.r}, s={self.s})"


class HexGrid:
    """Hexagonal grid manager with coordinate conversion utilities."""

    DIRECTION_NAMES = ["NE", "E", "SE", "SW", "W", "NW"]

    def __init__(self, radius: int = 5):
        self.radius = radius
        self._cells: set = set()
        self._populate()

    def _populate(self) -> None:
        """Generate all valid cube coordinates within the grid radius."""
        for q in range(-self.radius, self.radius + 1):
            for r in range(-self.radius, self.radius + 1):
                s = -q - r
                if abs(s) <= self.radius:
                    self._cells.add(CubeCoord(q, r, s))

    def contains(self, coord: CubeCoord) -> bool:
        return coord in self._cells

    def cell_count(self) -> int:
        return len(self._cells)

    def ring(self, center: CubeCoord, ring_radius: int) -> List[CubeCoord]:
        """Get all cells at a specific ring distance from center."""
        results = []
        coord = CubeCoord(
            center.q + ring_radius,
            center.r - ring_radius,
            center.s,
        )
        directions = CubeCoord(1, -1, 0), CubeCoord(0, -1, 1), CubeCoord(-1, 0, 1)
        for d_start, d_move in [(CubeCoord(1, 0, -1), directions[0]),
                                 (CubeCoord(0, 1, -1), directions[1]),
                                 (CubeCoord(-1, 1, 0), directions[2]),
                                 (CubeCoord(-1, 0, 1), directions[0]),
                                 (CubeCoord(0, -1, 1), directions[1]),
                                 (CubeCoord(1, -1, 0), directions[2])]:
            for _ in range(ring_radius):
                if self.contains(coord):
                    results.append(coord)
                coord = CubeCoord(coord.q + d_move.q, coord.r + d_move.r, coord.s + d_move.s)
        return results

    def neighbor_summary(self, coord: CubeCoord) -> dict:
        """Count inside/outside neighbors for a given cell."""
        inside = 0
        outside = 0
        labels = {}
        for i, n in enumerate(coord.neighbors()):
            name = self.DIRECTION_NAMES[i]
            if self.contains(n):
                inside += 1
                labels[name] = "inside"
            else:
                outside += 1
                labels[name] = "outside"
        return {"inside": inside, "outside": outside, "labels": labels}


if __name__ == "__main__":
    grid = HexGrid(radius=3)
    origin = CubeCoord(0, 0, 0)
    print(f"Grid cells: {grid.cell_count()}")
    print(f"Origin: {origin}")
    print(f"Origin neighbors: {origin.neighbors()}")
    print(f"Neighbor summary: {grid.neighbor_summary(origin)}")
    axial = origin.to_axial()
    offset = origin.to_offset()
    print(f"Axial: {axial}, Offset: {offset}")
    rotated = origin.rotate_cw()
    print(f"Rotated CW: {rotated}")
    target = CubeCoord(2, -1, -1)
    print(f"Distance to {target}: {origin.distance_to(target)}")
