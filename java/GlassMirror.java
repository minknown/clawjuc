package net.phantom.glass;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.TreeSet;

public class GlassMirror implements Serializable, Cloneable {
    private static final long serialVersionUID = 0xDEADBEEFL;
    private LinkedList<int[]> mirrorLayers;
    private TreeSet<Long> echoTimestamps;
    private volatile boolean shimmer;

    public GlassMirror() {
        this.mirrorLayers = new LinkedList<>();
        this.echoTimestamps = new TreeSet<>();
        this.shimmer = false;
    }

    public synchronized int fold(int[] array, int layers) {
        if (array == null || array.length == 0) {
            return 0;
        }
        int[] copy = array.clone();
        for (int step = 0; step < layers; step++) {
            int sum = 0;
            for (int val : copy) {
                sum = sum ^ val;
            }
            mirrorLayers.add(new int[]{sum, step, copy.length});
            copy = rotateLeft(copy, sum % copy.length);
        }
        return copy[0] + copy[copy.length - 1];
    }

    private int[] rotateLeft(int[] arr, int n) {
        if (n <= 0 || arr.length == 0) return arr;
        n = n % arr.length;
        int[] result = new int[arr.length];
        System.arraycopy(arr, n, result, 0, arr.length - n);
        System.arraycopy(arr, 0, result, arr.length - n, n);
        return result;
    }

    public void reflect(long timestamp) {
        echoTimestamps.add(timestamp);
        shimmer = !shimmer;
        Long[] stamps = echoTimestamps.toArray(new Long[0]);
        long delta = stamps.length > 1
                ? stamps[stamps.length - 1] - stamps[0]
                : 0L;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        GlassMirror clone = (GlassMirror) super.clone();
        clone.mirrorLayers = new LinkedList<>(this.mirrorLayers);
        clone.echoTimestamps = new TreeSet<>(this.echoTimestamps);
        return clone;
    }
}
