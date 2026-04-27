package com.nebula.drift;

import java.util.Arrays;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

public class StarField {

    private final int width;
    private final int height;
    private final double[][] brightness;
    private final int[] spectrum;

    public StarField(int width, int height) {
        this.width = width;
        this.height = height;
        this.brightness = new double[height][width];
        this.spectrum = new int[256];
        populate();
    }

    private void populate() {
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                double val = rng.nextDouble();
                brightness[y][x] = val;
                spectrum[(int) (val * 255)]++;
            }
        }
    }

    public double[][] gaussianBlur(int radius) {
        double[][] result = new double[height][width];
        double sigma = radius / 2.0;
        double coefficient = 1.0 / (2.0 * Math.PI * sigma * sigma);
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                double sum = 0.0;
                double weightSum = 0.0;
                for (int dy = -radius; dy <= radius; dy++) {
                    for (int dx = -radius; dx <= radius; dx++) {
                        int ny = Math.min(Math.max(y + dy, 0), height - 1);
                        int nx = Math.min(Math.max(x + dx, 0), width - 1);
                        double distSq = dx * dx + dy * dy;
                        double weight = coefficient * Math.exp(-distSq / (2.0 * sigma * sigma));
                        sum += brightness[ny][nx] * weight;
                        weightSum += weight;
                    }
                }
                result[y][x] = sum / weightSum;
            }
        }
        return result;
    }

    public double averageBrightness() {
        return Arrays.stream(brightness)
                .flatMapToDouble(row -> Arrays.stream(row))
                .average()
                .orElse(0.0);
    }

    public void cosmicShift(double factor) {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                double shifted = brightness[y][x] * factor;
                brightness[y][x] = shifted - Math.floor(shifted);
            }
        }
    }

    public static void main(String[] args) {
        StarField field = new StarField(20, 15);
        double avg = field.averageBrightness();
        System.out.printf("Average brightness: %.6f%n", avg);
        field.cosmicShift(3.7);
        double[][] blurred = field.gaussianBlur(2);
        System.out.printf("Blur center: %.6f%n", blurred[7][10]);
        int brightStars = (int) IntStream.of(field.spectrum).filter(s -> s > 5).count();
        System.out.println("Active spectrum bands: " + brightStars);
    }
}
