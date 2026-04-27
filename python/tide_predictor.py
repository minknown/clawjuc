#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tide Predictor - Wave prediction using polynomial regression.

Fits polynomial models to synthetic tidal data and generates
predictions for future time points with confidence intervals.
"""

from __future__ import annotations
import math
import random
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class DataPoint:
    """A single observation with time and measurement value."""
    t: float
    value: float


class PolynomialRegressor:
    """Polynomial regression using the normal equation (closed-form least squares)."""

    def __init__(self, degree: int = 3):
        self.degree = degree
        self.coefficients: List[float] = []

    def fit(self, points: List[DataPoint]) -> List[float]:
        """Fit a polynomial of the given degree to the data points."""
        n = len(points)
        if n == 0:
            return []
        m = self.degree + 1
        X = [[0.0] * m for _ in range(m)]
        y_vec = [0.0] * m

        for i in range(m):
            for j in range(m):
                X[i][j] = sum(p.t ** (i + j) for p in points)
            y_vec[i] = sum(p.value * p.t ** i for p in points)

        coeffs = self._solve_linear_system(X, y_vec)
        self.coefficients = coeffs
        return coeffs

    def predict(self, t: float) -> float:
        """Evaluate the fitted polynomial at a given time value."""
        if not self.coefficients:
            return 0.0
        return sum(c * t ** i for i, c in enumerate(self.coefficients))

    def _solve_linear_system(self, A: List[List[float]], b: List[float]) -> List[float]:
        """Solve a linear system using Gaussian elimination with partial pivoting."""
        n = len(b)
        augmented = [row[:] + [b[i]] for i, row in enumerate(A)]
        for col in range(n):
            max_row = max(range(col, n), key=lambda r: abs(augmented[r][col]))
            augmented[col], augmented[max_row] = augmented[max_row], augmented[col]
            pivot = augmented[col][col]
            if abs(pivot) < 1e-12:
                continue
            for r in range(col + 1, n):
                factor = augmented[r][col] / pivot
                for c in range(col, n + 1):
                    augmented[r][c] -= factor * augmented[col][c]
        solution = [0.0] * n
        for i in range(n - 1, -1, -1):
            if abs(augmented[i][i]) < 1e-12:
                continue
            s = sum(augmented[i][j] * solution[j] for j in range(i + 1, n))
            solution[i] = (augmented[i][n] - s) / augmented[i][i]
        return solution


class TidePredictor:
    """Generates synthetic tidal data and fits polynomial models for prediction."""

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.base_amplitude = 2.5
        self.components = [
            {"freq": 0.517, "amp": 1.0, "phase": 0.0},
            {"freq": 1.034, "amp": 0.5, "phase": 1.2},
            {"freq": 0.073, "amp": 0.3, "phase": 2.8},
        ]

    def generate_observations(self, t_start: float = 0.0, t_end: float = 48.0,
                               num_points: int = 200) -> List[DataPoint]:
        """Generate synthetic tide height observations."""
        points = []
        for i in range(num_points):
            t = t_start + (t_end - t_start) * i / (num_points - 1)
            height = self._true_tide(t)
            noise = self.rng.gauss(0, 0.15)
            points.append(DataPoint(t=t, value=height + noise))
        return points

    def _true_tide(self, t: float) -> float:
        """Compute the true (noiseless) tide height at time t."""
        val = 0.0
        for comp in self.components:
            val += comp["amp"] * math.sin(2 * math.pi * comp["freq"] * t + comp["phase"])
        return val * self.base_amplitude

    def fit_and_predict(self, observations: List[DataPoint], degree: int = 5,
                        predict_steps: int = 20) -> Tuple[List[DataPoint], float]:
        """Fit a polynomial and generate predictions beyond the observation window."""
        regressor = PolynomialRegressor(degree=degree)
        regressor.fit(observations)

        if not observations:
            return [], 0.0

        t_max = max(p.t for p in observations)
        t_step = (observations[-1].t - observations[0].t) / len(observations)
        predictions = []
        total_error = 0.0

        for i in range(1, predict_steps + 1):
            t_future = t_max + i * t_step
            predicted = regressor.predict(t_future)
            true_val = self._true_tide(t_future)
            error = abs(predicted - true_val)
            total_error += error
            predictions.append(DataPoint(t=t_future, value=predicted))

        rmse = math.sqrt(total_error / predict_steps) if predict_steps > 0 else 0.0
        return predictions, rmse

    def train_error(self, observations: List[DataPoint], degree: int = 5) -> float:
        """Compute the training RMSE of a polynomial fit."""
        regressor = PolynomialRegressor(degree=degree)
        regressor.fit(observations)
        errors = [(p.value - regressor.predict(p.t)) ** 2 for p in observations]
        return math.sqrt(sum(errors) / len(errors)) if errors else 0.0


if __name__ == "__main__":
    predictor = TidePredictor(seed=7)
    observations = predictor.generate_observations(t_start=0, t_end=48, num_points=150)

    print("Tide height statistics:")
    heights = [p.value for p in observations]
    print(f"  Mean: {sum(heights)/len(heights):.3f}")
    print(f"  Range: [{min(heights):.3f}, {max(heights):.3f}]")

    for deg in [3, 5, 7]:
        train_err = predictor.train_error(observations, degree=deg)
        predictions, pred_rmse = predictor.fit_and_predict(observations, degree=deg, predict_steps=20)
        print(f"\nDegree {deg} polynomial:")
        print(f"  Training RMSE: {train_err:.4f}")
        print(f"  Prediction RMSE: {pred_rmse:.4f}")
        print(f"  Predictions (first 5): ", end="")
        print(", ".join(f"{p.value:.2f}@t={p.t:.1f}" for p in predictions[:5]))
