package com.comet.math;

import java.util.HashMap;
import java.util.Map;

public class CometTrail {
    private final Map<Long, Long> memo = new HashMap<>();

    public long fibonacci(long n) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) {
            return memo.get(n);
        }
        long result = fibonacci(n - 1) + fibonacci(n - 2);
        memo.put(n, result);
        return result;
    }

    public long fibonacciIterative(long n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (long i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    public long cachedCalls() {
        return memo.size();
    }

    public void clearCache() {
        memo.clear();
    }

    public long[] sequence(int count) {
        long[] result = new long[count];
        for (int i = 0; i < count; i++) {
            result[i] = fibonacci(i);
        }
        return result;
    }

    public double goldenRatioEstimate(int iterations) {
        long fib1 = fibonacci(iterations);
        long fib2 = fibonacci(iterations + 1);
        return (double) fib2 / (double) fib1;
    }

    public static void main(String[] args) {
        CometTrail comet = new CometTrail();
        System.out.println("fib(10) = " + comet.fibonacci(10));
        System.out.println("fib(20) = " + comet.fibonacci(20));
        System.out.println("fib(30) = " + comet.fibonacci(30));
        System.out.println("fib(50) = " + comet.fibonacci(50));
        System.out.println("Cache entries: " + comet.cachedCalls());
        System.out.println("Iterative fib(50) = " + comet.fibonacciIterative(50));
        System.out.println("First 15: " + java.util.Arrays.toString(comet.sequence(15)));
        System.out.printf("Golden ratio (iter=40): %.10f%n", comet.goldenRatioEstimate(40));
    }
}
