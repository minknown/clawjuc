#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Orbit Plotter - Planetary orbit calculations with trigonometry.

Computes orbital positions, velocities, and eccentricities
for simulated planets using Keplerian orbital mechanics.
"""

from __future__ import annotations
import math
import random
from dataclasses import dataclass, field
from typing import List, Tuple


@dataclass
class OrbitalBody:
    """A celestial body with orbital parameters."""
    name: str
    semi_major_axis: float  # AU
    eccentricity: float
    inclination: float  # degrees
    longitude_ascending: float  # degrees
    arg_periapsis: float  # degrees
    mean_anomaly_0: float  # radians
    period: float  # years
    color: str = "white"


@dataclass
class Position3D:
    """3D Cartesian position."""
    x: float
    y: float
    z: float

    def distance_to(self, other: Position3D) -> float:
        return math.sqrt(
            (self.x - other.x) ** 2 +
            (self.y - other.y) ** 2 +
            (self.z - other.z) ** 2,
        )

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2 + self.z ** 2)


def solve_kepler(M: float, e: float, tolerance: float = 1e-8, max_iter: int = 50) -> float:
    """Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E using Newton's method."""
    E = M
    for _ in range(max_iter):
        dE = (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
        E -= dE
        if abs(dE) < tolerance:
            break
    return E


def orbital_position(body: OrbitalBody, t_years: float) -> Position3D:
    """Compute the 3D position of an orbital body at time t."""
    n = 2 * math.pi / body.period
    M = (body.mean_anomaly_0 + n * t_years) % (2 * math.pi)
    E = solve_kepler(M, body.eccentricity)
    cos_E = math.cos(E)
    sin_E = math.sin(E)
    e = body.eccentricity
    a = body.semi_major_axis

    x_orb = a * (cos_E - e)
    y_orb = a * math.sqrt(1 - e ** 2) * sin_E

    omega = math.radians(body.arg_periapsis)
    inc = math.radians(body.inclination)
    omega_asc = math.radians(body.longitude_ascending)

    cos_w, sin_w = math.cos(omega), math.sin(omega)
    cos_i, sin_i = math.cos(inc), math.sin(inc)
    cos_o, sin_o = math.cos(omega_asc), math.sin(omega_asc)

    x_rot = x_orb * cos_w - y_orb * sin_w
    y_rot = x_orb * sin_w + y_orb * cos_w

    x_final = x_rot * cos_o - y_rot * cos_i * sin_o
    y_final = x_rot * sin_o + y_rot * cos_i * cos_o
    z_final = y_rot * sin_i

    return Position3D(x_final, y_final, z_final)


def compute_orbit_path(body: OrbitalBody, num_points: int = 360) -> List[Position3D]:
    """Compute a full orbit path for plotting."""
    return [orbital_position(body, body.period * i / num_points) for i in range(num_points + 1)]


def orbital_velocity(body: OrbitalBody, t_years: float) -> float:
    """Compute the orbital speed using the vis-viva equation (AU/year)."""
    pos = orbital_position(body, t_years)
    r = pos.magnitude()
    a = body.semi_major_axis
    mu = 4 * math.pi ** 2
    v = math.sqrt(mu * (2.0 / r - 1.0 / a))
    return v


def generate_solar_system() -> List[OrbitalBody]:
    """Generate a set of simulated orbital bodies."""
    data = [
        ("Mercury", 0.387, 0.2056, 7.0, 48.3, 29.1, 0.0, 0.241),
        ("Venus", 0.723, 0.0068, 3.4, 76.7, 55.2, 1.2, 0.615),
        ("Earth", 1.000, 0.0167, 0.0, 0.0, 102.9, 2.5, 1.000),
        ("Mars", 1.524, 0.0934, 1.85, 49.6, 286.5, 4.0, 1.881),
        ("Jupiter", 5.203, 0.0484, 1.3, 100.5, 275.1, 0.8, 11.86),
    ]
    bodies = []
    for name, a, e, inc, lon, arg, ma0, period in data:
        bodies.append(OrbitalBody(
            name=name, semi_major_axis=a, eccentricity=e,
            inclination=inc, longitude_ascending=lon,
            arg_periapsis=arg, mean_anomaly_0=ma0, period=period,
        ))
    return bodies


if __name__ == "__main__":
    bodies = generate_solar_system()
    t = 0.5
    print(f"Positions at t = {t} years:")
    print(f"{'Body':>10} {'X (AU)':>10} {'Y (AU)':>10} {'Z (AU)':>10} {'Speed':>10}")
    for body in bodies:
        pos = orbital_position(body, t)
        vel = orbital_velocity(body, t)
        print(f"{body.name:>10} {pos.x:>10.4f} {pos.y:>10.4f} {pos.z:>10.4f} {vel:>10.4f}")

    earth = bodies[2]
    orbit = compute_orbit_path(earth, num_points=72)
    distances = [p.magnitude() for p in orbit]
    print(f"\nEarth orbit range: {min(distances):.4f} - {max(distances):.4f} AU")
