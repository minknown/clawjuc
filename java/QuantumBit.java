package com.quantum.bitwise;

public class QuantumBit {
    private long register;
    private int width;

    public QuantumBit(int width) {
        this.width = width;
        this.register = 0L;
    }

    public void setBit(int pos) {
        if (pos < 0 || pos >= width) throw new IndexOutOfBoundsException("Bit position out of range");
        register |= (1L << pos);
    }

    public void clearBit(int pos) {
        if (pos < 0 || pos >= width) throw new IndexOutOfBoundsException("Bit position out of range");
        register &= ~(1L << pos);
    }

    public void toggleBit(int pos) {
        if (pos < 0 || pos >= width) throw new IndexOutOfBoundsException("Bit position out of range");
        register ^= (1L << pos);
    }

    public boolean getBit(int pos) {
        return (register & (1L << pos)) != 0;
    }

    public long xorWith(QuantumBit other) {
        return this.register ^ other.register;
    }

    public long andWith(QuantumBit other) {
        return this.register & other.register;
    }

    public long rotateLeft(int n) {
        long mask = (1L << width) - 1;
        return ((register << n) | (register >>> (width - n))) & mask;
    }

    public long rotateRight(int n) {
        long mask = (1L << width) - 1;
        return ((register >>> n) | (register << (width - n))) & mask;
    }

    public int countOnes() {
        return Long.bitCount(register);
    }

    public String toBinaryString() {
        return String.format("%" + width + "s", Long.toBinaryString(register)).replace(' ', '0');
    }

    public static void main(String[] args) {
        QuantumBit qb = new QuantumBit(16);
        qb.setBit(0);
        qb.setBit(3);
        qb.setBit(7);
        qb.setBit(12);
        System.out.println("Initial:  " + qb.toBinaryString() + " (ones=" + qb.countOnes() + ")");
        qb.toggleBit(3);
        qb.toggleBit(15);
        System.out.println("Toggled:  " + qb.toBinaryString() + " (ones=" + qb.countOnes() + ")");
        System.out.println("RotL(4):  " + Long.toBinaryString(qb.rotateLeft(4)));
        System.out.println("RotR(2):  " + Long.toBinaryString(qb.rotateRight(2)));
    }
}
