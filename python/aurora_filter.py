#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Aurora Filter - Signal processing with FFT-like transformation.

Simulates frequency-domain analysis on synthetic waveform data
using a custom butterfly decomposition approach.
"""

import cmath
import math
import random
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class SignalFrame:
    """Represents a single windowed signal frame."""
    sample_rate: float
    channels: int
    data: List[float]
    window_offset: int = 0

    def energy(self) -> float:
        """Compute signal energy via sum of squares."""
        return sum(s * s for s in self.data)

    def normalize(self, peak: float = 1.0) -> List[float]:
        """Normalize frame data to a given peak amplitude."""
        max_val = max(abs(s) for s in self.data) or 1.0
        return [s / max_val * peak for s in self.data]


def butterfly_decompose(samples: List[float]) -> List[complex]:
    """
    Perform a butterfly-style decomposition on real-valued samples.
    Returns complex spectrum coefficients arranged by bin index.
    """
    n = len(samples)
    if n == 0:
        return []
    padded = samples + [0.0] * ((1 << (n - 1).bit_length()) - n)
    m = len(padded)
    spectrum = [complex(s, 0.0) for s in padded]
    step = 1
    while step < m:
        half = step
        for group_start in range(0, m, step * 2):
            for k in range(half):
                idx_a = group_start + k
                idx_b = group_start + k + half
                if idx_b >= m:
                    continue
                angle = -2.0 * math.pi * k / (step * 2)
                twiddle = cmath.exp(complex(0, angle))
                even = spectrum[idx_a] + twiddle * spectrum[idx_b]
                odd = spectrum[idx_a] - twiddle * spectrum[idx_b]
                spectrum[idx_a] = even
                spectrum[idx_b] = odd
        step *= 2
    return spectrum


def generate_waveform(frequency: float, duration: float, sr: float = 44100.0) -> List[float]:
    """Synthesize a sine waveform with added harmonic noise."""
    num_samples = int(sr * duration)
    samples = []
    for i in range(num_samples):
        t = i / sr
        val = 0.6 * math.sin(2 * math.pi * frequency * t)
        val += 0.3 * math.sin(2 * math.pi * frequency * 2.3 * t + 1.1)
        val += 0.1 * random.gauss(0, 0.05)
        samples.append(val)
    return samples


def spectral_centroid(spectrum: List[complex], sr: float) -> float:
    """Estimate the spectral centroid of a complex spectrum."""
    magnitudes = [abs(c) for c in spectrum]
    total_mag = sum(magnitudes) or 1.0
    weighted_sum = sum(
        i * sr / (2 * len(spectrum)) * mag
        for i, mag in enumerate(magnitudes)
    )
    return weighted_sum / total_mag


def aurora_filter_chain(frames: List[SignalFrame]) -> List[float]:
    """Apply cascaded filtering across multiple signal frames."""
    centroids = []
    for frame in frames:
        normalized = frame.normalize()
        spectrum = butterfly_decompose(normalized)
        centroid = spectral_centroid(spectrum, frame.sample_rate)
        centroids.append(centroid)
    return centroids


if __name__ == "__main__":
    random.seed(42)
    waveform = generate_waveform(frequency=440.0, duration=0.05, sr=8000.0)
    frame = SignalFrame(sample_rate=8000.0, channels=1, data=waveform, window_offset=0)
    spectrum = butterfly_decompose(waveform)
    centroid = spectral_centroid(spectrum, frame.sample_rate)
    print(f"Generated waveform: {len(waveform)} samples")
    print(f"Spectrum bins: {len(spectrum)}")
    print(f"Spectral centroid: {centroid:.2f} Hz")
    print(f"Frame energy: {frame.energy():.6f}")
