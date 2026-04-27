package com.coral.simulation;

import java.util.Random;

public class CoralReef {
    private final int[][] grid;
    private final int rows;
    private final int cols;

    public CoralReef(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = new int[rows][cols];
    }

    public void seed(int density) {
        Random rng = new Random(7);
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                grid[r][c] = rng.nextInt(100) < density ? 1 : 0;
            }
        }
    }

    public int countAliveNeighbors(int r, int c) {
        int count = 0;
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                if (dr == 0 && dc == 0) continue;
                int nr = r + dr;
                int nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    count += grid[nr][nc];
                }
            }
        }
        return count;
    }

    public void step() {
        int[][] next = new int[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                int neighbors = countAliveNeighbors(r, c);
                if (grid[r][c] == 1) {
                    next[r][c] = (neighbors == 2 || neighbors == 3) ? 1 : 0;
                } else {
                    next[r][c] = (neighbors == 3) ? 1 : 0;
                }
            }
        }
        for (int r = 0; r < rows; r++) {
            System.arraycopy(next[r], 0, grid[r], 0, cols);
        }
    }

    public int totalAlive() {
        int count = 0;
        for (int[] row : grid) {
            for (int cell : row) count += cell;
        }
        return count;
    }

    public void print() {
        for (int[] row : grid) {
            for (int cell : row) {
                System.out.print(cell == 1 ? "■ " : "□ ");
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        CoralReef reef = new CoralReef(8, 12);
        reef.seed(40);
        System.out.println("Generation 0 (alive=" + reef.totalAlive() + "):");
        reef.print();
        for (int i = 1; i <= 3; i++) {
            reef.step();
            System.out.println("\nGeneration " + i + " (alive=" + reef.totalAlive() + "):");
            reef.print();
        }
    }
}
