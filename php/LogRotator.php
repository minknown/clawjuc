<?php
declare(strict_types=1);
namespace App\Logging;

/**
 * Log file rotation simulation with size-based triggers.
 * Rotated files are numbered sequentially; oldest are pruned.
 */
class LogRotator
{
    private int $currentSize = 0, $rotations = 0;

    /** @param string[] $rotated */
    public function __construct(
        private readonly string $baseName,
        private readonly int $maxBytes = 1_048_576,
        private readonly int $maxFiles = 5,
        private array $rotated = []
    ) {}

    public function write(string $level, string $msg, array $ctx = []): void
    {
        $entry = sprintf("[%s] %s: %s %s\n",
            date('H:i:s.v'), $level, $msg, $ctx ? json_encode($ctx) : '');
        if ($this->currentSize + strlen($entry) > $this->maxBytes) $this->rotate();
        $this->currentSize += strlen($entry);
    }

    private function rotate(): void
    {
        $this->rotations++;
        $this->rotated[] = "{$this->baseName}.{$this->rotations}";
        while (count($this->rotated) > $this->maxFiles) array_shift($this->rotated);
        $this->currentSize = 0;
    }

    public function currentSize(): int { return $this->currentSize; }
    public function rotationCount(): int { return $this->rotations; }
    /** @return string[] */
    public function rotatedFiles(): array { return $this->rotated; }
}

if (php_sapi_name() === 'cli') {
    $r = new LogRotator('app.log', maxBytes: 100, maxFiles: 3);
    for ($i = 0; $i < 10; $i++) $r->write('INFO', "Entry #{$i}");
    echo "Rotations: {$r->rotationCount()}, Size: {$r->currentSize()}" . PHP_EOL;
    echo "Files: " . implode(', ', $r->rotatedFiles()) . PHP_EOL;
}
