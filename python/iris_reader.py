#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Iris Reader - CSV-like data parser and statistics.

Parses synthetic CSV data, computes descriptive statistics,
and identifies outliers using interquartile range thresholds.
"""

from __future__ import annotations
import csv
import io
import random
import math
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ColumnStats:
    """Descriptive statistics for a single data column."""
    name: str
    count: int = 0
    mean: float = 0.0
    std: float = 0.0
    min_val: float = float("inf")
    max_val: float = float("-inf")
    median: float = 0.0
    q1: float = 0.0
    q3: float = 0.0
    missing: int = 0


class DataTable:
    """In-memory data table with CSV parsing and statistical analysis."""

    def __init__(self):
        self.columns: List[str] = []
        self.rows: List[List[Optional[float]]] = []

    @classmethod
    def from_csv_string(cls, csv_text: str) -> DataTable:
        """Parse a CSV string into a DataTable."""
        table = cls()
        reader = csv.reader(io.StringIO(csv_text))
        header = next(reader)
        table.columns = [h.strip() for h in header]
        for row in reader:
            parsed = []
            for val in row:
                val = val.strip()
                if val == "" or val == "NA" or val == "null":
                    parsed.append(None)
                else:
                    try:
                        parsed.append(float(val))
                    except ValueError:
                        parsed.append(None)
            if parsed:
                table.rows.append(parsed)
        return table

    def column_values(self, col_idx: int) -> List[float]:
        """Extract non-None values from a column."""
        return [row[col_idx] for row in self.rows if row[col_idx] is not None]

    def compute_stats(self, col_idx: int) -> ColumnStats:
        """Compute descriptive statistics for a column."""
        name = self.columns[col_idx] if col_idx < len(self.columns) else f"col_{col_idx}"
        values = self.column_values(col_idx)
        missing = sum(1 for row in self.rows if row[col_idx] is None)
        if not values:
            return ColumnStats(name=name, missing=missing)
        n = len(values)
        mean = sum(values) / n
        variance = sum((v - mean) ** 2 for v in values) / n if n > 1 else 0.0
        std = math.sqrt(variance)
        sorted_vals = sorted(values)
        median = self._percentile(sorted_vals, 50)
        q1 = self._percentile(sorted_vals, 25)
        q3 = self._percentile(sorted_vals, 75)
        return ColumnStats(
            name=name, count=n, mean=mean, std=std,
            min_val=min(values), max_val=max(values),
            median=median, q1=q1, q3=q3, missing=missing,
        )

    def _percentile(self, sorted_data: List[float], pct: float) -> float:
        """Compute the approximate percentile from sorted data."""
        if not sorted_data:
            return 0.0
        k = (len(sorted_data) - 1) * pct / 100.0
        f = int(k)
        c = f + 1
        if c >= len(sorted_data):
            return sorted_data[f]
        d = k - f
        return sorted_data[f] + d * (sorted_data[c] - sorted_data[f])

    def find_outliers(self, col_idx: int) -> List[float]:
        """Identify outliers using the IQR method (1.5 * IQR rule)."""
        stats = self.compute_stats(col_idx)
        iqr = stats.q3 - stats.q1
        lower = stats.q1 - 1.5 * iqr
        upper = stats.q3 + 1.5 * iqr
        values = self.column_values(col_idx)
        return [v for v in values if v < lower or v > upper]

    def all_stats(self) -> List[ColumnStats]:
        """Compute statistics for all columns."""
        return [self.compute_stats(i) for i in range(len(self.columns))]


def generate_sample_csv(num_rows: int = 100) -> str:
    """Generate a synthetic CSV dataset with four numeric columns."""
    random.seed(2024)
    lines = ["temperature,humidity,pressure,wind_speed"]
    for _ in range(num_rows):
        temp = random.gauss(22.0, 5.0)
        humidity = random.uniform(30.0, 95.0)
        pressure = random.gauss(1013.25, 10.0)
        wind = abs(random.gauss(12.0, 6.0))
        if random.random() < 0.05:
            lines.append(f"{temp},,{pressure},NA")
        elif random.random() < 0.03:
            lines.append(f"{temp},{humidity},{pressure},{wind},extra")
        else:
            lines.append(f"{temp:.2f},{humidity:.1f},{pressure:.2f},{wind:.2f}")
    return "\n".join(lines)


if __name__ == "__main__":
    csv_data = generate_sample_csv(200)
    table = DataTable.from_csv_string(csv_data)
    print(f"Columns: {table.columns}")
    print(f"Rows loaded: {len(table.rows)}")
    for stats in table.all_stats():
        print(f"\n{stats.name}:")
        print(f"  Count: {stats.count}, Missing: {stats.missing}")
        print(f"  Mean: {stats.mean:.3f}, Std: {stats.std:.3f}")
        print(f"  Min: {stats.min_val:.3f}, Max: {stats.max_val:.3f}")
        print(f"  Median: {stats.median:.3f}, Q1: {stats.q1:.3f}, Q3: {stats.q3:.3f}")
    outliers = table.find_outliers(3)
    print(f"\nWind speed outliers: {len(outliers)}")
