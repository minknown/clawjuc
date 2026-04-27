#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vortex Math - Vector and matrix math operations.

Provides 2D/3D vector operations and matrix transformations
including rotation, scaling, projection, and determinant calculation.
"""

from __future__ import annotations
import math
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class Vec2:
    """A 2D vector with common operations."""
    x: float
    y: float

    def __add__(self, other: Vec2) -> Vec2:
        return Vec2(self.x + other.x, self.y + other.y)

    def __sub__(self, other: Vec2) -> Vec2:
        return Vec2(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> Vec2:
        return Vec2(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> Vec2:
        return self.__mul__(scalar)

    def dot(self, other: Vec2) -> float:
        return self.x * other.x + self.y * other.y

    def cross(self, other: Vec2) -> float:
        return self.x * other.y - self.y * other.x

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def normalized(self) -> Vec2:
        m = self.magnitude()
        return Vec2(self.x / m, self.y / m) if m > 0 else Vec2(0.0, 0.0)

    def angle(self) -> float:
        return math.atan2(self.y, self.x)

    def rotate(self, radians: float) -> Vec2:
        cos_r = math.cos(radians)
        sin_r = math.sin(radians)
        return Vec2(self.x * cos_r - self.y * sin_r, self.x * sin_r + self.y * cos_r)

    def lerp(self, other: Vec2, t: float) -> Vec2:
        return Vec2(self.x + (other.x - self.x) * t, self.y + (other.y - self.y) * t)

    def __repr__(self) -> str:
        return f"Vec2({self.x:.4f}, {self.y:.4f})"


@dataclass
class Vec3:
    """A 3D vector with common operations."""
    x: float
    y: float
    z: float

    def __add__(self, other: Vec3) -> Vec3:
        return Vec3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other: Vec3) -> Vec3:
        return Vec3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, scalar: float) -> Vec3:
        return Vec3(self.x * scalar, self.y * scalar, self.z * scalar)

    def __rmul__(self, scalar: float) -> Vec3:
        return self.__mul__(scalar)

    def dot(self, other: Vec3) -> float:
        return self.x * other.x + self.y * other.y + self.z * other.z

    def cross(self, other: Vec3) -> Vec3:
        return Vec3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2 + self.z ** 2)

    def normalized(self) -> Vec3:
        m = self.magnitude()
        return Vec3(self.x / m, self.y / m, self.z / m) if m > 0 else Vec3(0, 0, 0)

    def __repr__(self) -> str:
        return f"Vec3({self.x:.4f}, {self.y:.4f}, {self.z:.4f})"


class Matrix3:
    """A 3x3 matrix for 2D transformations."""

    def __init__(self, data: Optional[List[List[float]]] = None):
        if data is None:
            self.data = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        else:
            self.data = [row[:] for row in data]

    @staticmethod
    def rotation(angle_degrees: float) -> Matrix3:
        """Create a 2D rotation matrix."""
        rad = math.radians(angle_degrees)
        c, s = math.cos(rad), math.sin(rad)
        return Matrix3([[c, -s, 0], [s, c, 0], [0, 0, 1]])

    @staticmethod
    def scale(sx: float, sy: float) -> Matrix3:
        """Create a 2D scaling matrix."""
        return Matrix3([[sx, 0, 0], [0, sy, 0], [0, 0, 1]])

    @staticmethod
    def translation(tx: float, ty: float) -> Matrix3:
        """Create a 2D translation matrix."""
        return Matrix3([[1, 0, tx], [0, 1, ty], [0, 0, 1]])

    def __mul__(self, other: Matrix3) -> Matrix3:
        """Multiply two 3x3 matrices."""
        result = [[0.0] * 3 for _ in range(3)]
        for i in range(3):
            for j in range(3):
                for k in range(3):
                    result[i][j] += self.data[i][k] * other.data[k][j]
        return Matrix3(result)

    def transform_vec2(self, v: Vec2) -> Vec2:
        """Apply this matrix transformation to a 2D vector."""
        x = self.data[0][0] * v.x + self.data[0][1] * v.y + self.data[0][2]
        y = self.data[1][0] * v.x + self.data[1][1] * v.y + self.data[1][2]
        return Vec2(x, y)

    def determinant(self) -> float:
        """Compute the determinant of this 3x3 matrix."""
        d = self.data
        return (
            d[0][0] * (d[1][1] * d[2][2] - d[1][2] * d[2][1])
            - d[0][1] * (d[1][0] * d[2][2] - d[1][2] * d[2][0])
            + d[0][2] * (d[1][0] * d[2][1] - d[1][1] * d[2][0])
        )

    def transpose(self) -> Matrix3:
        """Return the transpose of this matrix."""
        return Matrix3([[self.data[j][i] for j in range(3)] for i in range(3)])

    def __repr__(self) -> str:
        rows = ["[" + ", ".join(f"{v:>8.4f}" for v in row) + "]" for row in self.data]
        return "Matrix3(\n  " + "\n  ".join(rows) + "\n)"


if __name__ == "__main__":
    v1 = Vec2(3.0, 4.0)
    v2 = Vec2(1.0, 2.0)
    print(f"v1 = {v1}, magnitude = {v1.magnitude()}")
    print(f"v2 = {v2}, dot = {v1.dot(v2)}, cross = {v1.cross(v2)}")
    print(f"v1 normalized = {v1.normalized()}")
    print(f"v1 rotated 45 deg = {v1.rotate(math.pi / 4)}")
    print(f"lerp(v1, v2, 0.5) = {v1.lerp(v2, 0.5)}")

    a = Vec3(1, 0, 0)
    b = Vec3(0, 1, 0)
    c = a.cross(b)
    print(f"\na x b = {c}, dot(a,c) = {a.dot(c)}")

    rot = Matrix3.rotation(90)
    scale = Matrix3.scale(2.0, 0.5)
    trans = Matrix3.translation(5.0, 3.0)
    combined = trans * rot * scale

    p = Vec2(1.0, 1.0)
    transformed = combined.transform_vec2(p)
    print(f"\nTransform {p} -> {transformed}")
    print(f"Matrix determinant: {combined.determinant():.4f}")
    print(f"Transposed:\n{combined.transpose()}")
