<?php

namespace App\Features\Notificacao\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\Aluno;
use App\Models\Documento;
use App\Models\Notificacao;
use App\Models\Professor;
use App\Models\Tipo;

/**
 * Notificações dentro do sistema (sino) para alunos e professores.
 *
 * Regra de ouro: criar uma notificação NUNCA pode derrubar a ação principal
 * (enviar documento, avaliar etc.). Por isso criar() engole e loga qualquer erro.
 */
class NotificacaoService
{
    public const DEST_ALUNO     = 'aluno';
    public const DEST_PROFESSOR = 'professor';

    public const TIPO_DOCUMENTO_ENVIADO    = 'documento_enviado';
    public const TIPO_DOCUMENTO_VALIDADO   = 'documento_validado';
    public const TIPO_DOCUMENTO_INVALIDADO = 'documento_invalidado';
    public const TIPO_DOCUMENTO_CORRIGIDO  = 'documento_corrigido';
    public const TIPO_PRAZO_ATUALIZADO     = 'prazo_atualizado';

    // ── Criação (genérica) ────────────────────────────────────────────────────

    public function criar(
        string $destTipo,
        int $destId,
        string $tipo,
        string $titulo,
        string $mensagem,
        ?int $documentoId = null
    ): ?Notificacao {
        try {
            return Notificacao::create([
                'destinatario_tipo' => $destTipo,
                'destinatario_id'   => $destId,
                'tipo'              => $tipo,
                'titulo'            => Str::limit($titulo, 120, ''),
                'mensagem'          => Str::limit($mensagem, 500, '…'),
                'documento_id'      => $documentoId,
            ]);
        } catch (\Throwable $e) {
            Log::error('Falha ao criar notificação', [
                'destinatario' => "{$destTipo}:{$destId}",
                'tipo'         => $tipo,
                'erro'         => $e->getMessage(),
            ]);
            return null;
        }
    }

    // ── Eventos do sistema ────────────────────────────────────────────────────

    /** Aluno enviou documento → avisa o professor responsável pelo curso. */
    public function documentoEnviado(Aluno $aluno, Documento $documento, ?Professor $professor): void
    {
        if (!$professor) {
            return;
        }

        $tipoNome = $this->nomeDoTipo($documento->tipo_idtipo);

        $this->criar(
            self::DEST_PROFESSOR,
            (int) $professor->idprofessor,
            self::TIPO_DOCUMENTO_ENVIADO,
            'Novo documento enviado',
            "{$aluno->nome} enviou o documento {$tipoNome} para avaliação.",
            (int) $documento->iddocumento
        );
    }

    /** Professor validou/invalidou → avisa o aluno. Outros status não geram aviso. */
    public function documentoAvaliado(int $documentoId, string $nomeStatus, string $feedback = ''): void
    {
        $tipoNotificacao = match ($nomeStatus) {
            'Validado'   => self::TIPO_DOCUMENTO_VALIDADO,
            'Invalidado' => self::TIPO_DOCUMENTO_INVALIDADO,
            default      => null,
        };

        if (!$tipoNotificacao) {
            return;
        }

        $documento = Documento::find($documentoId);
        if (!$documento) {
            return;
        }

        $tipoNome = $this->nomeDoTipo($documento->tipo_idtipo);
        $validado = $tipoNotificacao === self::TIPO_DOCUMENTO_VALIDADO;

        $mensagem = $validado
            ? "Seu documento {$tipoNome} foi validado pelo professor."
            : "Seu documento {$tipoNome} foi invalidado pelo professor.";

        if (trim($feedback) !== '') {
            $mensagem .= ' Feedback: ' . Str::limit(trim($feedback), 300);
        }

        $this->criar(
            self::DEST_ALUNO,
            (int) $documento->aluno_idaluno,
            $tipoNotificacao,
            $validado ? 'Documento validado' : 'Documento invalidado',
            $mensagem,
            (int) $documento->iddocumento
        );
    }

    /** Professor enviou versão corrigida → avisa o aluno. */
    public function documentoCorrigido(Documento $original): void
    {
        $tipoNome = $this->nomeDoTipo($original->tipo_idtipo);

        $this->criar(
            self::DEST_ALUNO,
            (int) $original->aluno_idaluno,
            self::TIPO_DOCUMENTO_CORRIGIDO,
            'Documento corrigido pelo professor',
            "O professor enviou uma versão corrigida do seu documento {$tipoNome}.",
            (int) $original->iddocumento
        );
    }

    /** Professor definiu/alterou/removeu o prazo → avisa o aluno. */
    public function prazoAtualizado(int $alunoId, int $tipoId, ?string $dataLimite): void
    {
        $tipoNome = $this->nomeDoTipo($tipoId);

        $mensagem = $dataLimite
            ? "O prazo do documento {$tipoNome} foi definido para " . date('d/m/Y', strtotime($dataLimite)) . '.'
            : "O prazo personalizado do documento {$tipoNome} foi removido.";

        $this->criar(
            self::DEST_ALUNO,
            $alunoId,
            self::TIPO_PRAZO_ATUALIZADO,
            'Prazo atualizado',
            $mensagem
        );
    }

    // ── Leitura / marcação ────────────────────────────────────────────────────

    public function listar(string $destTipo, int $destId, int $limite = 30): array
    {
        $base = Notificacao::where('destinatario_tipo', $destTipo)
            ->where('destinatario_id', $destId);

        $itens = (clone $base)
            ->orderByDesc('idnotificacao')
            ->limit($limite)
            ->get()
            ->map(fn (Notificacao $n) => [
                'id'           => $n->idnotificacao,
                'tipo'         => $n->tipo,
                'titulo'       => $n->titulo,
                'mensagem'     => $n->mensagem,
                'documento_id' => $n->documento_id,
                'lida'         => $n->lida_em !== null,
                'criada_em'    => $n->created_at?->toIso8601String(),
            ])
            ->all();

        return [
            'notificacoes' => $itens,
            'nao_lidas'    => (clone $base)->whereNull('lida_em')->count(),
        ];
    }

    public function marcarLida(string $destTipo, int $destId, int $notificacaoId): int
    {
        return Notificacao::where('idnotificacao', $notificacaoId)
            ->where('destinatario_tipo', $destTipo)
            ->where('destinatario_id', $destId)
            ->whereNull('lida_em')
            ->update(['lida_em' => now()]);
    }

    public function marcarTodasLidas(string $destTipo, int $destId): int
    {
        return Notificacao::where('destinatario_tipo', $destTipo)
            ->where('destinatario_id', $destId)
            ->whereNull('lida_em')
            ->update(['lida_em' => now()]);
    }

    // ── Auxiliares ────────────────────────────────────────────────────────────

    private function nomeDoTipo(?int $tipoId): string
    {
        $nome = $tipoId ? Tipo::where('idtipo', $tipoId)->value('nome') : null;
        return $nome ?: 'Documento';
    }
}
