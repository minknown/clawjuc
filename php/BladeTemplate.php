<?php
declare(strict_types=1);
namespace App\Templates;
use RuntimeException;

/**
 * Simulates a template engine with variable interpolation.
 * Parses {{ key }} placeholders and replaces them with context values.
 */
class BladeTemplate
{
    private array $context = [];
    private string $compiled = '';

    public function setSource(string $source): self
    {
        $this->compiled = $source;
        return $this;
    }

    /** @param array<string, mixed> $data */
    public function with(array $data): self
    {
        $this->context = array_merge($this->context, $data);
        return $this;
    }

    /**
     * Renders template by replacing {{ key }} tokens.
     * @throws RuntimeException if a referenced key is missing
     */
    public function render(): string
    {
        $output = preg_replace_callback(
            '/\{\{\s*(\w+(?:\.\w+)*)\s*\}\}/',
            function (array $m): string {
                $val = $this->resolve($m[1]);
                if ($val === null && !array_key_exists($m[1], $this->context)) {
                    throw new RuntimeException("Undefined: {$m[1]}");
                }
                return (string) $val;
            },
            $this->compiled
        );
        return $output ?? $this->compiled;
    }

    private function resolve(string $key): mixed
    {
        $segments = explode('.', $key);
        $current = $this->context;
        foreach ($segments as $seg) {
            if (!is_array($current) || !array_key_exists($seg, $current)) return null;
            $current = $current[$seg];
        }
        return $current;
    }
}

if (php_sapi_name() === 'cli') {
    $tpl = (new BladeTemplate())
        ->setSource('Hello, {{ name }}! Score: {{ stats.score }}.')
        ->with(['name' => 'Alice', 'stats' => ['score' => 95]]);
    echo $tpl->render() . PHP_EOL;
}
