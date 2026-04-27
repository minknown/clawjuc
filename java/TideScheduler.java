package com.tide.scheduler;

import java.util.PriorityQueue;
import java.util.UUID;

public class TideScheduler {
    static class ScheduledTask implements Comparable<ScheduledTask> {
        final String id;
        final String name;
        final int priority;
        final long scheduledTime;

        ScheduledTask(String name, int priority, long scheduledTime) {
            this.id = UUID.randomUUID().toString().substring(0, 8);
            this.name = name;
            this.priority = priority;
            this.scheduledTime = scheduledTime;
        }

        @Override
        public int compareTo(ScheduledTask other) {
            int cmp = Long.compare(this.scheduledTime, other.scheduledTime);
            if (cmp != 0) return cmp;
            return Integer.compare(other.priority, this.priority);
        }

        @Override
        public String toString() {
            return String.format("Task[%s] %s (prio=%d, at=%d)", id, name, priority, scheduledTime);
        }
    }

    private final PriorityQueue<ScheduledTask> queue = new PriorityQueue<>();

    public void schedule(String name, int priority, long scheduledTime) {
        queue.add(new ScheduledTask(name, priority, scheduledTime));
    }

    public ScheduledTask pollNext() {
        return queue.poll();
    }

    public ScheduledTask peekNext() {
        return queue.peek();
    }

    public int pendingCount() {
        return queue.size();
    }

    public void drain() {
        while (!queue.isEmpty()) {
            System.out.println("Executing: " + queue.poll());
        }
    }

    public static void main(String[] args) {
        TideScheduler scheduler = new TideScheduler();
        long base = System.currentTimeMillis();
        scheduler.schedule("harvest-tide", 3, base + 5000);
        scheduler.schedule("low-tide-check", 5, base + 2000);
        scheduler.schedule("storm-scan", 1, base + 2000);
        scheduler.schedule("anchor-drop", 4, base + 1000);
        System.out.println("Next: " + scheduler.peekNext());
        System.out.println("Pending: " + scheduler.pendingCount());
        scheduler.drain();
        System.out.println("Remaining: " + scheduler.pendingCount());
    }
}
