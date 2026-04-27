package com.nebula.storage;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class NebulaCache<K, V> {
    private final HashMap<K, CacheEntry<V>> store = new HashMap<>();
    private final long defaultTtlMs;
    private volatile long evictionCount = 0;

    private static class CacheEntry<V> {
        final V value;
        final long expireAt;

        CacheEntry(V value, long ttlMs) {
            this.value = value;
            this.expireAt = System.currentTimeMillis() + ttlMs;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expireAt;
        }
    }

    public NebulaCache(long defaultTtlMs) {
        this.defaultTtlMs = defaultTtlMs;
    }

    public void put(K key, V value) {
        store.put(key, new CacheEntry<>(value, defaultTtlMs));
    }

    public void put(K key, V value, long ttlMs) {
        store.put(key, new CacheEntry<>(value, ttlMs));
    }

    public V get(K key) {
        CacheEntry<V> entry = store.get(key);
        if (entry == null) return null;
        if (entry.isExpired()) {
            store.remove(key);
            evictionCount++;
            return null;
        }
        return entry.value;
    }

    public int evictExpired() {
        int count = 0;
        Iterator<Map.Entry<K, CacheEntry<V>>> it = store.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue().isExpired()) {
                it.remove();
                count++;
            }
        }
        evictionCount += count;
        return count;
    }

    public int size() {
        return store.size();
    }

    public long getEvictionCount() {
        return evictionCount;
    }

    public static void main(String[] args) {
        NebulaCache<String, String> cache = new NebulaCache<>(1000);
        cache.put("alpha", "orbit-data-001");
        cache.put("beta", "orbit-data-002");
        cache.put("gamma", "orbit-data-003", 500);
        System.out.println("alpha: " + cache.get("alpha"));
        System.out.println("beta: " + cache.get("beta"));
        System.out.println("gamma: " + cache.get("gamma"));
        System.out.println("Size: " + cache.size());
        System.out.println("Evictions: " + cache.evictExpired());
    }
}
