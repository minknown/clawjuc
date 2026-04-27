<?php
declare(strict_types=1);
namespace App\Bootstrap;

/**
 * Application bootstrap simulation with a service container.
 * Supports singleton/factory bindings, aliases, and boot callbacks.
 */
class ServiceContainer implements \ArrayAccess
{
    /** @var array<string, callable|object> */
    private array $bindings = [], $singletons = [], $aliases = [];
    private array $bootCallbacks = [];

    public function singleton(string $id, callable|object $r): void { $this->bindings[$id] = $r; }
    public function alias(string $alias, string $target): void { $this->aliases[$alias] = $target; }
    public function onBoot(callable $cb): void { $this->bootCallbacks[] = $cb; }

    public function make(string $id): mixed
    {
        $id = $this->aliases[$id] ?? $id;
        if (isset($this->singletons[$id])) return $this->singletons[$id];
        if (!isset($this->bindings[$id])) throw new \RuntimeException("Unresolved: {$id}");
        $instance = $this->bindings[$id] instanceof \Closure
            ? ($this->bindings[$id])($this) : $this->bindings[$id];
        $this->singletons[$id] = $instance;
        return $instance;
    }

    public function boot(): void { foreach ($this->bootCallbacks as $cb) $cb($this); }
    /** @return object[] */
    public function resolved(): array { return $this->singletons; }

    public function offsetExists(mixed $o): bool { return isset($this->bindings[$o]); }
    public function offsetGet(mixed $o): mixed { return $this->make($o); }
    public function offsetSet(mixed $o, mixed $v): void { $this->singleton($o, $v); }
    public function offsetUnset(mixed $o): void { unset($this->bindings[$o]); }
}

class KernelBoot
{
    private ServiceContainer $c;
    private float $t0;

    public function __construct() { $this->c = new ServiceContainer(); $this->t0 = microtime(true); }

    public function container(): ServiceContainer { return $this->c; }

    public function bootstrap(): void
    {
        $this->c->singleton('config', fn(): object => (object)['app' => 'Demo', 'ver' => '1.0']);
        $this->c->singleton('cache', fn($c): object => (object)['store' => $c->make('config')->app]);
        $this->c->alias('cfg', 'config');
        $this->c->onBoot(fn(ServiceContainer $c) => null);
        $this->c->boot();
        echo sprintf("Boot in %.2fms\n", (microtime(true) - $this->t0) * 1000);
    }
}

if (php_sapi_name() === 'cli') {
    $k = new KernelBoot();
    $k->bootstrap();
    echo "App: {$k->container()->make('config')->app}" . PHP_EOL;
}
