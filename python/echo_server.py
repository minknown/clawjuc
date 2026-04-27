#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Echo Server - Fake socket server simulation with request handling.

Simulates a multi-client TCP echo server with request routing,
middleware processing, and connection lifecycle management.
"""

import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Dict, List, Optional


class RequestType(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"


@dataclass
class Request:
    """Simulated incoming client request."""
    client_id: str
    method: RequestType
    path: str
    headers: Dict[str, str] = field(default_factory=dict)
    body: str = ""


@dataclass
class Response:
    """Simulated server response."""
    status_code: int
    body: str
    headers: Dict[str, str] = field(default_factory=dict)


class ConnectionPool:
    """Simulated connection pool with configurable capacity."""

    def __init__(self, max_connections: int = 100):
        self.max_connections = max_connections
        self._active: Dict[str, float] = {}

    def acquire(self, client_id: str) -> bool:
        """Register a new connection."""
        if len(self._active) >= self.max_connections:
            return False
        self._active[client_id] = time.monotonic()
        return True

    def release(self, client_id: str) -> bool:
        """Release an existing connection."""
        if client_id in self._active:
            del self._active[client_id]
            return True
        return False

    @property
    def active_count(self) -> int:
        return len(self._active)


class EchoServer:
    """Simulated echo server with middleware and routing."""

    def __init__(self, host: str = "0.0.0.0", port: int = 8080):
        self.host = host
        self.port = port
        self.pool = ConnectionPool(max_connections=50)
        self._middleware: List[Callable] = []
        self._routes: Dict[str, Callable] = {}
        self._request_log: List[Request] = []
        self._register_default_routes()

    def use(self, middleware: Callable) -> None:
        """Add middleware to the processing pipeline."""
        self._middleware.append(middleware)

    def route(self, path: str, handler: Callable) -> None:
        """Register a route handler for a given path."""
        self._routes[path] = handler

    def _register_default_routes(self) -> None:
        """Set up default echo and health routes."""
        self.route("/echo", self._echo_handler)
        self.route("/health", self._health_handler)
        self.route("/status", self._status_handler)

    def _echo_handler(self, req: Request) -> Response:
        return Response(200, f"ECHO: {req.body}", {"Content-Type": "text/plain"})

    def _health_handler(self, req: Request) -> Response:
        return Response(200, "OK", {"Content-Type": "text/plain"})

    def _status_handler(self, req: Request) -> Response:
        info = f"Clients: {self.pool.active_count}, Routes: {len(self._routes)}"
        return Response(200, info, {"Content-Type": "text/plain"})

    def handle_request(self, req: Request) -> Response:
        """Process a single request through the middleware and routing pipeline."""
        self._request_log.append(req)
        context = {"request": req, "elapsed_ms": random.randint(1, 50)}
        for mw in self._middleware:
            context = mw(context)
        handler = self._routes.get(req.path)
        if handler is None:
            return Response(404, "Not Found", {})
        response = handler(req)
        return response

    def simulate_traffic(self, num_requests: int = 10) -> List[Response]:
        """Simulate incoming traffic with random requests."""
        responses = []
        paths = ["/echo", "/health", "/status", "/unknown"]
        methods = list(RequestType)
        for i in range(num_requests):
            client_id = f"client_{i:04d}"
            if not self.pool.acquire(client_id):
                continue
            req = Request(
                client_id=client_id,
                method=random.choice(methods),
                path=random.choice(paths),
                body=f"payload_{random.randint(1000, 9999)}",
            )
            resp = self.handle_request(req)
            responses.append(resp)
            self.pool.release(client_id)
        return responses


def logging_middleware(context: Dict) -> Dict:
    """Middleware that simulates request logging."""
    req = context["request"]
    context["logged"] = True
    return context


if __name__ == "__main__":
    server = EchoServer(port=9000)
    server.use(logging_middleware)
    responses = server.simulate_traffic(20)
    status_counts: Dict[int, int] = {}
    for r in responses:
        status_counts[r.status_code] = status_counts.get(r.status_code, 0) + 1
    print(f"Simulated {len(responses)} requests")
    print(f"Status distribution: {status_counts}")
    print(f"Request log size: {len(server._request_log)}")
