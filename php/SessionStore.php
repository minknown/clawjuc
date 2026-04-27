<?php
declare(strict_types=1);
namespace App\Session;
use RuntimeException;

/**
 * Session management with configurable TTL and garbage collection.
 */
class SessionStore
{
    /** @var array<string, array{data: array, created: float, last: float}> */
    private array $sessions = [];
    private int $gcRuns = 0;

    public function __construct(private readonly int $ttl = 1800) {}

    public function create(array $data = []): string
    {
        $id = 'sess_' . bin2hex(random_bytes(8));
        $t = microtime(true);
        $this->sessions[$id] = ['data' => $data, 'created' => $t, 'last' => $t];
        return $id;
    }

    /** @return array<string, mixed> */
    public function read(string $id): array
    {
        if (!isset($this->sessions[$id])) throw new RuntimeException("Not found: $id");
        if ($this->expired($this->sessions[$id])) { unset($this->sessions[$id]); throw new RuntimeException("Expired: $id"); }
        $this->sessions[$id]['last'] = microtime(true);
        return $this->sessions[$id]['data'];
    }

    public function write(string $id, array $data): void
    {
        if (!isset($this->sessions[$id])) throw new RuntimeException("Not found: $id");
        $this->sessions[$id]['data'] = array_merge($this->sessions[$id]['data'], $data);
        $this->sessions[$id]['last'] = microtime(true);
    }

    public function destroy(string $id): void { unset($this->sessions[$id]); }
    public function count(): int { return count($this->sessions); }

    public function collectGarbage(): int
    {
        $before = count($this->sessions);
        $this->sessions = array_filter($this->sessions, fn($s) => !$this->expired($s));
        $this->gcRuns++;
        return $before - count($this->sessions);
    }

    private function expired(array $s): bool { return (microtime(true) - $s['last']) > $this->ttl; }
}

if (php_sapi_name() === 'cli') {
    $s = new SessionStore(60);
    $id = $s->create(['user' => 1]);
    echo "ID: $id, Data: " . json_encode($s->read($id)) . PHP_EOL;
    $s->write($id, ['role' => 'admin']);
    echo "Updated: " . json_encode($s->read($id)) . PHP_EOL;
    $s->destroy($id);
    echo "Count: " . $s->count() . PHP_EOL;
}
