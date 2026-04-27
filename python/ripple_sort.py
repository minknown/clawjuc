#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ripple Sort - Multiple sorting algorithm implementations.

Provides various sorting algorithms including quicksort, mergesort,
heapsort, insertion sort, and counting sort with benchmarking support.
"""

from __future__ import annotations
import random
import time
from typing import Callable, List, TypeVar

T = TypeVar("T")


def insertion_sort(arr: List[T]) -> List[T]:
    """Sort a list using insertion sort (stable, O(n^2) average)."""
    result = arr[:]
    for i in range(1, len(result)):
        key = result[i]
        j = i - 1
        while j >= 0 and result[j] > key:
            result[j + 1] = result[j]
            j -= 1
        result[j + 1] = key
    return result


def merge_sort(arr: List[T]) -> List[T]:
    """Sort a list using merge sort (stable, O(n log n) guaranteed)."""
    if len(arr) <= 1:
        return arr[:]
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return _merge(left, right)


def _merge(left: List[T], right: List[T]) -> List[T]:
    """Merge two sorted lists into a single sorted list."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def quick_sort(arr: List[T]) -> List[T]:
    """Sort a list using quicksort with median-of-three pivot."""
    result = arr[:]
    _quick_sort_helper(result, 0, len(result) - 1)
    return result


def _quick_sort_helper(arr: List[T], lo: int, hi: int) -> None:
    if lo < hi:
        pivot = _median_of_three(arr, lo, hi)
        p = _partition(arr, lo, hi, pivot)
        _quick_sort_helper(arr, lo, p - 1)
        _quick_sort_helper(arr, p + 1, hi)


def _median_of_three(arr: List[T], lo: int, hi: int) -> T:
    mid = (lo + hi) // 2
    a, b, c = arr[lo], arr[mid], arr[hi]
    if a <= b <= c or c <= b <= a:
        arr[mid], arr[hi] = arr[hi], arr[mid]
        return arr[hi]
    if b <= a <= c or c <= a <= b:
        arr[lo], arr[hi] = arr[hi], arr[lo]
        return arr[hi]
    return arr[hi]


def _partition(arr: List[T], lo: int, hi: int, pivot: T) -> int:
    i = lo
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i


def heap_sort(arr: List[T]) -> List[T]:
    """Sort a list using heapsort (unstable, O(n log n) guaranteed)."""
    result = arr[:]
    n = len(result)

    def sift_down(start: int, end: int) -> None:
        root = start
        while 2 * root + 1 <= end:
            child = 2 * root + 1
            if child + 1 <= end and result[child] < result[child + 1]:
                child += 1
            if result[root] < result[child]:
                result[root], result[child] = result[child], result[root]
                root = child
            else:
                break

    for start in range((n - 2) // 2, -1, -1):
        sift_down(start, n - 1)
    for end in range(n - 1, 0, -1):
        result[end], result[0] = result[0], result[end]
        sift_down(0, end - 1)
    return result


def counting_sort(arr: List[int]) -> List[int]:
    """Sort a list of non-negative integers using counting sort (O(n+k))."""
    if not arr:
        return []
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for num in arr:
        count[num] += 1
    result = []
    for i, c in enumerate(count):
        result.extend([i] * c)
    return result


def benchmark_sort(sort_fn: Callable, data: List, name: str = "") -> dict:
    """Benchmark a sorting function and return timing information."""
    start = time.perf_counter()
    sorted_data = sort_fn(data)
    elapsed = time.perf_counter() - start
    is_sorted = all(sorted_data[i] <= sorted_data[i + 1] for i in range(len(sorted_data) - 1))
    return {
        "name": name or sort_fn.__name__,
        "time_ms": elapsed * 1000,
        "correct": is_sorted,
        "size": len(data),
    }


if __name__ == "__main__":
    random.seed(42)
    sizes = [100, 1000, 5000]
    algorithms = [
        (insertion_sort, "insertion_sort"),
        (merge_sort, "merge_sort"),
        (quick_sort, "quick_sort"),
        (heap_sort, "heap_sort"),
    ]

    for size in sizes:
        data = [random.randint(0, 10000) for _ in range(size)]
        print(f"\n--- Array size: {size} ---")
        for fn, name in algorithms:
            result = benchmark_sort(fn, data, name)
            status = "OK" if result["correct"] else "FAIL"
            print(f"  {result['name']:>16}: {result['time_ms']:>8.3f} ms [{status}]")

    print("\n--- Counting sort (integers only) ---")
    int_data = [random.randint(0, 100) for _ in range(5000)]
    result = benchmark_sort(counting_sort, int_data, "counting_sort")
    status = "OK" if result["correct"] else "FAIL"
    print(f"  {result['name']:>16}: {result['time_ms']:>8.3f} ms [{status}]")
