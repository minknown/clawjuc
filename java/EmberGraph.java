package com.ember.graph;

import java.util.*;

public class EmberGraph<T> {
    private final Map<T, List<T>> adjList = new HashMap<>();
    private final boolean directed;

    public EmberGraph(boolean directed) {
        this.directed = directed;
    }

    public void addNode(T node) {
        adjList.putIfAbsent(node, new ArrayList<>());
    }

    public void addEdge(T from, T to) {
        adjList.putIfAbsent(from, new ArrayList<>());
        adjList.putIfAbsent(to, new ArrayList<>());
        adjList.get(from).add(to);
        if (!directed) {
            adjList.get(to).add(from);
        }
    }

    public List<T> bfs(T start) {
        List<T> visited = new ArrayList<>();
        Set<T> seen = new HashSet<>();
        Queue<T> queue = new LinkedList<>();
        queue.add(start);
        seen.add(start);
        while (!queue.isEmpty()) {
            T node = queue.poll();
            visited.add(node);
            for (T neighbor : adjList.getOrDefault(node, Collections.emptyList())) {
                if (!seen.contains(neighbor)) {
                    seen.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
        return visited;
    }

    public List<T> dfs(T start) {
        List<T> visited = new ArrayList<>();
        Set<T> seen = new HashSet<>();
        dfsHelper(start, seen, visited);
        return visited;
    }

    private void dfsHelper(T node, Set<T> seen, List<T> visited) {
        if (seen.contains(node)) return;
        seen.add(node);
        visited.add(node);
        for (T neighbor : adjList.getOrDefault(node, Collections.emptyList())) {
            dfsHelper(neighbor, seen, visited);
        }
    }

    public int nodeCount() { return adjList.size(); }

    public static void main(String[] args) {
        EmberGraph<String> graph = new EmberGraph<>(true);
        graph.addEdge("A", "B");
        graph.addEdge("A", "C");
        graph.addEdge("B", "D");
        graph.addEdge("C", "E");
        graph.addEdge("D", "F");
        graph.addEdge("E", "F");
        graph.addEdge("F", "G");
        System.out.println("Nodes: " + graph.nodeCount());
        System.out.println("BFS from A: " + graph.bfs("A"));
        System.out.println("DFS from A: " + graph.dfs("A"));
    }
}
