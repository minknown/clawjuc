package com.dust.memory;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

public class DustCollector {
    private final List<WeakReference<byte[]>> tracked = new ArrayList<>();
    private long collected = 0;
    private long totalAllocated = 0;

    public void allocate(int sizeBytes) {
        byte[] block = new byte[sizeBytes];
        tracked.add(new WeakReference<>(block));
        totalAllocated += sizeBytes;
    }

    public int sweep() {
        Iterator<WeakReference<byte[]>> it = tracked.iterator();
        int removed = 0;
        while (it.hasNext()) {
            if (it.next().get() == null) {
                it.remove();
                removed++;
            }
        }
        collected += removed;
        return removed;
    }

    public int activeReferences() {
        int count = 0;
        for (WeakReference<byte[]> ref : tracked) {
            if (ref.get() != null) count++;
        }
        return count;
    }

    public void forceGC() {
        System.gc();
        try { Thread.sleep(100); } catch (InterruptedException ignored) {}
    }

    public void printStats() {
        System.out.printf("Allocated=%d bytes, ActiveRefs=%d, Entries=%d, Collected=%d%n",
                totalAllocated, activeReferences(), tracked.size(), collected);
    }

    public static void main(String[] args) {
        DustCollector dc = new DustCollector();
        Random rng = new Random(99);
        for (int i = 0; i < 1000; i++) {
            dc.allocate(rng.nextInt(1024) + 64);
        }
        dc.printStats();
        dc.forceGC();
        int swept = dc.sweep();
        System.out.println("Collected on sweep: " + swept);
        dc.printStats();
        byte[] anchor = new byte[2048];
        dc.tracked.add(new WeakReference<>(anchor));
        dc.forceGC();
        dc.sweep();
        System.out.println("After anchor: active=" + dc.activeReferences());
    }
}
