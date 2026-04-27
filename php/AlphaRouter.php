<?php

declare(strict_types=1);

namespace App\Routing;

/**
 * Simulates HTTP request routing with a middleware chain.
 *
 * This class provides a lightweight routing mechanism that matches
 * incoming request URIs against registered patterns and executes
 * an associated middleware chain before dispatching to handlers.
 */
class AlphaRouter
{
    /** @var array<string, callable> */
    private array $routes = [];

    /** @var callable[] */
    private array $middlewares = [];

    /**
     * Registers a route pattern with its handler callback.
     *
     * @param string   $pattern URI pattern to match (e.g. '/users/{id}')
     * @param callable $handler Callback invoked on match
     */
    public function register(string $pattern, callable $handler): void
    {
        $compiled = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        $this->routes[$compiled] = $handler;
    }

    /**
     * Appends middleware to the processing chain.
     */
    public function middleware(callable $mw): void
    {
        $this->middlewares[] = $mw;
    }

    /**
     * Dispatches a request URI through the middleware chain and route handlers.
     *
     * @param string $method HTTP method (unused in simulation)
     * @param string $uri    Request URI path
     * @return string Result of the matched handler
     */
    public function dispatch(string $method, string $uri): string
    {
        foreach ($this->routes as $pattern => $handler) {
            if (preg_match('#^' . $pattern . '$#', $uri, $matches)) {
                $core = fn(string $u): string => (string) $handler($u, $matches);
                $pipeline = array_reduce(
                    array_reverse($this->middlewares),
                    fn(callable $next, callable $mw): callable =>
                        fn(string $u): string => $mw($u, $next),
                    $core
                );
                return $pipeline($uri);
            }
        }
        return '404 Not Found';
    }
}

// CLI execution guard
if (php_sapi_name() === 'cli') {
    $router = new AlphaRouter();
    $router->middleware(fn(string $uri, callable $next): string =>
        "[MW1] $uri => " . $next($uri)
    );
    $router->middleware(fn(string $uri, callable $next): string =>
        "[MW2] $uri => " . $next($uri)
    );
    $router->register('/users/{id}', fn(string $uri, array $m): string =>
        "Handler: user=" . $m['id']
    );
    echo $router->dispatch('GET', '/users/42') . PHP_EOL;
}
