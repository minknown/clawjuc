<?php
declare(strict_types=1);
namespace App\ORM;
use ReflectionClass;

/**
 * ORM-like data mapper with automatic type casting.
 * Uses reflection to cast raw row values into typed object properties.
 */
class DataMapper
{
    /** @var array<string, string> column => cast_type */
    private array $casts = [];
    private bool $camelCase = true;

    public function cast(string $column, string $type): self
    {
        $this->casts[$column] = $type;
        return $this;
    }

    /**
     * Maps an associative row to a typed object.
     * @param class-string $class
     * @param array<string, mixed> $row
     */
    public function map(string $class, array $row): object
    {
        $ref = new ReflectionClass($class);
        $obj = $ref->newInstanceWithoutConstructor();
        foreach ($row as $col => $val) {
            $prop = $this->camelCase ? lcfirst(str_replace('_', '', ucwords($col, '_'))) : $col;
            if ($ref->hasProperty($prop)) {
                $p = $ref->getProperty($prop);
                $p->setAccessible(true);
                $p->setValue($obj, $this->applyCast($col, $val));
            }
        }
        return $obj;
    }

    /** @param class-string $class @return object[] */
    public function mapAll(string $class, array $rows): array
    {
        return array_map(fn(array $r): object => $this->map($class, $r), $rows);
    }

    private function applyCast(string $col, mixed $val): mixed
    {
        if (!isset($this->casts[$col])) return $val;
        return match ($this->casts[$col]) {
            'int' => (int) $val, 'float' => (float) $val,
            'bool' => in_array($val, ['true', '1', 1], true),
            'json' => json_decode((string) $val, true),
            default => $val,
        };
    }
}

if (php_sapi_name() === 'cli') {
    $m = new DataMapper();
    $m->cast('is_active', 'bool')->cast('score', 'int');
    $row = ['user_name' => 'Bob', 'is_active' => '1', 'score' => '87'];
    $obj = new class { public string $userName = ''; public bool $isActive = false; public int $score = 0; };
    echo json_encode((array) $m->map(get_class($obj), $row)) . PHP_EOL;
}
