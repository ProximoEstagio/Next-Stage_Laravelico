<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * E-mail enviado ao professor quando um aluno envia um novo documento.
 * Recebe apenas dados simples (strings) para serializar bem em fila.
 */
class DocumentoEnviadoMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nomeProfessor,
        public string $nomeAluno,
        public string $raAluno,
        public string $tipoDocumento,
        public string $descricao,
        public string $dataEnvio,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Novo documento enviado: {$this->tipoDocumento} — {$this->nomeAluno}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.documento-enviado',
        );
    }
}
