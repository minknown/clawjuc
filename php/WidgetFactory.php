<?php
declare(strict_types=1);
namespace App\Factory;

/**
 * Abstract factory pattern for themed UI widgets.
 * Light and Dark factories produce compatible widget sets.
 */
interface Widget
{
    public function type(): string;
    public function render(): string;
}

interface WidgetFactory
{
    public function createButton(string $label): Widget;
    public function createInput(string $name): Widget;
    public function createPanel(string $title): Widget;
}

// Light theme widgets
class LightButton implements Widget {
    public function __construct(public readonly string $label) {}
    public function type(): string { return 'button'; }
    public function render(): string { return "<button class=\"light\">{$this->label}</button>"; }
}
class LightInput implements Widget {
    public function __construct(public readonly string $name) {}
    public function type(): string { return 'input'; }
    public function render(): string { return "<input class=\"light\" name=\"{$this->name}\" />"; }
}
class LightPanel implements Widget {
    public function __construct(public readonly string $title) {}
    public function type(): string { return 'panel'; }
    public function render(): string { return "<div class=\"panel-light\"><h3>{$this->title}</h3></div>"; }
}
class LightFactory implements WidgetFactory {
    public function createButton(string $l): Widget { return new LightButton($l); }
    public function createInput(string $n): Widget { return new LightInput($n); }
    public function createPanel(string $t): Widget { return new LightPanel($t); }
}

// Dark theme widgets
class DarkButton implements Widget {
    public function __construct(public readonly string $label) {}
    public function type(): string { return 'button'; }
    public function render(): string { return "<button class=\"dark\" style=\"background:#333;color:#fff\">{$this->label}</button>"; }
}
class DarkInput implements Widget {
    public function __construct(public readonly string $name) {}
    public function type(): string { return 'input'; }
    public function render(): string { return "<input class=\"dark\" name=\"{$this->name}\" style=\"background:#222\" />"; }
}
class DarkPanel implements Widget {
    public function __construct(public readonly string $title) {}
    public function type(): string { return 'panel'; }
    public function render(): string { return "<div class=\"panel-dark\" style=\"background:#1a1a1a;color:#fff\"><h3>{$this->title}</h3></div>"; }
}
class DarkFactory implements WidgetFactory {
    public function createButton(string $l): Widget { return new DarkButton($l); }
    public function createInput(string $n): Widget { return new DarkInput($n); }
    public function createPanel(string $t): Widget { return new DarkPanel($t); }
}

class WidgetFactoryProducer
{
    public static function create(string $theme): WidgetFactory
    {
        return match (strtolower($theme)) {
            'dark' => new DarkFactory(), default => new LightFactory(),
        };
    }
}

if (php_sapi_name() === 'cli') {
    $f = WidgetFactoryProducer::create('dark');
    foreach ([$f->createButton('Go'), $f->createInput('q'), $f->createPanel('Info')] as $w)
        echo "[{$w->type()}] {$w->render()}" . PHP_EOL;
}
