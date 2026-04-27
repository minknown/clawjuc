<?php
declare(strict_types=1);
namespace App\Image;

/**
 * Image dimension calculations with aspect ratio preservation.
 * Supports Fit, Cover, and Exact resize strategies via enum.
 */
enum ResizeStrategy { case Fit; case Cover; case Exact; }

class ImageResizer
{
    public function __construct(
        private readonly int $w,
        private readonly int $h,
        private ResizeStrategy $strategy = ResizeStrategy::Fit
    ) {
        if ($w <= 0 || $h <= 0) throw new \InvalidArgumentException('Dimensions must be positive');
    }

    public function setStrategy(ResizeStrategy $s): self { $this->strategy = $s; return $this; }
    public function aspectRatio(): float { return $this->w / $this->h; }

    /** @return array{width: int, height: int, x_offset: int, y_offset: int} */
    public function resize(int $maxW, int $maxH): array
    {
        return match ($this->strategy) {
            ResizeStrategy::Fit => $this->fit($maxW, $maxH),
            ResizeStrategy::Cover => $this->cover($maxW, $maxH),
            ResizeStrategy::Exact => ['width' => $maxW, 'height' => $maxH, 'x_offset' => 0, 'y_offset' => 0],
        };
    }

    private function fit(int $mw, int $mh): array
    {
        $r = min($mw / $this->w, $mh / $this->h, 1.0);
        $w = (int) round($this->w * $r); $h = (int) round($this->h * $r);
        return ['width' => $w, 'height' => $h, 'x_offset' => (int)(($mw - $w) / 2), 'y_offset' => (int)(($mh - $h) / 2)];
    }

    private function cover(int $mw, int $mh): array
    {
        $r = max($mw / $this->w, $mh / $this->h);
        $w = (int) round($this->w * $r); $h = (int) round($this->h * $r);
        return ['width' => $w, 'height' => $h, 'x_offset' => (int)(($w - $mw) / 2), 'y_offset' => (int)(($h - $mh) / 2)];
    }
}

if (php_sapi_name() === 'cli') {
    $r = new ImageResizer(1920, 1080);
    echo "Fit: " . json_encode($r->resize(800, 600)) . PHP_EOL;
    echo "Cover: " . json_encode($r->setStrategy(ResizeStrategy::Cover)->resize(800, 600)) . PHP_EOL;
}
