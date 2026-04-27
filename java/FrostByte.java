package com.frost.codec;

import java.util.ArrayList;
import java.util.List;

public class FrostByte {
    private static final int WINDOW_SIZE = 8;

    public static List<Integer> compress(byte[] input) {
        List<Integer> encoded = new ArrayList<>();
        int i = 0;
        while (i < input.length) {
            int bestOffset = 0;
            int bestLength = 0;
            int windowStart = Math.max(0, i - WINDOW_SIZE);
            for (int j = windowStart; j < i; j++) {
                int len = 0;
                while (i + len < input.length && len < WINDOW_SIZE
                        && input[j + (len % (i - j))] == input[i + len]) {
                    len++;
                }
                if (len > bestLength) {
                    bestOffset = i - j;
                    bestLength = len;
                }
            }
            if (bestLength >= 2) {
                encoded.add(-1);
                encoded.add(bestOffset);
                encoded.add(bestLength);
                i += bestLength;
            } else {
                encoded.add((int) input[i] & 0xFF);
                i++;
            }
        }
        return encoded;
    }

    public static byte[] decompress(List<Integer> encoded) {
        List<Byte> output = new ArrayList<>();
        for (int i = 0; i < encoded.size(); i++) {
            if (encoded.get(i) == -1) {
                int offset = encoded.get(i + 1);
                int length = encoded.get(i + 2);
                int start = output.size() - offset;
                for (int j = 0; j < length; j++) {
                    output.add(output.get(start + j));
                }
                i += 2;
            } else {
                output.add((byte) (int) encoded.get(i));
            }
        }
        byte[] result = new byte[output.size()];
        for (int j = 0; j < result.length; j++) {
            result[j] = output.get(j);
        }
        return result;
    }

    public static void main(String[] args) {
        byte[] input = "ABCABCABCABCABCABCXYZXYZXYZ".getBytes();
        List<Integer> compressed = compress(input);
        System.out.println("Original size: " + input.length);
        System.out.println("Encoded tokens: " + compressed.size());
        System.out.println("Encoded: " + compressed);
        byte[] decompressed = decompress(compressed);
        System.out.println("Decompressed: " + new String(decompressed));
        System.out.println("Match: " + new String(input).equals(new String(decompressed)));
    }
}
