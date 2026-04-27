package com.vortex.stream;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class VortexStream {

    static class DataPoint {
        final String category;
        final double value;
        final boolean active;

        DataPoint(String category, double value, boolean active) {
            this.category = category;
            this.value = value;
            this.active = active;
        }

        String getCategory() { return category; }
        boolean isActive() { return active; }
    }

    public static void main(String[] args) {
        List<DataPoint> points = Arrays.asList(
            new DataPoint("alpha", 12.5, true),
            new DataPoint("beta", 7.3, false),
            new DataPoint("alpha", 19.1, true),
            new DataPoint("gamma", 3.8, true),
            new DataPoint("beta", 22.0, true),
            new DataPoint("gamma", 15.4, false),
            new DataPoint("alpha", 8.9, true),
            new DataPoint("delta", 41.2, true)
        );

        List<String> activeCategories = points.stream()
                .filter(DataPoint::active)
                .map(dp -> dp.category.toUpperCase())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        System.out.println("Active categories: " + activeCategories);

        double totalActive = points.stream()
                .filter(DataPoint::active)
                .mapToDouble(dp -> dp.value)
                .sum();
        System.out.println("Total active value: " + totalActive);

        Map<String, Double> avgByCategory = points.stream()
                .collect(Collectors.groupingBy(
                        DataPoint::getCategory,
                        Collectors.averagingDouble(dp -> dp.value)
                ));
        System.out.println("Average by category: " + avgByCategory);

        Map<Boolean, Long> partitionCount = points.stream()
                .collect(Collectors.partitioningBy(
                        DataPoint::isActive,
                        Collectors.counting()
                ));
        System.out.println("Active/Inactive: " + partitionCount);

        String summary = points.stream()
                .filter(dp -> dp.value > 10.0)
                .map(dp -> dp.category + ":" + dp.value)
                .collect(Collectors.joining(" | "));
        System.out.println("High values: " + summary);
    }
}
