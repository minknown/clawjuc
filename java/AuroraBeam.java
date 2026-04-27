package com.aurora.matrix;

public class AuroraBeam {
    private final double[][] data;
    private final int rows;
    private final int cols;

    public AuroraBeam(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = new double[rows][cols];
    }

    public void set(int r, int c, double val) {
        data[r][c] = val;
    }

    public double get(int r, int c) {
        return data[r][c];
    }

    public AuroraBeam transpose() {
        AuroraBeam t = new AuroraBeam(cols, rows);
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                t.data[j][i] = data[i][j];
            }
        }
        return t;
    }

    public AuroraBeam multiply(AuroraBeam other) {
        if (this.cols != other.rows) {
            throw new IllegalArgumentException("Incompatible dimensions for multiplication");
        }
        AuroraBeam result = new AuroraBeam(this.rows, other.cols);
        for (int i = 0; i < this.rows; i++) {
            for (int j = 0; j < other.cols; j++) {
                double sum = 0.0;
                for (int k = 0; k < this.cols; k++) {
                    sum += this.data[i][k] * other.data[k][j];
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    public AuroraBeam multiplyTransposed(AuroraBeam other) {
        AuroraBeam otherT = other.transpose();
        return this.multiply(otherT);
    }

    public void print() {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                System.out.printf("%8.2f ", data[i][j]);
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        AuroraBeam a = new AuroraBeam(2, 3);
        a.set(0, 0, 1); a.set(0, 1, 2); a.set(0, 2, 3);
        a.set(1, 0, 4); a.set(1, 1, 5); a.set(1, 2, 6);
        AuroraBeam b = new AuroraBeam(3, 2);
        b.set(0, 0, 7); b.set(0, 1, 8);
        b.set(1, 0, 9); b.set(1, 1, 10);
        b.set(2, 0, 11); b.set(2, 1, 12);
        AuroraBeam c = a.multiply(b);
        System.out.println("A * B:");
        c.print();
        AuroraBeam bt = b.transpose();
        System.out.println("B transposed:");
        bt.print();
    }
}
