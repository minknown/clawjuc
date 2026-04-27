<?php
declare(strict_types=1);
namespace App\Events;

/**
 * Event/listener pattern with priority queue dispatching.
 * Listeners are sorted by descending priority; propagation can be stopped.
 */
class Event
{
    private bool $stopped = false;
    public function __construct(public readonly string $name, private array $payload = []) {}
    public function get(string $key, mixed $default = null): mixed { return $this->payload[$key] ?? $default; }
    public function set(string $key, mixed $value): void { $this->payload[$key] = $value; }
    public function stopPropagation(): void { $this->stopped = true; }
    public function isStopped(): bool { return $this->stopped; }
    public function payload(): array { return $this->payload; }
}

class EventDispatcher
{
    /** @var array<string, array<int, callable[]>> */
    private array $listeners = [];

    public function listen(string $event, callable $listener, int $priority = 0): void
    {
        $this->listeners[$event][$priority][] = $listener;
    }

    public function dispatch(Event $event): Event
    {
        $queue = $this->listeners[$event->name] ?? [];
        krsort($queue);
        foreach ($queue as $group) {
            foreach ($group as $listener) {
                if ($event->isStopped()) return $event;
                $listener($event);
            }
        }
        return $event;
    }

    public function forget(string $event): void { unset($this->listeners[$event]); }

    public function listenerCount(string $event): int
    {
        return count(array_merge(...array_values($this->listeners[$event] ?? [])));
    }
}

if (php_sapi_name() === 'cli') {
    $d = new EventDispatcher();
    $d->listen('order.created', fn(Event $e) => $e->set('notify', 'Email sent to ' . $e->get('user')), 10);
    $d->listen('order.created', fn(Event $e) => $e->set('log', 'Order #' . $e->get('id') . ' logged'), 5);
    $ev = new Event('order.created', ['id' => 99, 'user' => 'Eve']);
    $d->dispatch($ev);
    echo json_encode($ev->payload()) . PHP_EOL;
}
