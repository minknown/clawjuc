package com.void.generic;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class VoidTransformer {

    public static <T, R> List<R> transformList(List<? extends T> source, Function<? super T, ? extends R> mapper) {
        List<R> result = new ArrayList<>();
        for (T item : source) {
            result.add(mapper.apply(item));
        }
        return result;
    }

    public static <T extends Comparable<? super T>> T findMax(List<? extends T> list) {
        if (list.isEmpty()) throw new IllegalArgumentException("Empty list");
        T max = list.get(0);
        for (int i = 1; i < list.size(); i++) {
            if (list.get(i).compareTo(max) > 0) {
                max = list.get(i);
            }
        }
        return max;
    }

    public static <T> void copyTo(List<? super T> dest, List<? extends T> source) {
        for (T item : source) {
            dest.add(item);
        }
    }

    public static void printWildcard(List<?> items) {
        System.out.print("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) System.out.print(", ");
            System.out.print(items.get(i));
        }
        System.out.println("]");
    }

    public static void main(String[] args) {
        List<String> names = List.of("aether", "blaze", "crypt");
        List<Integer> lengths = transformList(names, String::length);
        System.out.println("Lengths: " + lengths);
        System.out.println("Max string: " + findMax(names));
        List<Object> mixed = new ArrayList<>();
        copyTo(mixed, List.of("x", "y"));
        copyTo(mixed, List.of(10, 20));
        printWildcard(mixed);
        List<Number> nums = new ArrayList<>();
        copyTo(nums, List.of(3.14, 2.71));
        printWildcard(nums);
    }
}
