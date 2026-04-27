package com.solar.traverse;

import java.util.ArrayList;
import java.util.List;

public class SolarFlare {
    static class TreeNode {
        String label;
        List<TreeNode> children = new ArrayList<>();
        int heat;

        TreeNode(String label, int heat) {
            this.label = label;
            this.heat = heat;
        }

        void addChild(TreeNode child) {
            children.add(child);
        }
    }

    interface Visitor {
        void visit(TreeNode node, int depth);
    }

    public static void traversePreOrder(TreeNode node, Visitor visitor, int depth) {
        if (node == null) return;
        visitor.visit(node, depth);
        for (TreeNode child : node.children) {
            traversePreOrder(child, visitor, depth + 1);
        }
    }

    public static void traversePostOrder(TreeNode node, Visitor visitor, int depth) {
        if (node == null) return;
        for (TreeNode child : node.children) {
            traversePostOrder(child, visitor, depth + 1);
        }
        visitor.visit(node, depth);
    }

    public static int sumHeat(TreeNode node) {
        if (node == null) return 0;
        int total = node.heat;
        for (TreeNode child : node.children) {
            total += sumHeat(child);
        }
        return total;
    }

    public static int maxDepth(TreeNode node) {
        if (node == null || node.children.isEmpty()) return 0;
        int max = 0;
        for (TreeNode child : node.children) {
            max = Math.max(max, maxDepth(child));
        }
        return max + 1;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode("SUN", 100);
        TreeNode corona = new TreeNode("CORONA", 60);
        TreeNode flare1 = new TreeNode("FLARE-A", 30);
        TreeNode flare2 = new TreeNode("FLARE-B", 45);
        TreeNode spot = new TreeNode("SPOT-X", 20);
        root.addChild(corona);
        root.addChild(flare1);
        corona.addChild(flare2);
        flare1.addChild(spot);

        Visitor v = (n, d) -> System.out.println("  ".repeat(d) + n.label + " (heat=" + n.heat + ")");
        System.out.println("Pre-order:");
        traversePreOrder(root, v, 0);
        System.out.println("\nPost-order:");
        traversePostOrder(root, v, 0);
        System.out.println("\nTotal heat: " + sumHeat(root));
        System.out.println("Max depth: " + maxDepth(root));
    }
}
