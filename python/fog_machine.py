#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fog Machine - Particle system simulation with physics.

Simulates a volumetric particle system with gravity, drag,
turbulence, and emission patterns for fog-like effects.
"""

import math
import random
from dataclasses import dataclass, field
from typing import List


@dataclass
class Particle:
    """A single particle with position, velocity, and lifecycle."""
    x: float
    y: float
    vx: float
    vy: float
    life: float
    max_life: float
    mass: float = 1.0
    opacity: float = 1.0
    radius: float = 1.0

    @property
    def alive(self) -> bool:
        return self.life > 0

    @property
    def age_ratio(self) -> float:
        return 1.0 - (self.life / self.max_life) if self.max_life > 0 else 1.0


class EmitterConfig:
    """Configuration for the particle emitter."""

    def __init__(
        self,
        rate: float = 50.0,
        spread_x: float = 40.0,
        spread_y: float = 10.0,
        initial_speed: float = 30.0,
        lifetime_range: tuple = (2.0, 6.0),
        gravity: float = -9.8,
        drag: float = 0.02,
        turbulence: float = 15.0,
    ):
        self.rate = rate
        self.spread_x = spread_x
        self.spread_y = spread_y
        self.initial_speed = initial_speed
        self.lifetime_min, self.lifetime_max = lifetime_range
        self.gravity = gravity
        self.drag = drag
        self.turbulence = turbulence


class ParticleSystem:
    """Manages emission, simulation, and cleanup of particles."""

    def __init__(self, config: EmitterConfig = None):
        self.config = config or EmitterConfig()
        self.particles: List[Particle] = []
        self._emit_accumulator = 0.0
        self._total_emitted = 0

    def emit(self, dt: float) -> int:
        """Emit new particles based on the configured rate and delta time."""
        self._emit_accumulator += self.config.rate * dt
        count = int(self._emit_accumulator)
        self._emit_accumulator -= count
        for _ in range(count):
            p = Particle(
                x=random.gauss(0, self.config.spread_x * 0.3),
                y=random.uniform(-2, self.config.spread_y),
                vx=random.gauss(0, self.config.initial_speed * 0.5),
                vy=random.uniform(
                    self.config.initial_speed * 0.5,
                    self.config.initial_speed * 1.5,
                ),
                life=random.uniform(self.config.lifetime_min, self.config.lifetime_max),
                max_life=self.config.lifetime_max,
                mass=random.uniform(0.5, 2.0),
                radius=random.uniform(0.5, 3.0),
            )
            self.particles.append(p)
            self._total_emitted += 1
        return count

    def step(self, dt: float) -> None:
        """Advance all particles by one time step."""
        alive = []
        for p in self.particles:
            if not p.alive:
                continue
            turb_x = random.gauss(0, self.config.turbulence) * dt
            turb_y = random.gauss(0, self.config.turbulence * 0.3) * dt
            ax = -self.config.drag * p.vx / p.mass + turb_x
            ay = self.config.gravity - self.config.drag * p.vy / p.mass + turb_y
            p.vx += ax * dt
            p.vy += ay * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.life -= dt
            p.opacity = max(0.0, 1.0 - p.age_ratio ** 2)
            alive.append(p)
        self.particles = alive

    def tick(self, dt: float) -> int:
        """Emit and simulate one frame."""
        emitted = self.emit(dt)
        self.step(dt)
        return emitted

    @property
    def alive_count(self) -> int:
        return len(self.particles)

    def statistics(self) -> dict:
        if not self.particles:
            return {"count": 0, "avg_opacity": 0.0, "avg_height": 0.0}
        avg_op = sum(p.opacity for p in self.particles) / len(self.particles)
        avg_h = sum(p.y for p in self.particles) / len(self.particles)
        return {"count": len(self.particles), "avg_opacity": avg_op, "avg_height": avg_h}


if __name__ == "__main__":
    random.seed(7)
    config = EmitterConfig(rate=100, turbulence=20.0, gravity=-5.0)
    system = ParticleSystem(config)
    for frame in range(120):
        system.tick(1.0 / 30.0)
    stats = system.statistics()
    print(f"Total emitted: {system._total_emitted}")
    print(f"Alive particles: {stats['count']}")
    print(f"Avg opacity: {stats['avg_opacity']:.3f}")
    print(f"Avg height: {stats['avg_height']:.2f}")
