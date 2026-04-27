<?php
declare(strict_types=1);
namespace App\Http;
use RuntimeException;

/**
 * File upload validation and processing simulation.
 * Validates size, MIME type, and extension against configured rules.
 */
class UploadedFile
{
    public function __construct(
        public readonly string $name, public readonly string $mime,
        public readonly int $size, public readonly string $tmp, public readonly int $err
    ) {}

    public function extension(): string { return strtolower(pathinfo($this->name, PATHINFO_EXTENSION)); }

    public function safeName(): string
    {
        $e = $this->extension();
        return bin2hex(random_bytes(8)) . ($e ? ".$e" : '');
    }
}

class UploadHandler
{
    /** @var string[] */
    private array $exts = [], $mimes = [];

    public function __construct(private readonly string $dest = '/tmp/uploads', private readonly int $maxSize = 5_242_880) {}

    /** @param string[] $exts */
    public function allowExtensions(array $exts): self { $this->exts = array_map('strtolower', $exts); return $this; }
    /** @param string[] $m */
    public function allowMimes(array $m): self { $this->mimes = $m; return $this; }

    /** @return array{valid: bool, errors: string[]} */
    public function validate(UploadedFile $f): array
    {
        $errs = [];
        if ($f->err !== 0) $errs[] = "Upload error code {$f->err}";
        if ($f->size > $this->maxSize) $errs[] = 'Exceeds ' . round($this->maxSize / 1e6, 1) . 'MB limit';
        if ($this->exts && !in_array($f->extension(), $this->exts, true))
            $errs[] = ".{$f->extension()} not allowed";
        if ($this->mimes && !in_array($f->mime, $this->mimes, true))
            $errs[] = "{$f->mime} not allowed";
        return ['valid' => empty($errs), 'errors' => $errs];
    }

    /** @return array{path: string, name: string} */
    public function process(UploadedFile $f): array
    {
        $v = $this->validate($f);
        if (!$v['valid']) throw new RuntimeException('Validation: ' . implode('; ', $v['errors']));
        $safe = $f->safeName();
        return ['path' => rtrim($this->dest, '/') . "/$safe", 'name' => $safe];
    }
}

if (php_sapi_name() === 'cli') {
    $h = (new UploadHandler('/uploads', 2e6))->allowExtensions(['jpg', 'png']);
    $ok = new UploadedFile('a.jpg', 'image/jpeg', 1_500_000, '/tmp/x', 0);
    echo "Valid: " . ($h->validate($ok)['valid'] ? 'Yes' : 'No') . PHP_EOL;
    $bad = new UploadedFile('x.php', 'text/plain', 100, '/tmp/y', 0);
    echo "Errors: " . implode('; ', $h->validate($bad)['errors']) . PHP_EOL;
}
