<?php
declare(strict_types=1);
namespace App\Mail;
use RuntimeException;

/**
 * Email builder simulation with attachments and MIME formatting.
 */
class MailAttachment
{
    public function __construct(public readonly string $filename, public readonly string $mime, public readonly string $content) {}
    public function encoded(): string { return chunk_split(base64_encode($this->content), 76, "\r\n"); }
}

class MailMessage
{
    private string $from = '', $subject = '', $text = '', $html = '';
    /** @var string[] */ private array $to = [], $cc = [], $headers = [];
    /** @var MailAttachment[] */ private array $attachments = [];

    public function from(string $addr, string $name = ''): self { $this->from = $name ? "$name <$addr>" : $addr; return $this; }
    public function to(string $addr, string $name = ''): self { $this->to[] = $name ? "$name <$addr>" : $addr; return $this; }
    public function cc(string $addr): self { $this->cc[] = $addr; return $this; }
    public function subject(string $s): self { $this->subject = $s; return $this; }
    public function text(string $t): self { $this->text = $t; return $this; }
    public function attach(MailAttachment $a): self { $this->attachments[] = $a; return $this; }
    public function header(string $k, string $v): self { $this->headers[$k] = $v; return $this; }

    public function build(): string
    {
        if (empty($this->to)) throw new RuntimeException('No recipients');
        $l = ["From: {$this->from}", 'To: ' . implode(', ', $this->to)];
        if ($this->cc) $l[] = 'Cc: ' . implode(', ', $this->cc);
        $l[] = "Subject: {$this->subject}";
        foreach ($this->headers as $k => $v) $l[] = "$k: $v";
        $l[] = 'MIME-Version: 1.0';
        if ($this->attachments) {
            $l[] = 'Content-Type: multipart/mixed; boundary="b123"';
            $l[] = '', '--b123', 'Content-Type: text/plain', '', $this->text;
            foreach ($this->attachments as $a) {
                $l[] = '--b123', "Content-Type: {$a->mime}; name=\"{$a->filename}\"",
                    'Content-Transfer-Encoding: base64', '', $a->encoded();
            }
            $l[] = '--b123--';
        } else {
            $l[] = 'Content-Type: text/plain', '', $this->text;
        }
        return implode("\r\n", $l);
    }
}

if (php_sapi_name() === 'cli') {
    $m = (new MailMessage())->from('x@y.com', 'Sys')->to('a@b.com', 'Admin')
        ->subject('Report')->text('See attached.')
        ->attach(new MailAttachment('r.csv', 'text/csv', "id,name\n1,A\n"));
    echo $m->build() . PHP_EOL;
}
