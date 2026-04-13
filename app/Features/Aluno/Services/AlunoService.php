<?php

namespace App\Features\Aluno\Services;

use DateTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Documento;
use App\Models\Tipo;
use App\Models\PrazoAluno;
use App\Models\Aluno;

class AlunoService
{
    // ── Listar documentos do aluno com status, feedback e prazos ──────────────

    public function listarDocumentos(int $alunoId): array
    {
        $documentos = DB::table('documento as d')
            ->join('tipo as t', 'd.tipo_idtipo', '=', 't.idtipo')
            ->leftJoin('validacao as v', function ($join) {
                $join->on('v.documento_iddocumento', '=', 'd.iddocumento')
                     ->on('v.documento_tipo_idtipo', '=', 'd.tipo_idtipo');
            })
            ->leftJoin('status as s', 's.cod_status', '=', 'v.status_cod_status')
            ->leftJoin('feedback as f', function ($join) {
                $join->on('f.validacao_documento_iddocumento', '=', 'd.iddocumento')
                     ->on('f.validacao_documento_tipo_idtipo', '=', 'd.tipo_idtipo');
            })
            ->where('d.aluno_idaluno', $alunoId)
            ->orderByDesc('d.iddocumento')
            ->select([
                'd.iddocumento', 'd.dataEmissao', 'd.descricao',
                'd.caminho_arquivo', 'd.tipo_idtipo',
                't.nome as tipo',
                DB::raw("COALESCE(s.nomeStatus, 'Não Avaliado') as status"),
                'f.descricao as feedback',
            ])
            ->get();

        $ultimos   = [];
        $historico = [];

        foreach ($documentos as $doc) {
            $doc = (array) $doc;
            if (!isset($ultimos[$doc['tipo']])) {
                $ultimos[$doc['tipo']] = $doc;
            } else {
                $historico[] = $doc;
            }
        }

        $tiposEnviados = array_keys($ultimos);
        $prazos        = $this->calcularPrazos($alunoId, $tiposEnviados);

        return [
            'ultimos'       => array_values($ultimos),
            'historico'     => $historico,
            'tiposEnviados' => $tiposEnviados,
            'prazos'        => $prazos,
        ];
    }

    // ── Calcular prazos ───────────────────────────────────────────────────────

    private function calcularPrazos(int $alunoId, array $tiposEnviados): array
    {
        $prazosRaw = DB::table('tipo as t')
            ->leftJoin('prazo_aluno as pa', function ($join) use ($alunoId) {
                $join->on('pa.tipo_idtipo', '=', 't.idtipo')
                     ->where('pa.aluno_idaluno', $alunoId);
            })
            ->where('t.ativo', true)
            ->orderBy('t.ordem')
            ->select([
                't.idtipo', 't.nome as tipo', 't.intervalo_dias',
                'pa.dataLimite',
                DB::raw("(
                    SELECT d2.dataEmissao
                    FROM documento d2
                    JOIN tipo t2 ON t2.idtipo = d2.tipo_idtipo
                    WHERE d2.aluno_idaluno = {$alunoId}
                      AND t2.ordem = (t.ordem - 1)
                    ORDER BY d2.iddocumento DESC
                    LIMIT 1
                ) as dataEnvioAnterior"),
            ])
            ->get();

        $prazos = [];
        $agora  = new DateTime();

        foreach ($prazosRaw as $prazo) {
            $prazoFinal = null;

            if ($prazo->dataLimite) {
                $prazoFinal = $prazo->dataLimite;
            } elseif ($prazo->intervalo_dias && $prazo->dataEnvioAnterior) {
                $data = new DateTime($prazo->dataEnvioAnterior);
                $data->modify("+{$prazo->intervalo_dias} days");
                $prazoFinal = $data->format('Y-m-d');
            }

            $jaEnviou   = in_array($prazo->tipo, $tiposEnviados);
            $dataLimite = $prazoFinal ? new DateTime($prazoFinal) : null;

            $prazos[] = [
                'tipo'       => $prazo->tipo,
                'idtipo'     => $prazo->idtipo,
                'prazoFinal' => $prazoFinal,
                'jaEnviou'   => $jaEnviou,
                'vencido'    => $dataLimite && !$jaEnviou && $dataLimite < $agora,
                'urgente'    => $dataLimite && !$jaEnviou && $dataLimite >= $agora
                                && $dataLimite <= (clone $agora)->modify('+7 days'),
            ];
        }

        return $prazos;
    }

    // ── Listar tipos ativos ───────────────────────────────────────────────────

    public function listarTipos(): array
    {
        return Tipo::where('ativo', true)
            ->orderBy('ordem')
            ->select('idtipo', 'nome')
            ->get()
            ->toArray();
    }

    // ── Criar documento ───────────────────────────────────────────────────────

    public function criarDocumento(int $alunoId, int $tipoId, string $descricao, $arquivo): array
    {
        // Valida que o aluno existe
        $aluno = Aluno::find($alunoId);
        if (!$aluno) {
            return ['status' => 'erro', 'mensagem' => 'Aluno não encontrado'];
        }

        // Salva o arquivo
        $nomeArquivo     = time() . '_' . $arquivo->getClientOriginalName();
        $pasta           = "aluno_{$alunoId}";
        $caminhoRelativo = "uploads/{$pasta}/{$nomeArquivo}";

        Storage::disk('public')->putFileAs("uploads/{$pasta}", $arquivo, $nomeArquivo);

        Documento::create([
            'dataEmissao'    => now(),
            'descricao'      => $descricao,
            'aluno_idaluno'  => $alunoId,
            'tipo_idtipo'    => $tipoId,
            'caminho_arquivo' => $caminhoRelativo,
        ]);

        return ['status' => 'sucesso', 'mensagem' => 'Documento enviado com sucesso!', 'link' => $caminhoRelativo];
    }
}
