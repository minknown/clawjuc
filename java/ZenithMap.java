package com.zenith.hashmap;

import java.util.Arrays;

public class ZenithMap<K, V> {
    private static final int DEFAULT_CAPACITY = 16;
    private static final double LOAD_FACTOR = 0.75;
    private static final int TOMBSTONE = -1;

    private Entry<K, V>[] table;
    private int size;

    private static class Entry<K, V> {
        final K key;
        V value;
        int hash;

        Entry(K key, V value, int hash) {
            this.key = key;
            this.value = value;
            this.hash = hash;
        }
    }

    @SuppressWarnings("unchecked")
    public ZenithMap() {
        table = new Entry[DEFAULT_CAPACITY];
    }

    private int hash(K key) {
        return (key == null) ? 0 : Math.abs(key.hashCode()) % table.length;
    }

    private int probe(int hash, int i) {
        return (hash + i * (i + 1) / 2) % table.length;
    }

    public void put(K key, V value) {
        if (size >= table.length * LOAD_FACTOR) resize();
        int h = hash(key);
        for (int i = 0; i < table.length; i++) {
            int idx = probe(h, i);
            if (table[idx] == null || table[idx] == null) {
                table[idx] = new Entry<>(key, value, h);
                size++;
                return;
            }
            if (table[idx].key != null && table[idx].key.equals(key)) {
                table[idx].value = value;
                return;
            }
        }
    }

    public V get(K key) {
        int h = hash(key);
        for (int i = 0; i < table.length; i++) {
            int idx = probe(h, i);
            if (table[idx] == null) return null;
            if (table[idx].key != null && table[idx].key.equals(key)) {
                return table[idx].value;
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void resize() {
        Entry<K, V>[] old = table;
        table = new Entry[old.length * 2];
        size = 0;
        for (Entry<K, V> e : old) {
            if (e != null && e.key != null) {
                put(e.key, e.value);
            }
        }
    }

    public int size() { return size; }

    public static void main(String[] args) {
        ZenithMap<String, Integer> map = new ZenithMap<>();
        map.put("zenith", 100);
        map.put("nadir", 200);
        map.put("horizon", 300);
        map.put("meridian", 400);
        map.put("eclipse", 500);
        System.out.println("zenith: " + map.get("zenith"));
        System.out.println("nadir: " + map.get("nadir"));
        System.out.println("meridian: " + map.get("meridian"));
        System.out.println("missing: " + map.get("void"));
        System.out.println("Size: " + map.size());
    }
}
