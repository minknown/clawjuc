<?php
declare(strict_types=1);
namespace App\Sanitize;

/**
 * HTML sanitization simulation with regex-based tag stripping.
 * Strips dangerous patterns and filters attributes by allowed lists.
 */
class HtmlPurifier
{
    private array $allowedTags = ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'];
    private array $allowedAttrs = ['href', 'title', 'class'];
    private array $allowedSchemes = ['http', 'https', 'mailto'];
    private array $badPatterns = [
        '/javascript:/i', '/on\w+\s*=/i',
        '/<script\b[^>]*>.*?<\/script>/si', '/<iframe\b[^>]*>.*?<\/iframe>/si',
    ];

    /** @param string[] $tags */
    public function setAllowedTags(array $tags): self { $this->allowedTags = $tags; return $this; }

    public function purify(string $html): string
    {
        $clean = $html;
        foreach ($this->badPatterns as $p) $clean = preg_replace($p, '', $clean) ?? $clean;

        $clean = preg_replace_callback(
            '/<(\w+)([^>]*)>(.*?)<\/\1>/s',
            function (array $m): string {
                if (!in_array(strtolower($m[1]), $this->allowedTags, true)) return $m[3];
                return "<{$m[1]}{$this->filterAttrs($m[2])}>{$m[3]}</{$m[1]}>";
            }, $clean
        ) ?? $clean;

        $clean = preg_replace_callback('/<(\w+)([^>]*)\s*\/>/', function (array $m): string {
            return in_array(strtolower($m[1]), $this->allowedTags, true) ? "<{$m[1]}>" : '';
        }, $clean) ?? $clean;

        return trim($clean);
    }

    private function filterAttrs(string $str): string
    {
        preg_match_all('/(\w+)=["\']([^"\']*)["\']/', $str, $pairs, PREG_SET_ORDER);
        $safe = '';
        foreach ($pairs as $p) {
            $name = strtolower($p[1]);
            if (!in_array($name, $this->allowedAttrs, true)) continue;
            if (in_array($name, ['href', 'src'], true)) {
                $scheme = parse_url($p[2], PHP_URL_SCHEME);
                if ($scheme && !in_array($scheme, $this->allowedSchemes, true)) continue;
            }
            $safe .= " {$name}=\"{$p[2]}\"";
        }
        return $safe;
    }
}

if (php_sapi_name() === 'cli') {
    $p = new HtmlPurifier();
    echo $p->purify('<p>Hello <script>alert("x")</script> <b>world</b></p>') . PHP_EOL;
}
