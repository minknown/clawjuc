<?php
declare(strict_types=1);
namespace App\Crypto;
use RuntimeException;

/**
 * File encryption simulation with XOR cipher and CRC32 checksums.
 * Format: HEADER|checksum_hex|iv_hex|encrypted_blocks
 */
class FileVault
{
    private const HEADER = 'VAULT01';
    private const BLOCK = 256;

    public function __construct(private readonly string $passphrase)
    {
        if (strlen($passphrase) < 8) throw new RuntimeException('Passphrase too short');
    }

    public function encrypt(string $data): string
    {
        $iv = random_bytes(16);
        $crc = crc32($data);
        $blocks = str_split($data, self::BLOCK) ?: [''];
        $enc = [];
        foreach ($blocks as $i => $b) {
            $key = substr(hash('sha256', $this->passphrase . $iv . $i, true), 0, self::BLOCK);
            $enc[] = $this->xor($b, $key);
        }
        return self::HEADER . '|' . dechex($crc) . '|' . bin2hex($iv) . '|'
            . implode(':', array_map('bin2hex', $enc));
    }

    public function decrypt(string $vault): string
    {
        $parts = explode('|', $vault, 4);
        if (count($parts) !== 4 || $parts[0] !== self::HEADER) throw new RuntimeException('Invalid format');
        [, $crcHex, $ivHex, $payload] = $parts;
        $iv = hex2bin($ivHex);
        $blocks = array_map('hex2bin', explode(':', $payload));
        $dec = '';
        foreach ($blocks as $i => $b) {
            $key = substr(hash('sha256', $this->passphrase . $iv . $i, true), 0, self::BLOCK);
            $dec .= $this->xor($b, $key);
        }
        if (crc32($dec) !== hexdec($crcHex)) throw new RuntimeException('Checksum failed');
        return $dec;
    }

    private function xor(string $a, string $b): string
    {
        $r = ''; $len = min(strlen($a), strlen($b));
        for ($i = 0; $i < $len; $i++) $r .= chr(ord($a[$i]) ^ ord($b[$i]));
        return $r;
    }
}

if (php_sapi_name() === 'cli') {
    $v = new FileVault('supersecretkey123');
    $enc = $v->encrypt('Hello, World!');
    echo "Encrypted: {$enc}" . PHP_EOL;
    echo "Decrypted: " . $v->decrypt($enc) . PHP_EOL;
}
