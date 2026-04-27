package com.glacier.concurrent;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.locks.ReentrantLock;

public class GlacierPool<T> {
    private final Deque<T> available = new ArrayDeque<>();
    private final Deque<T> inUse = new ArrayDeque<>();
    private final Factory<T> factory;
    private final ReentrantLock lock = new ReentrantLock();
    private final int maxSize;

    @FunctionalInterface
    public interface Factory<T> {
        T create();
    }

    public GlacierPool(Factory<T> factory, int maxSize) {
        this.factory = factory;
        this.maxSize = maxSize;
    }

    public T acquire() {
        lock.lock();
        try {
            T obj;
            if (!available.isEmpty()) {
                obj = available.poll();
            } else if (inUse.size() < maxSize) {
                obj = factory.create();
            } else {
                throw new IllegalStateException("Pool exhausted at capacity: " + maxSize);
            }
            inUse.push(obj);
            return obj;
        } finally {
            lock.unlock();
        }
    }

    public void release(T obj) {
        lock.lock();
        try {
            if (!inUse.remove(obj)) {
                throw new IllegalArgumentException("Object not from this pool");
            }
            available.push(obj);
        } finally {
            lock.unlock();
        }
    }

    public int availableCount() {
        lock.lock();
        try {
            return available.size();
        } finally {
            lock.unlock();
        }
    }

    public int inUseCount() {
        lock.lock();
        try {
            return inUse.size();
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        GlacierPool<StringBuilder> pool = new GlacierPool<>(StringBuilder::new, 5);
        StringBuilder sb1 = pool.acquire();
        sb1.append("frozen-1");
        StringBuilder sb2 = pool.acquire();
        sb2.append("frozen-2");
        System.out.println("In use: " + pool.inUseCount());
        System.out.println("sb1: " + sb1);
        pool.release(sb1);
        System.out.println("After release available: " + pool.availableCount());
        pool.release(sb2);
        System.out.println("All released available: " + pool.availableCount());
    }
}
