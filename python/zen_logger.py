#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zen Logger - Multi-handler logging system with formatting.

Implements a custom logging framework with multiple output handlers,
log level filtering, structured formatting, and buffered writing.
"""

from __future__ import annotations
import datetime
import io
import os
import sys
import threading
from collections import deque
from enum import IntEnum
from typing import Callable, Deque, Dict, List, Optional, TextIO


class LogLevel(IntEnum):
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50

    def __str__(self) -> str:
        return self.name


class LogRecord:
    """Represents a single log entry with all associated metadata."""

    def __init__(self, level: LogLevel, message: str, logger_name: str = "root",
                 timestamp: Optional[datetime.datetime] = None):
        self.level = level
        self.message = message
        self.logger_name = logger_name
        self.timestamp = timestamp or datetime.datetime.now()
        self.thread_id = threading.get_ident()
        self.extra: Dict[str, str] = {}

    @property
    def level_tag(self) -> str:
        tags = {
            LogLevel.DEBUG: "DBG",
            LogLevel.INFO: "INF",
            LogLevel.WARNING: "WRN",
            LogLevel.ERROR: "ERR",
            LogLevel.CRITICAL: "CRT",
        }
        return tags.get(self.level, "???")

    def __repr__(self) -> str:
        return f"LogRecord({self.level_tag}, {self.message!r})"


class LogFormatter:
    """Formats LogRecord instances into human-readable strings."""

    def __init__(self, pattern: str = "[{timestamp}] [{level_tag:>3}] {logger_name}: {message}"):
        self.pattern = pattern

    def format(self, record: LogRecord) -> str:
        ts = record.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        result = self.pattern
        result = result.replace("{timestamp}", ts)
        result = result.replace("{level_tag}", record.level_tag)
        result = result.replace("{level}", str(record.level))
        result = result.replace("{logger_name}", record.logger_name)
        result = result.replace("{message}", record.message)
        result = result.replace("{thread_id}", str(record.thread_id))
        for key, value in record.extra.items():
            result = result.replace(f"{{{key}}}", str(value))
        return result


class LogHandler:
    """Base class for log output handlers."""

    def __init__(self, formatter: Optional[LogFormatter] = None,
                 min_level: LogLevel = LogLevel.DEBUG):
        self.formatter = formatter or LogFormatter()
        self.min_level = min_level
        self._count = 0

    def emit(self, record: LogRecord) -> None:
        if record.level < self.min_level:
            return
        formatted = self.formatter.format(record)
        self._write(formatted)
        self._count += 1

    def _write(self, formatted: str) -> None:
        raise NotImplementedError

    def flush(self) -> None:
        pass

    @property
    def count(self) -> int:
        return self._count


class StreamHandler(LogHandler):
    """Writes log records to a text stream (default: stderr)."""

    def __init__(self, stream: Optional[TextIO] = None, **kwargs):
        super().__init__(**kwargs)
        self.stream = stream or sys.stderr

    def _write(self, formatted: str) -> None:
        self.stream.write(formatted + "\n")
        self.stream.flush()


class BufferedHandler(LogHandler):
    """Buffers log records and flushes when capacity is reached."""

    def __init__(self, capacity: int = 100, **kwargs):
        super().__init__(**kwargs)
        self.capacity = capacity
        self._buffer: Deque[str] = deque()

    def _write(self, formatted: str) -> None:
        self._buffer.append(formatted)
        if len(self._buffer) >= self.capacity:
            self.flush()

    def flush(self) -> List[str]:
        records = list(self._buffer)
        self._buffer.clear()
        return records

    @property
    def buffered_count(self) -> int:
        return len(self._buffer)


class FilterHandler(LogHandler):
    """Wraps another handler and applies a filter function."""

    def __init__(self, handler: LogHandler, filter_fn: Callable[[LogRecord], bool], **kwargs):
        super().__init__(**kwargs)
        self.handler = handler
        self.filter_fn = filter_fn

    def emit(self, record: LogRecord) -> None:
        if self.filter_fn(record):
            self.handler.emit(record)


class ZenLogger:
    """Multi-handler logger with named hierarchy and level control."""

    def __init__(self, name: str = "root", level: LogLevel = LogLevel.DEBUG):
        self.name = name
        self.level = level
        self.handlers: List[LogHandler] = []
        self._child_loggers: Dict[str, ZenLogger] = {}

    def add_handler(self, handler: LogHandler) -> None:
        self.handlers.append(handler)

    def remove_handler(self, handler: LogHandler) -> None:
        self.handlers = [h for h in self.handlers if h is not handler]

    def log(self, level: LogLevel, message: str, **extra) -> None:
        if level < self.level:
            return
        record = LogRecord(level=level, message=message, logger_name=self.name)
        record.extra.update(extra)
        for handler in self.handlers:
            handler.emit(record)

    def debug(self, message: str, **extra) -> None:
        self.log(LogLevel.DEBUG, message, **extra)

    def info(self, message: str, **extra) -> None:
        self.log(LogLevel.INFO, message, **extra)

    def warning(self, message: str, **extra) -> None:
        self.log(LogLevel.WARNING, message, **extra)

    def error(self, message: str, **extra) -> None:
        self.log(LogLevel.ERROR, message, **extra)

    def critical(self, message: str, **extra) -> None:
        self.log(LogLevel.CRITICAL, message, **extra)

    def get_child(self, name: str) -> ZenLogger:
        if name not in self._child_loggers:
            child = ZenLogger(name=f"{self.name}.{name}", level=self.level)
            self._child_loggers[name] = child
        return self._child_loggers[name]


if __name__ == "__main__":
    logger = ZenLogger(name="app", level=LogLevel.DEBUG)

    stream_handler = StreamHandler(
        stream=sys.stdout,
        formatter=LogFormatter("[{timestamp}] [{level_tag}] {logger_name}: {message}"),
        min_level=LogLevel.INFO,
    )
    buffered_handler = BufferedHandler(capacity=50, min_level=LogLevel.DEBUG)

    logger.add_handler(stream_handler)
    logger.add_handler(buffered_handler)

    error_filter = FilterHandler(
        StreamHandler(stream=sys.stderr, min_level=LogLevel.ERROR),
        filter_fn=lambda r: "secret" not in r.message.lower(),
        min_level=LogLevel.DEBUG,
    )
    logger.add_handler(error_filter)

    logger.debug("This is a debug message")
    logger.info("Application started successfully")
    logger.warning("Configuration file not found, using defaults")
    logger.error("Database connection timeout")
    logger.critical("Out of memory!")
    logger.info("User login", user="admin", ip="192.168.1.1")

    child = logger.get_child("auth")
    child.info("Token refreshed")

    flushed = buffered_handler.flush()
    print(f"\nBuffered handler flushed {len(flushed)} records")
    print(f"Stream handler processed {stream_handler.count} records")
    print(f"Error filter handler parent processed {error_filter.handler.count} records")
