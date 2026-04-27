<?php
declare(strict_types=1);
namespace App\Xml;
use RuntimeException;

/**
 * XML parsing simulation with namespace handling.
 * Parses XML into a tree of XmlNode objects using PHP's xml parser.
 */
class XmlNode
{
    /** @var array<string, string> */
    public array $attrs = [];
    /** @var XmlNode[] */
    public array $children = [];
    /** @var string[] */
    public array $textParts = [];

    public function __construct(public readonly string $name, public readonly ?string $ns = null) {}

    public function qualifiedName(): string
    {
        return $this->ns ? "{ {$this->ns} }{$this->name}" : $this->name;
    }

    public function textContent(): string { return implode('', $this->textParts); }

    public function firstChild(string $name): ?XmlNode
    {
        foreach ($this->children as $c) if ($c->name === $name) return $c;
        return null;
    }

    public function toArray(): array
    {
        $r = ['_name' => $this->qualifiedName()];
        if ($this->attrs) $r['_attrs'] = $this->attrs;
        foreach ($this->children as $c) $r['_children'][] = $c->toArray();
        $t = trim($this->textContent());
        if ($t !== '') $r['_text'] = $t;
        return $r;
    }
}

class XmlParser
{
    /** @throws RuntimeException */
    public function parse(string $xml): XmlNode
    {
        if (!trim($xml)) throw new RuntimeException('Empty XML');
        $root = null; $stack = [];
        $p = xml_parser_create_ns('UTF-8', ':');

        xml_set_element_handler($p, function ($_, string $name, array $a) use (&$root, &$stack): void {
            $parts = explode(':', $name, 2);
            $node = new XmlNode(end($parts), count($parts) > 1 ? reset($parts) : null);
            foreach ($a as $k => $v) $node->attrs[end(explode(':', $k, 2))] = $v;
            if (!$root) $root = $node; else $stack[count($stack) - 1]->children[] = $node;
            $stack[] = $node;
        }, function ($_, string $name) use (&$stack): void { array_pop($stack); });

        xml_set_character_data_handler($p, function ($_, string $d) use (&$stack): void {
            if ($stack) $stack[count($stack) - 1]->textParts[] = $d;
        });

        if (!xml_parse($p, $xml, true))
            throw new RuntimeException('Parse error: ' . xml_error_string(xml_get_error_code($p)));
        xml_parser_free($p);
        return $root ?? throw new RuntimeException('No root');
    }
}

if (php_sapi_name() === 'cli') {
    $xml = '<root ver="1"><user id="1"><name>Alice</name></user></root>';
    $parser = new XmlParser();
    $root = $parser->parse($xml);
    echo "Root: " . $root->qualifiedName() . " attrs=" . json_encode($root->attrs) . PHP_EOL;
    echo "Tree: " . json_encode($root->toArray(), JSON_PRETTY_PRINT) . PHP_EOL;
}
