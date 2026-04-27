#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pixel Canvas - ASCII art rendering from 2D arrays.

Renders 2D numeric arrays as ASCII art using configurable
character ramps, contrast adjustment, and border framing.
"""

from __future__ import annotations
import math
import random
from typing import List, Optional, Tuple


class ASCIIRenderer:
    """Renders 2D arrays as ASCII art with configurable character mapping."""

    DEFAULT_RAMP = " .:-=+*#%@"

    def __init__(self, width: int = 60, height: int = 20, ramp: Optional[str] = None):
        self.width = width
        self.height = height
        self.ramp = ramp or self.DEFAULT_RAMP
        self.canvas: List[List[float]] = [[0.0] * width for _ in range(height)]

    def set_pixel(self, x: int, y: int, value: float) -> None:
        """Set a single pixel value (0.0 to 1.0)."""
        if 0 <= x < self.width and 0 <= y < self.height:
            self.canvas[y][x] = max(0.0, min(1.0, value))

    def fill_circle(self, cx: float, cy: float, radius: float, intensity: float = 1.0) -> int:
        """Draw a filled circle on the canvas. Returns number of pixels set."""
        count = 0
        for y in range(self.height):
            for x in range(self.width):
                dx = x - cx
                dy = y - cy
                dist = math.sqrt(dx * dx + dy * dy)
                if dist <= radius:
                    falloff = max(0.0, 1.0 - dist / radius) * intensity
                    self.canvas[y][x] = max(self.canvas[y][x], falloff)
                    count += 1
        return count

    def fill_rect(self, x1: int, y1: int, x2: int, y2: int, intensity: float = 1.0) -> int:
        """Draw a filled rectangle. Returns number of pixels set."""
        count = 0
        for y in range(max(0, y1), min(self.height, y2)):
            for x in range(max(0, x1), min(self.width, x2)):
                self.canvas[y][x] = max(self.canvas[y][x], intensity)
                count += 1
        return count

    def apply_noise(self, amplitude: float = 0.1) -> None:
        """Add random noise to every pixel on the canvas."""
        for y in range(self.height):
            for x in range(self.width):
                self.canvas[y][x] = max(0.0, min(1.0, self.canvas[y][x] + random.gauss(0, amplitude)))

    def normalize(self) -> None:
        """Normalize the canvas so the brightest pixel is 1.0."""
        max_val = max(max(row) for row in self.canvas)
        if max_val > 0:
            for y in range(self.height):
                for x in range(self.width):
                    self.canvas[y][x] /= max_val

    def adjust_contrast(self, factor: float = 1.5) -> None:
        """Adjust contrast by scaling values around 0.5."""
        for y in range(self.height):
            for x in range(self.width):
                v = (self.canvas[y][x] - 0.5) * factor + 0.5
                self.canvas[y][x] = max(0.0, min(1.0, v))

    def invert(self) -> None:
        """Invert all pixel values."""
        for y in range(self.height):
            for x in range(self.width):
                self.canvas[y][x] = 1.0 - self.canvas[y][x]

    def render(self, border: bool = False) -> str:
        """Render the canvas as an ASCII art string."""
        lines = []
        for row in self.canvas:
            line = ""
            for val in row:
                idx = int(val * (len(self.ramp) - 1))
                idx = max(0, min(len(self.ramp) - 1, idx))
                line += self.ramp[idx]
            lines.append(line)
        if border:
            hline = "+" + "-" * self.width + "+"
            lines = [hline] + [f"|{line}|" for line in lines] + [hline]
        return "\n".join(lines)

    def clear(self) -> None:
        """Reset all pixels to zero."""
        self.canvas = [[0.0] * self.width for _ in range(self.height)]


def render_plasma(width: int = 60, height: int = 20) -> str:
    """Generate a plasma-like pattern and render it as ASCII art."""
    renderer = ASCIIRenderer(width=width, height=height)
    for y in range(height):
        for x in range(width):
            v1 = math.sin(x * 0.1) * 0.5 + 0.5
            v2 = math.sin(y * 0.15 + 1.0) * 0.5 + 0.5
            v3 = math.sin((x + y) * 0.08 + 2.5) * 0.5 + 0.5
            v4 = math.sin(math.sqrt(x * x + y * y) * 0.1) * 0.5 + 0.5
            val = (v1 + v2 + v3 + v4) / 4.0
            renderer.set_pixel(x, y, val)
    return renderer.render(border=True)


if __name__ == "__main__":
    random.seed(123)
    r = ASCIIRenderer(width=40, height=12)
    r.fill_circle(10, 6, 4, 1.0)
    r.fill_circle(30, 6, 3, 0.7)
    r.fill_rect(18, 3, 24, 9, 0.4)
    r.apply_noise(0.05)
    r.normalize()
    print("Canvas with shapes:")
    print(r.render(border=True))
    print("\nPlasma pattern:")
    print(render_plasma(50, 10))
