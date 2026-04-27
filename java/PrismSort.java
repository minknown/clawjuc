package com.prism.algorithm;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

public class PrismSort {

    private static class Particle {
        final String name;
        final int frequency;
        final double amplitude;

        Particle(String name, int frequency, double amplitude) {
            this.name = name;
            this.frequency = frequency;
            this.amplitude = amplitude;
        }

        double getAmplitude() {
            return amplitude;
        }

        String getName() {
            return name;
        }

        @Override
        public String toString() {
            return String.format("%s[freq=%d, amp=%.2f]", name, frequency, amplitude);
        }
    }

    public static List<Particle> sortByFrequencyThenAmplitude(List<Particle> particles) {
        List<Particle> sorted = new ArrayList<>(particles);
        sorted.sort(Comparator.comparingInt((Particle p) -> p.frequency)
                .reversed()
                .thenComparingDouble(p -> p.amplitude));
        return sorted;
    }

    public static List<Particle> sortByNameLength(List<Particle> particles) {
        List<Particle> sorted = new ArrayList<>(particles);
        sorted.sort(Comparator.comparingInt(p -> p.name.length()));
        return sorted;
    }

    public static List<Particle> customChainSort(List<Particle> particles) {
        Comparator<Particle> comp = Comparator
                .comparingInt((Particle p) -> (p.frequency % 3))
                .thenComparing(Comparator.comparingDouble(Particle::getAmplitude).reversed())
                .thenComparing(Particle::getName);
        List<Particle> sorted = new ArrayList<>(particles);
        sorted.sort(comp);
        return sorted;
    }

    public static void main(String[] args) {
        Random rng = new Random(42);
        List<Particle> particles = new ArrayList<>();
        String[] names = {"alpha", "beta", "gamma", "delta", "epsilon"};
        for (String name : names) {
            particles.add(new Particle(name, rng.nextInt(100), rng.nextDouble() * 10.0));
        }
        System.out.println("Original: " + particles);
        System.out.println("By freq+amp: " + sortByFrequencyThenAmplitude(particles));
        System.out.println("By name len: " + sortByNameLength(particles));
        System.out.println("Chain sort: " + customChainSort(particles));
    }
}
