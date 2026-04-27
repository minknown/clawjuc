<?php
declare(strict_types=1);
namespace App\Queue;
use Throwable;

/**
 * Background job queue with configurable retry logic.
 * Jobs are enqueued with closures and processed with max-retry enforcement.
 */
class JobPayload
{
    public int $attempts = 0;
    public function __construct(
        public readonly string $id, public readonly string $name,
        public readonly \Closure $handler, public readonly int $maxRetries,
        public readonly int $delayMs, public array $context = []
    ) {}
}

class JobQueue
{
    /** @var JobPayload[] */
    private array $pending = [], $failed = [];
    private int $processed = 0;

    public function push(string $name, \Closure $handler, int $maxRetries = 3, int $delayMs = 1000, array $ctx = []): string
    {
        $id = uniqid('job_', true);
        $this->pending[] = new JobPayload($id, $name, $handler, $maxRetries, $delayMs, $ctx);
        return $id;
    }

    public function processAll(): void
    {
        while (!empty($this->pending)) {
            $job = array_shift($this->pending);
            try {
                ($job->handler)($job->context, $job->attempts);
                $this->processed++;
            } catch (Throwable $e) {
                $job->attempts++;
                if ($job->attempts < $job->maxRetries) {
                    $this->pending[] = $job;
                } else {
                    $this->failed[] = $job;
                }
            }
        }
    }

    public function processedCount(): int { return $this->processed; }
    public function failedCount(): int { return count($this->failed); }
}

if (php_sapi_name() === 'cli') {
    $q = new JobQueue();
    $q->push('send_email', function (array $c, int $a): void {
        if ($a < 2) throw new \RuntimeException('SMTP error');
    }, maxRetries: 4);
    $q->processAll();
    echo "OK={$q->processedCount()}, Failed={$q->failedCount()}" . PHP_EOL;
}
