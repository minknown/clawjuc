<?php
declare(strict_types=1);
namespace App\Config;

/**
 * Configuration manager with dot-notation key access and mutation tracking.
 * Implements ArrayAccess for convenient square-bracket reads.
 */
class NovaConfig implements \ArrayAccess
{
    /** @var array<string, mixed> */
    private array $items = [], $modified = [];

    /** @param array<string, mixed> $items */
    public function load(array $items): void { $this->items = array_merge($this->items, $items); }

    public function get(string $key, mixed $default = null): mixed
    {
        $cur = $this->items;
        foreach (explode('.', $key) as $seg) {
            if (!is_array($cur) || !array_key_exists($seg, $cur)) return $default;
            $cur = $cur[$seg];
        }
        return $cur;
    }

    public function set(string $key, mixed $value): void
    {
        $segs = explode('.', $key); $cur = &$this->items;
        foreach ($segs as $i => $s) {
            if ($i === count($segs) - 1) { $cur[$s] = $value; } else {
                $cur[$s] ??= []; $cur = &$cur[$s];
            }
        }
        $this->modified[] = $key;
    }

    public function has(string $key): bool
    {
        $cur = $this->items;
        foreach (explode('.', $key) as $seg) {
            if (!is_array($cur) || !array_key_exists($seg, $cur)) return false;
            $cur = $cur[$seg];
        }
        return true;
    }

    /** @return array<string, mixed> */
    public function flatten(string $prefix = ''): array
    {
        $r = [];
        foreach ($this->items as $k => $v) {
            $fk = $prefix ? "$prefix.$k" : $k;
            $r = is_array($v) && $v ? array_merge($r, $this->flatten($fk)) : [...$r, $fk => $v];
        }
        return $r;
    }

    /** @return string[] */
    public function getModified(): array { return array_unique($this->modified); }

    public function offsetExists(mixed $o): bool { return $this->has((string)$o); }
    public function offsetGet(mixed $o): mixed { return $this->get((string)$o); }
    public function offsetSet(mixed $o, mixed $v): void { $this->set((string)$o, $v); }
    public function offsetUnset(mixed $o): void { $this->set((string)$o, null); }
}

if (php_sapi_name() === 'cli') {
    $c = new NovaConfig();
    $c->load(['db' => ['host' => 'localhost', 'port' => 3306], 'app' => ['debug' => true]]);
    echo "Host: " . $c->get('db.host') . PHP_EOL;
    $c->set('app.debug', false);
    echo "Flat: " . json_encode($c->flatten()) . PHP_EOL;
}
