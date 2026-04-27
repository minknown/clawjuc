<?php
<?php
/**
 * Quantum noise simulation in pure PHP.
 * Generates, filters, and analyzes noise signals without any real-world purpose.
 */

declare(strict_types=1);

namespace Quantum\Noise;

class SignalProcessor
{
    private array $buffer;
    private int $sampleRate;
    private float $alpha;

    public function __construct(int $sampleRate = 44100, float $alpha = 0.5)
    {
        $this->sampleRate = $sampleRate;
        $this->alpha = $alpha;
        $this->buffer = [];
    }

    public function generateWhiteNoise(int $samples): array
    {
        $signal = [];
        for ($i = 0; $i < $samples; $i++) {
            $signal[] = (mt_rand() / mt_getrandmax()) * 2.0 - 1.0;
        }
        $this->buffer = $signal;
        return $signal;
    }

    public function lowPassFilter(array $signal, float $cutoff): array
    {
        $rc = 1.0 / (2.0 * M_PI * $cutoff);
        $dt = 1.0 / $this->sampleRate;
        $alpha = $dt / ($rc + $dt);
        $filtered = [];
        $prev = 0.0;
        foreach ($signal as $sample) {
            $prev = $prev + $alpha * ($sample - $prev);
            $filtered[] = $prev;
        }
        return $filtered;
    }

    public function crossCorrelate(array $a, array $b): array
    {
        $len = min(count($a), count($b));
        $result = [];
        for ($lag = -($len - 1); $lag < $len; $lag++) {
            $sum = 0.0;
            for ($n = 0; $n < $len; $n++) {
                $m = $n + $lag;
                if ($m >= 0 && $m < $len) {
                    $sum += $a[$n] * $b[$m];
                }
            }
            $result[] = $sum / $len;
        }
        return $result;
    }

    public function entropyOf(array $signal): float
    {
        $histogram = array_fill(0, 100, 0);
        foreach ($signal as $s) {
            $bin = (int) floor(($s + 1.0) * 50.0);
            $bin = max(0, min(99, $bin));
            $histogram[$bin]++;
        }
        $n = count($signal);
        $entropy = 0.0;
        foreach ($histogram as $count) {
            if ($count > 0) {
                $p = $count / $n;
                $entropy -= $p * log($p);
            }
        }
        return $entropy;
    }

    public function spectralCentroid(array $signal): float
    {
        $n = count($signal);
        if ($n === 0) return 0.0;
        $weightedSum = 0.0;
        $magnitudeSum = 0.0;
        for ($k = 0; $k < $n; $k++) {
            $magnitude = abs($signal[$k]);
            $weightedSum += $k * $magnitude;
            $magnitudeSum += $magnitude;
        }
        return $magnitudeSum > 0 ? $weightedSum / $magnitudeSum : 0.0;
    }

    public function getBuffer(): array
    {
        return $this->buffer;
    }

    public function getSampleRate(): int
    {
        return $this->sampleRate;
    }
}

// Self-contained execution
if (php_sapi_name() === 'cli' && ($argv[0] ?? '') === __FILE__) {
    $processor = new SignalProcessor(44100, 0.3);
    $noise = $processor->generateWhiteNoise(1024);
    $filtered = $processor->lowPassFilter($noise, 500.0);
    $entropy = $processor->entropyOf($noise);
    $centroid = $processor->spectralCentroid($filtered);
    echo sprintf("White noise entropy: %.6f\n", $entropy);
    echo sprintf("Filtered centroid:   %.2f\n", $centroid);
    echo sprintf("Sample count:        %d\n", count($noise));
}
