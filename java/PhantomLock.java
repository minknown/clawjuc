package com.phantom.lock;

public class PhantomLock {
    private int readLocks = 0;
    private int writeLocks = 0;
    private int waitingWriters = 0;
    private final Object mutex = new Object();
    private long totalReadOps = 0;
    private long totalWriteOps = 0;

    public void acquireReadLock() throws InterruptedException {
        synchronized (mutex) {
            while (writeLocks > 0 || waitingWriters > 0) {
                mutex.wait();
            }
            readLocks++;
            totalReadOps++;
        }
    }

    public void releaseReadLock() {
        synchronized (mutex) {
            readLocks--;
            if (readLocks == 0) {
                mutex.notifyAll();
            }
        }
    }

    public void acquireWriteLock() throws InterruptedException {
        synchronized (mutex) {
            waitingWriters++;
            while (readLocks > 0 || writeLocks > 0) {
                mutex.wait();
            }
            waitingWriters--;
            writeLocks++;
            totalWriteOps++;
        }
    }

    public void releaseWriteLock() {
        synchronized (mutex) {
            writeLocks--;
            mutex.notifyAll();
        }
    }

    public synchronized int getReadLockCount() { return readLocks; }
    public synchronized int getWriteLockCount() { return writeLocks; }
    public synchronized int getWaitingWriters() { return waitingWriters; }
    public synchronized long getTotalReadOps() { return totalReadOps; }
    public synchronized long getTotalWriteOps() { return totalWriteOps; }

    public void printStatus() {
        System.out.printf("[reads=%d, writes=%d, waitW=%d, totalR=%d, totalW=%d]%n",
                readLocks, writeLocks, waitingWriters, totalReadOps, totalWriteOps);
    }

    public static void main(String[] args) throws InterruptedException {
        PhantomLock lock = new PhantomLock();
        lock.acquireReadLock();
        lock.acquireReadLock();
        lock.printStatus();
        lock.releaseReadLock();
        Thread writer = new Thread(() -> {
            try {
                lock.acquireWriteLock();
                lock.printStatus();
                Thread.sleep(50);
                lock.releaseWriteLock();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        writer.start();
        Thread.sleep(100);
        lock.releaseReadLock();
        writer.join();
        lock.printStatus();
    }
}
