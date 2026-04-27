<?php
declare(strict_types=1);
namespace App\Database;
use RuntimeException;

/**
 * SQL query builder with fluent interface and parameter binding.
 * Generates SELECT queries with JOIN, WHERE, ORDER BY, LIMIT.
 */
class QueryBuilder
{
    private string $table = '';
    private array $columns = ['*'], $wheres = [], $orders = [], $groups = [], $joins = [];
    private ?int $limit = null, $offset = null;
    /** @var array<string, mixed> */
    private array $bindings = [];

    public function table(string $t): self { $this->table = $t; return $this; }
    public function select(string ...$cols): self { $this->columns = $cols ?: ['*']; return $this; }
    public function where(string $col, string $op, mixed $val): self
    {
        $p = ':p' . count($this->bindings);
        $this->wheres[] = "$col $op $p"; $this->bindings[$p] = $val; return $this;
    }
    public function orderBy(string $col, string $dir = 'ASC'): self { $this->orders[] = "$col $dir"; return $this; }
    public function groupBy(string $col): self { $this->groups[] = $col; return $this; }
    public function join(string $t, string $on, string $type = 'INNER'): self { $this->joins[] = "$type JOIN $t ON $on"; return $this; }
    public function limit(int $n): self { $this->limit = $n; return $this; }
    public function offset(int $n): self { $this->offset = $n; return $this; }

    public function toSql(): string
    {
        if (!$this->table) throw new RuntimeException('Table required');
        $p = ['SELECT ' . implode(', ', $this->columns) . " FROM {$this->table}"];
        foreach ($this->joins as $j) $p[] = $j;
        if ($this->wheres) $p[] = 'WHERE ' . implode(' AND ', $this->wheres);
        if ($this->groups) $p[] = 'GROUP BY ' . implode(', ', $this->groups);
        if ($this->orders) $p[] = 'ORDER BY ' . implode(', ', $this->orders);
        if ($this->limit !== null) $p[] = "LIMIT {$this->limit}";
        if ($this->offset !== null) $p[] = "OFFSET {$this->offset}";
        return implode(' ', $p);
    }

    /** @return array<string, mixed> */
    public function getBindings(): array { return $this->bindings; }

    public function reset(): self
    {
        $this->wheres = $this->orders = $this->groups = $this->joins = $this->bindings = [];
        $this->limit = $this->offset = null; $this->columns = ['*']; return $this;
    }
}

if (php_sapi_name() === 'cli') {
    $q = (new QueryBuilder())->table('users')->select('id', 'name')
        ->join('roles', 'users.role_id = roles.id', 'LEFT')
        ->where('active', '=', 1)->orderBy('name')->limit(10);
    echo $q->toSql() . PHP_EOL;
    echo "Bindings: " . json_encode($q->getBindings()) . PHP_EOL;
}
