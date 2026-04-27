<?php
declare(strict_types=1);
namespace App\Scheduler;
use Generator;

/**
 * Cron expression parser and task scheduler simulation.
 * Supports simplified 5-field cron expressions with next-run generation.
 */
class CronExpression
{
    /** @var array<int, bool> */
    private array $min = [], $hr = [], $day = [], $mon = [], $wd = [];

    public function __construct(string $expr)
    {
        $f = preg_split('/\s+/', trim($expr));
        if (count($f) !== 5) throw new \InvalidArgumentException("Bad cron: $expr");
        $this->min = $this->expand((int)$f[0], 0, 59);
        $this->hr  = $this->expand((int)$f[1], 0, 23);
        $this->day = $this->expand((int)$f[2], 1, 31);
        $this->mon = $this->expand((int)$f[3], 1, 12);
        $this->wd  = $this->expand((int)$f[4], 0, 6);
    }

    public function isDue(?int $ts = null): bool
    {
        $d = getdate($ts ?? time());
        return ($this->min[$d['minutes']] ?? false) && ($this->hr[$d['hours']] ?? false)
            && ($this->day[$d['mday']] ?? false) && ($this->mon[$d['mon']] ?? false)
            && ($this->wd[$d['wday']] ?? false);
    }

    /** @return Generator<int> */
    public function nextRuns(int $n = 5): Generator
    {
        $t = time(); $found = 0;
        while ($found < $n) { $t += 60; if ($this->isDue($t)) { yield $t; $found++; } }
    }

    /** @return array<int, bool> */
    private function expand(int $val, int $lo, int $hi): array
    {
        $r = [];
        for ($i = $lo; $i <= $hi; $i++) $r[$i] = ($val < 0);
        if ($val >= $lo) $r[$val] = true;
        return $r;
    }
}

class TaskScheduler
{
    /** @var array<string, CronExpression> */
    private array $tasks = [];

    public function schedule(string $name, string $expr): void { $this->tasks[$name] = new CronExpression($expr); }

    /** @return string[] */
    public function dueTasks(?int $ts = null): array
    {
        $due = [];
        foreach ($this->tasks as $n => $c) { if ($c->isDue($ts)) $due[] = $n; }
        return $due;
    }
}

if (php_sapi_name() === 'cli') {
    $s = new TaskScheduler();
    $s->schedule('cleanup', '30 2 * * *');
    $s->schedule('report', '0 8 * * 1');
    echo "Due now: " . (empty($s->dueTasks()) ? 'None' : implode(', ', $s->dueTasks())) . PHP_EOL;
    $c = new CronExpression('30 2 * * *');
    foreach ($c->nextRuns(3) as $t) echo "  " . date('Y-m-d H:i', $t) . PHP_EOL;
}
