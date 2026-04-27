<?php
declare(strict_types=1);
namespace App\Throttle;

/**
 * Token bucket rate limiting algorithm simulation.
 * Tokens refill at a fixed rate; requests consume tokens.
 */
class TokenBucket
{
    public function __construct(
        private float $cap, private float $rate,
        private float $tokens, private float $last = 0.0
    ) { $this->last = microtime(true); }

    public function consume(float $n = 1.0): bool
    {
        $this->refill();
        if ($this->tokens >= $n) { $this->tokens -= $n; return true; }
        return false;
    }

    public function available(): float { $this->refill(); return $this->tokens; }

    public function estimateWait(float $n = 1.0): float
    { $this->refill(); return max(0, $n - $this->tokens) / $this->rate; }

    private function refill(): void
    {
        $now = microtime(true);
        $this->tokens = min($this->cap, $this->tokens + ($now - $this->last) * $this->rate);
        $this->last = $now;
    }
}

class RateLimiter
{
    /** @var array<string, TokenBucket> */
    private array $buckets = [];

    public function __construct(private float $cap = 10.0, private float $rate = 1.0) {}

    public function attempt(string $id, float $cost = 1.0): bool
    {
        return ($this->buckets[$id] ??= new TokenBucket($this->cap, $this->rate, $this->cap))
            ->consume($cost);
    }

    public function remaining(string $id): float
    {
        return ($this->buckets[$id] ??= new TokenBucket($this->cap, $this->rate, $this->cap))->available();
    }
}

if (php_sapi_name() === 'cli') {
    $r = new RateLimiter(5, 0.5);
    for ($i = 0; $i < 8; $i++) {
        $ok = $r->attempt('k1') ? 'OK' : 'LIMITED';
        echo "#$i: $ok (rem={$r->remaining('k1')})\n";
    }
}
