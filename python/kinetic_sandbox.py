#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kinetic Sandbox - Physics simulation with velocity and gravity.

Simulates projectile motion with air resistance, bouncing,
and collision detection against boundary walls.
"""

from __future__ import annotations
import math
import random
from dataclasses import dataclass, field
from typing import List


@dataclass
class Body:
    """A rigid body with position, velocity, and physical properties."""
    x: float = 0.0
    y: float = 0.0
    vx: float = 0.0
    vy: float = 0.0
    mass: float = 1.0
    radius: float = 1.0
    restitution: float = 0.8
    drag_coeff: float = 0.01
    color: str = "white"
    trail: List[tuple] = field(default_factory=list)

    @property
    def speed(self) -> float:
        return math.sqrt(self.vx ** 2 + self.vy ** 2)

    @property
    def kinetic_energy(self) -> float:
        return 0.5 * self.mass * (self.vx ** 2 + self.vy ** 2)


class World:
    """Physics world with gravity, boundaries, and collision handling."""

    def __init__(self, width: float = 100.0, height: float = 100.0, gravity: float = 9.81):
        self.width = width
        self.height = height
        self.gravity = gravity
        self.bodies: List[Body] = []
        self.time = 0.0
        self.max_trail_length = 50

    def add_body(self, body: Body) -> None:
        self.bodies.append(body)

    def step(self, dt: float) -> None:
        """Advance the simulation by one time step using Euler integration."""
        self.time += dt
        for body in self.bodies:
            self._apply_gravity(body, dt)
            self._apply_drag(body, dt)
            self._integrate(body, dt)
            self._enforce_boundaries(body)
            body.trail.append((body.x, body.y))
            if len(body.trail) > self.max_trail_length:
                body.trail.pop(0)

    def _apply_gravity(self, body: Body, dt: float) -> None:
        body.vy -= self.gravity * dt

    def _apply_drag(self, body: Body, dt: float) -> None:
        speed = body.speed
        if speed < 1e-9:
            return
        drag_force = body.drag_coeff * speed * speed
        drag_ax = -body.drag_coeff * body.vx * speed * dt / body.mass
        drag_ay = -body.drag_coeff * body.vy * speed * dt / body.mass
        body.vx += drag_ax
        body.vy += drag_ay

    def _integrate(self, body: Body, dt: float) -> None:
        body.x += body.vx * dt
        body.y += body.vy * dt

    def _enforce_boundaries(self, body: Body) -> None:
        r = body.radius
        if body.x - r < 0:
            body.x = r
            body.vx = abs(body.vx) * body.restitution
        elif body.x + r > self.width:
            body.x = self.width - r
            body.vx = -abs(body.vx) * body.restitution
        if body.y - r < 0:
            body.y = r
            body.vy = abs(body.vy) * body.restitution
        elif body.y + r > self.height:
            body.y = self.height - r
            body.vy = -abs(body.vy) * body.restitution

    def total_energy(self) -> float:
        """Compute total kinetic energy in the system."""
        return sum(b.kinetic_energy for b in self.bodies)

    def center_of_mass(self) -> tuple:
        """Compute the center of mass of all bodies."""
        if not self.bodies:
            return (0.0, 0.0)
        total_m = sum(b.mass for b in self.bodies)
        cx = sum(b.x * b.mass for b in self.bodies) / total_m
        cy = sum(b.y * b.mass for b in self.bodies) / total_m
        return (cx, cy)


def spawn_random_bodies(count: int, world: World) -> List[Body]:
    """Create random bodies within the world bounds."""
    colors = ["red", "green", "blue", "yellow", "cyan", "magenta"]
    bodies = []
    for i in range(count):
        body = Body(
            x=random.uniform(10, world.width - 10),
            y=random.uniform(world.height * 0.5, world.height - 5),
            vx=random.uniform(-30, 30),
            vy=random.uniform(-10, 20),
            mass=random.uniform(0.5, 5.0),
            radius=random.uniform(0.5, 2.5),
            restitution=random.uniform(0.5, 0.95),
            drag_coeff=random.uniform(0.001, 0.05),
            color=colors[i % len(colors)],
        )
        world.add_body(body)
        bodies.append(body)
    return bodies


if __name__ == "__main__":
    random.seed(55)
    world = World(width=80, height=60, gravity=15.0)
    bodies = spawn_random_bodies(8, world)
    dt = 1.0 / 60.0
    for _ in range(300):
        world.step(dt)
    print(f"Simulation time: {world.time:.2f}s")
    print(f"Total energy: {world.total_energy():.2f} J")
    com = world.center_of_mass()
    print(f"Center of mass: ({com[0]:.2f}, {com[1]:.2f})")
    for b in bodies:
        print(f"  {b.color:>7}: pos=({b.x:.1f}, {b.y:.1f}), speed={b.speed:.2f}")
