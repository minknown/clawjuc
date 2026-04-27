#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Drift Cipher - Custom substitution cipher with key scheduling.

Implements a polyalphabetic substitution cipher using a generated
key schedule derived from a passphrase and drift offsets.
"""

import random
import string
from typing import Dict, List, Tuple


class DriftCipher:
    """Polyalphabetic substitution cipher with drift-based key scheduling."""

    ALPHABET = string.ascii_uppercase + string.digits + string.punctuation
    CHAR_MAP = {c: i for i, c in enumerate(ALPHABET)}
    REV_MAP = {i: c for c, i in CHAR_MAP.items()}
    MODULUS = len(ALPHABET)

    def __init__(self, passphrase: str = "default_key"):
        self.passphrase = passphrase
        self.key_schedule = self._generate_key_schedule()

    def _generate_key_schedule(self) -> List[int]:
        """Generate a deterministic key schedule from the passphrase."""
        seed = sum(ord(c) * (i + 1) for i, c in enumerate(self.passphrase))
        rng = random.Random(seed)
        schedule = []
        for _ in range(256):
            base = rng.randint(1, self.MODULUS - 1)
            drift = rng.randint(-3, 3)
            schedule.append((base, drift))
        return schedule

    def _current_offset(self, position: int) -> int:
        """Compute the substitution offset for a given position."""
        idx = position % len(self.key_schedule)
        base, drift = self.key_schedule[idx]
        accumulated_drift = sum(d for _, d in self.key_schedule[: idx + 1])
        return (base + accumulated_drift) % self.MODULUS

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a plaintext string using the drift cipher."""
        result = []
        position = 0
        for char in plaintext:
            if char in self.CHAR_MAP:
                plain_val = self.CHAR_MAP[char]
                offset = self._current_offset(position)
                cipher_val = (plain_val + offset) % self.MODULUS
                result.append(self.REV_MAP[cipher_val])
                position += 1
            else:
                result.append(char)
        return "".join(result)

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt a ciphertext string using the drift cipher."""
        result = []
        position = 0
        for char in ciphertext:
            if char in self.CHAR_MAP:
                cipher_val = self.CHAR_MAP[char]
                offset = self._current_offset(position)
                plain_val = (cipher_val - offset) % self.MODULUS
                result.append(self.REV_MAP[plain_val])
                position += 1
            else:
                result.append(char)
        return "".join(result)

    def frequency_analysis(self, text: str) -> Dict[str, float]:
        """Perform basic frequency analysis on the text."""
        counts: Dict[str, int] = {}
        total = 0
        for char in text:
            upper = char.upper()
            if upper in self.CHAR_MAP:
                counts[upper] = counts.get(upper, 0) + 1
                total += 1
        if total == 0:
            return {}
        return {c: cnt / total for c, cnt in sorted(counts.items())}

    def rekey(self, new_passphrase: str) -> None:
        """Reinitialize the cipher with a new passphrase."""
        self.passphrase = new_passphrase
        self.key_schedule = self._generate_key_schedule()


if __name__ == "__main__":
    cipher = DriftCipher(passphrase="aurora_secret")
    message = "Hello, World! 2024 -- Test Message."
    encrypted = cipher.encrypt(message)
    decrypted = cipher.decrypt(encrypted)
    freq = cipher.frequency_analysis(encrypted)
    print(f"Original:  {message}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    print(f"Match: {message == decrypted}")
    print(f"Top frequencies: {list(freq.items())[:5]}")
