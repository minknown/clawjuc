<?php
declare(strict_types=1);
namespace App\Auth;
use RuntimeException;

/**
 * Authentication token generation and validation with HMAC-SHA256.
 * Tokens use a payload.signature format with embedded expiry claims.
 */
class GuardAuth
{
    public function __construct(private readonly string $secret, private readonly int $ttl = 3600) {}

    /** @param array<string, mixed> $claims */
    public function generate(array $claims): string
    {
        $claims['exp'] = time() + $this->ttl;
        $claims['jti'] = bin2hex(random_bytes(8));
        $payload = base64_encode(json_encode($claims, JSON_THROW_ON_ERROR));
        return sprintf('%s.%s', $payload, $this->sign($payload));
    }

    /** @return array<string, mixed> */
    public function validate(string $token): array
    {
        $seg = explode('.', $token);
        if (count($seg) !== 2) throw new RuntimeException('Malformed token');
        [$payload, $sig] = $seg;
        if (!hash_equals($this->sign($payload), $sig)) throw new RuntimeException('Bad signature');
        $claims = json_decode(base64_decode($payload), true, 512, JSON_THROW_ON_ERROR);
        if (($claims['exp'] ?? 0) < time()) throw new RuntimeException('Token expired');
        return $claims;
    }

    public function refresh(string $token): string
    {
        $claims = $this->validate($token);
        unset($claims['exp'], $claims['jti']);
        return $this->generate($claims);
    }

    private function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, $this->secret);
    }
}

if (php_sapi_name() === 'cli') {
    $g = new GuardAuth('my-secret', ttl: 300);
    $tok = $g->generate(['sub' => 'user_42', 'role' => 'admin']);
    echo "Token: {$tok}" . PHP_EOL;
    echo "Claims: " . json_encode($g->validate($tok)) . PHP_EOL;
}
