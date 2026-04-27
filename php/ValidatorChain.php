<?php
declare(strict_types=1);
namespace App\Validation;

/**
 * Input validation with composable rule chaining.
 * Supports built-in rules (required, email, min, max, numeric, alpha, in)
 * and custom rule closures with fluent interface.
 */
class ValidationResult
{
    public function __construct(
        public readonly bool $ok, public readonly string $field,
        public readonly string $rule, public readonly string $msg = ''
    ) {}
    public function failed(): bool { return !$this->ok; }
}

class ValidatorChain
{
    /** @var array<string, mixed> */
    private array $data = [];
    /** @var array<string, string> */
    private array $rules = [], $messages = [];
    /** @var array<string, callable> */
    private array $custom = [];
    /** @var ValidationResult[] */
    private array $results = [];

    /** @param array<string, mixed> $d */
    public function data(array $d): self { $this->data = $d; return $this; }
    /** @param array<string, string> $r */
    public function rules(array $r): self { $this->rules = $r; return $this; }
    /** @param array<string, string> $m */
    public function messages(array $m): self { $this->messages = $m; return $this; }
    public function addRule(string $n, callable $fn): self { $this->custom[$n] = $fn; return $this; }

    /** @return ValidationResult[] */
    public function validate(): array
    {
        $this->results = [];
        foreach ($this->rules as $field => $ruleStr) {
            $val = $this->data[$field] ?? null;
            foreach (explode('|', $ruleStr) as $def) {
                [$name, $params] = explode(':', $def, 2) + [1 => ''];
                $params = $params ? explode(',', $params) : [];
                $r = $this->apply($field, $val, $name, $params);
                if ($r->failed()) $this->results[] = $r;
            }
        }
        return $this->results;
    }

    public function passes(): bool { return empty($this->results); }
    /** @return string[] */
    public function errors(): array { return array_map(fn(ValidationResult $r) => $r->msg, $this->results); }

    private function apply(string $f, mixed $v, string $rule, array $p): ValidationResult
    {
        if (isset($this->custom[$rule])) return ($this->custom[$rule])($v, $f);
        $msg = $this->messages["$f.$rule"] ?? ucfirst($f) . " failed $rule";
        $ok = match ($rule) {
            'required' => $v !== null && $v !== '',
            'email' => is_string($v) && (bool)filter_var($v, FILTER_VALIDATE_EMAIL),
            'min' => is_string($v) && strlen($v) >= (int)($p[0] ?? 0),
            'max' => is_string($v) && strlen($v) <= (int)($p[0] ?? 255),
            'numeric' => is_numeric($v),
            'alpha' => is_string($v) && ctype_alpha($v),
            'in' => in_array($v, $p, true),
            default => true,
        };
        return new ValidationResult($ok, $f, $rule, $ok ? '' : $msg);
    }
}

if (php_sapi_name() === 'cli') {
    $v = (new ValidatorChain())->data(['name' => '', 'email' => 'bad'])
        ->rules(['name' => 'required|min:2|alpha', 'email' => 'required|email'])
        ->messages(['name.required' => 'Name needed', 'email.email' => 'Bad email']);
    $v->validate();
    echo "Passes: " . ($v->passes() ? 'Yes' : 'No') . PHP_EOL;
    echo "Errors: " . implode('; ', $v->errors()) . PHP_EOL;
}
