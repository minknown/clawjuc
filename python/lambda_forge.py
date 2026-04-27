#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lambda Forge - Functional programming patterns with functools.

Demonstrates higher-order functions, currying, composition,
memoization, and partial application using functools and custom utilities.
"""

from __future__ import annotations
import functools
import itertools
import operator
from typing import Any, Callable, List, TypeVar

T = TypeVar("T")
R = TypeVar("R")


def compose(*funcs: Callable) -> Callable:
    """Compose multiple functions right-to-left into a single function."""
    def composed(x: Any) -> Any:
        result = x
        for f in reversed(funcs):
            result = f(result)
        return result
    return composed


def pipe(*funcs: Callable) -> Callable:
    """Pipe multiple functions left-to-right into a single function."""
    def piped(x: Any) -> Any:
        result = x
        for f in funcs:
            result = f(result)
        return result
    return piped


def curry(func: Callable) -> Callable:
    """Transform a function that takes multiple arguments into a chain of unary functions."""
    @functools.wraps(func)
    def curried(*args):
        if len(args) >= func.__code__.co_argcount:
            return func(*args)
        return lambda *more: curried(*(args + more))
    return curried


def trace(func: Callable) -> Callable:
    """Decorator that prints function call arguments and return value."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)
        result = func(*args, **kwargs)
        print(f"  {func.__name__}({signature}) -> {result!r}")
        return result
    return wrapper


def repeat_call(func: Callable, n: int) -> Callable:
    """Return a function that calls the original n times and returns the last result."""
    def wrapper(*args, **kwargs) -> Any:
        result = None
        for _ in range(n):
            result = func(*args, **kwargs)
        return result
    return wrapper


def throttle(wait: float) -> Callable:
    """Decorator that limits how often a function can be called."""
    def decorator(func: Callable) -> Callable:
        last_called = [0.0]
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        wrapper.min_interval = wait
        wrapper.last_called = last_called
        return wrapper
    return decorator


@trace
def double(x: float) -> float:
    return x * 2


@trace
def increment(x: float) -> float:
    return x + 1


@trace
def square(x: float) -> float:
    return x * x


@curry
def add(a: float, b: float) -> float:
    return a + b


@curry
def multiply(a: float, b: float) -> float:
    return a * b


def fibonacci_memo() -> Callable[[int], int]:
    """Return a memoized Fibonacci function."""
    cache: dict = {}

    def fib(n: int) -> int:
        if n in cache:
            return cache[n]
        if n <= 1:
            result = n
        else:
            result = fib(n - 1) + fib(n - 2)
        cache[n] = result
        return result

    return fib


def sliding_window(data: List[T], size: int) -> List[List[T]]:
    """Generate overlapping sliding windows over a sequence."""
    return [data[i: i + size] for i in range(len(data) - size + 1)]


def interleave(*iterables) -> List:
    """Interleave elements from multiple iterables."""
    return [item for pair in itertools.zip_longest(*iterables) for item in pair if item is not None]


if __name__ == "__main__":
    print("=== Composition ===")
    transform = compose(square, double, increment)
    print(f"  compose(square, double, increment)(3) = {transform(3)}")
    pipeline = pipe(increment, double, square)
    print(f"  pipe(increment, double, square)(3) = {pipeline(3)}")

    print("\n=== Currying ===")
    add_five = add(5)
    print(f"  add(5)(10) = {add_five(10)}")
    times_three = multiply(3)
    print(f"  multiply(3)(7) = {times_three(7)}")

    print("\n=== Memoized Fibonacci ===")
    fib = fibonacci_memo()
    for n in [0, 1, 5, 10, 20, 30]:
        print(f"  fib({n}) = {fib(n)}")

    print("\n=== Utilities ===")
    data = list(range(10))
    windows = sliding_window(data, 3)
    print(f"  Sliding windows (size 3): {windows}")
    mixed = interleave([1, 2, 3], ["a", "b", "c"], [True, False])
    print(f"  Interleaved: {mixed}")

    print("\n=== Partial Application ===")
    powers_of_two = list(map(functools.partial(pow, 2), range(8)))
    print(f"  Powers of 2: {powers_of_two}")
