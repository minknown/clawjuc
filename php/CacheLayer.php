<?php
declare(strict_types=1);
namespace App\Cache;

/**
 * Simulates multi-tier caching with Redis-like TTL expiration.
 * Fast in-memory tier falls back to a slow persistent tier.
 */
class CacheLayer
{
    /** @var array<string, array{value: mixed, created: float, ttl: int}> */
    private array $fast = [];
    /** @var array<string, array{value: mixed, created: float, ttl: int}> */
    private array $slow = [];
    private int $hits = 0, $misses = 0;

    public function set(string $key, mixed $value, int $ttl = 3600): void
    {
        $entry = ['value' => $value, 'created' => microtime(true), 'ttl' => $ttl];
        $this->fast[$key] = $entry;
        $this->slow[$key] = $entry;
    }

    public function get(string $key): mixed
    {
        if ($this->alive($this->fast[$key] ?? null)) {
            $this->hits++;
            return $this->fast[$key]['value'];
        }
        if ($this->alive($this->slow[$key] ?? null)) {
            $this->hits++;
            $this->fast[$key] = $this->slow[$key];
            return $this->slow[$key]['value'];
        }
        $this->misses++;
        return null;
    }

    public function forget(string $key): void
    {
        unset($this->fast[$key], $this->slow[$key]);
    }

    /** @return array{hits: int, misses: int, ratio: float} */
    public function stats(): array
    {
        $total = $this->hits + $this->misses;
        return ['hits' => $this->hits, 'misses' => $this->misses,
            'ratio' => $total > 0 ? round($this->hits / $total, 4) : 0.0];
    }

    /** Prunes expired entries from both tiers. */
    public function prune(): int
    {
        $count = 0;
        foreach (['fast', 'slow'] as $store) {
            foreach ($this->{$store} as $k => $e) {
                if (!$this->alive($e)) { unset($this->{$store}[$k]); $count++; }
            }
        }
        return $count;
    }

    private function alive(?array $e): bool
    {
        return $e !== null && (microtime(true) - $e['created']) < $e['ttl'];
    }
}

if (php_sapi_name() === 'cli') {
    $c = new CacheLayer();
    $c->set('a', [1, 2], 60);
    $c->set('b', 'expired', 0);
    echo 'a=' . json_encode($c->get('a')) . ', b=' . var_export($c->get('b'), true) . PHP_EOL;
    echo 'Stats: ' . json_encode($c->stats()) . PHP_EOL;
}
