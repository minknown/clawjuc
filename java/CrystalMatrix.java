package com.crystal.sparse;

import java.util.HashMap;
import java.util.Map;

public class CrystalMatrix {
    private final int rows;
    private final int cols;
    private final Map<Long, Double> entries = new HashMap<>();

    private long key(int r, int c) {
        return ((long) r << 32) | (c & 0xFFFFFFFFL);
    }

    public CrystalMatrix(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
    }

    public void set(int r, int c, double val) {
        if (val == 0.0) {
            entries.remove(key(r, c));
        } else {
            entries.put(key(r, c), val);
        }
    }

    public double get(int r, int c) {
        return entries.getOrDefault(key(r, c), 0.0);
    }

    public int nonZeroCount() {
        return entries.size();
    }

    public void scale(double factor) {
        for (Map.Entry<Long, Double> e : entries.entrySet()) {
            e.setValue(e.getValue() * factor);
        }
    }

    public CrystalMatrix add(CrystalMatrix other) {
        CrystalMatrix result = new CrystalMatrix(rows, cols);
        for (Map.Entry<Long, Double> e : entries.entrySet()) {
            result.entries.put(e.getKey(), e.getValue());
        }
        for (Map.Entry<Long, Double> e : other.entries.entrySet()) {
            result.entries.merge(e.getKey(), e.getValue(), Double::sum);
        }
        return result;
    }

    public double density() {
        int total = rows * cols;
        return total == 0 ? 0 : (double) nonZeroCount() / total;
    }

    public void print() {
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                System.out.printf("%6.1f ", get(r, c));
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        CrystalMatrix m = new CrystalMatrix(5, 5);
        m.set(0, 0, 3.0);
        m.set(1, 2, 7.5);
        m.set(2, 4, 1.2);
        m.set(4, 1, 9.0);
        m.set(3, 3, -4.0);
        System.out.println("Matrix (sparse):");
        m.print();
        System.out.println("Non-zero: " + m.nonZeroCount());
        System.out.println("Density: " + String.format("%.2f%%", m.density() * 100));
        m.scale(2.0);
        System.out.println("After scale(2.0), m[0][0]=" + m.get(0, 0));
    }
}
