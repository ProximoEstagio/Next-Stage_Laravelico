<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Código de verificação (2FA). Não usa fila de propósito:
 * o código precisa chegar na hora, mesmo se um dia a fila for assíncrona.
 */
class CodigoVerificacaoMail extends Mailable
{
    public function __construct(
        public string $nome,
        public string $codigo,
        public int $minutosValidade,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seu código de verificação — ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.codigo-verificacao');
    }
}
