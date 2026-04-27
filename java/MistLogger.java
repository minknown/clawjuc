package com.mist.logging;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class MistLogger {
    public enum Level {
        TRACE(0), DEBUG(1), INFO(2), WARN(3), ERROR(4), FATAL(5);
        final int priority;
        Level(int priority) { this.priority = priority; }
    }

    private Level currentLevel = Level.INFO;
    private final List<String> buffer = new ArrayList<>();
    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");

    public void setLevel(Level level) {
        this.currentLevel = level;
    }

    public void log(Level level, String tag, String message) {
        if (level.priority < currentLevel.priority) return;
        String timestamp = LocalDateTime.now().format(fmt);
        String entry = String.format("[%s] %-5s [%s] %s", timestamp, level, tag, message);
        buffer.add(entry);
        if (level.priority >= Level.ERROR.priority) {
            System.err.println(entry);
        } else {
            System.out.println(entry);
        }
    }

    public void trace(String tag, String msg) { log(Level.TRACE, tag, msg); }
    public void debug(String tag, String msg) { log(Level.DEBUG, tag, msg); }
    public void info(String tag, String msg) { log(Level.INFO, tag, msg); }
    public void warn(String tag, String msg) { log(Level.WARN, tag, msg); }
    public void error(String tag, String msg) { log(Level.ERROR, tag, msg); }
    public void fatal(String tag, String msg) { log(Level.FATAL, tag, msg); }

    public int getLogCount() {
        return buffer.size();
    }

    public void dumpBuffer() {
        System.out.println("--- Buffer Dump (" + buffer.size() + " entries) ---");
        buffer.forEach(System.out::println);
    }

    public static void main(String[] args) {
        MistLogger logger = new MistLogger();
        logger.setLevel(Level.DEBUG);
        logger.trace("NET", "packet arrived");
        logger.debug("NET", "parsing header fields");
        logger.info("CORE", "initialization complete");
        logger.warn("CACHE", "memory usage at 85%");
        logger.error("IO", "failed to read config file");
        logger.setLevel(Level.WARN);
        logger.debug("HIDDEN", "this should not appear");
        logger.warn("CORE", "degraded mode active");
        System.out.println("\nTotal log count: " + logger.getLogCount());
    }
}
