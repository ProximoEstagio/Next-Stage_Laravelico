<?php

namespace App\Features\Professor\Services;

use DateTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Documento;
use App\Models\Validacao;
use App\Models\Feedback;
use App\Models\Status;
use App\Models\Modelo;
use App\Models\Tipo;
use App\Models\PrazoAluno;

class ProfessorService
{
    // ── Listar alunos com status por tipo ─────────────────────────────────────

    public function listarAlunos(string $nivel, ?int $professorId, ?int $cursoId = null): array
    {
        $query = Aluno::query()->select('idaluno', 'nome', 'ra', 'email', 'semestre');

        if ($nivel === 'admin') {
            if ($cursoId) $query->where('Curso_idcurso', $cursoId);
        } else {
            $cursoIdDoProf = Curso::where('professor_idprofessor1', $professorId)
                ->value('idcurso');

            if (!$cursoIdDoProf) return [];
            $query->where('Curso_idcurso', $cursoIdDoProf);
        }

        $alunos = $query->orderByDesc('idaluno')->get();
        $tipos  = Tipo::where('ativo', true)->orderBy('ordem')->get();

        return $alunos->map(function ($aluno) use ($tipos) {
            $data = $aluno->toArray();

            foreach ($tipos as $tipo) {
                $doc = Documento::where('aluno_idaluno', $aluno->idaluno)
                    ->where('tipo_idtipo', $tipo->idtipo)
                    ->orderByDesc('iddocumento')
                    ->first();

                if (!$doc) {
                    $data['status_' . $tipo->nome] = 'empty';
                    continue;
                }

                $status = Validacao::where('documento_iddocumento', $doc->iddocumento)
                    ->where('documento_tipo_idtipo', $doc->tipo_idtipo)
                    ->join('status', 'status.cod_status', '=', 'validacao.status_cod_status')
                    ->value('nomeStatus');

                $data['status_' . $tipo->nome] = $status ?: 'Não Avaliado';
            }

            return $data;
        })->toArray();
    }

    // ── Detalhe de um aluno ───────────────────────────────────────────────────

    public function detalheAluno(int $alunoId): ?array
    {
        $aluno = Aluno::with('curso')->find($alunoId);
        if (!$aluno) return null;

        $alunoData = $aluno->toArray();
        $alunoData['nomeCurso'] = $aluno->curso?->nomeCurso;
        unset($alunoData['senha'], $alunoData['token']);

        $documentos = DB::table('documento as d')
            ->join('tipo as t', 'd.tipo_idtipo', '=', 't.idtipo')
            ->leftJoin('validacao as v', function ($j) {
                $j->on('v.documento_iddocumento', '=', 'd.iddocumento')
                  ->on('v.documento_tipo_idtipo', '=', 'd.tipo_idtipo');
            })
            ->leftJoin('status as s', 's.cod_status', '=', 'v.status_cod_status')
            ->leftJoin('feedback as f', function ($j) {
                $j->on('f.validacao_documento_iddocumento', '=', 'd.iddocumento')
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
            ->get()->toArray();

        return ['aluno' => $alunoData, 'documentos' => $documentos];
    }

    // ── Listar documentos para revisão ───────────────────────────────────────

    public function listarDocumentos(string $nivel, ?int $professorId): array
    {
        $cursoId = null;
        if ($nivel !== 'admin') {
            $cursoId = Curso::where('professor_idprofessor1', $professorId)->value('idcurso');
            if (!$cursoId) return ['documentos' => [], 'dashboard' => [], 'total' => 0];
        }

        $subQuery = DB::table('documento as d2')
            ->select(DB::raw('MAX(d2.iddocumento)'))
            ->join('aluno as a2', 'd2.aluno_idaluno', '=', 'a2.idaluno')
            ->when($cursoId, fn($q) => $q->where('a2.Curso_idcurso', $cursoId))
            ->groupBy('d2.aluno_idaluno', 'd2.tipo_idtipo');

        $docs = DB::table('documento as d')
            ->join('aluno as a', 'd.aluno_idaluno', '=', 'a.idaluno')
            ->join('tipo as t', 'd.tipo_idtipo', '=', 't.idtipo')
            ->leftJoin('validacao as v', function ($j) {
                $j->on('v.documento_iddocumento', '=', 'd.iddocumento')
                  ->on('v.documento_tipo_idtipo', '=', 'd.tipo_idtipo');
            })
            ->leftJoin('status as s', 's.cod_status', '=', 'v.status_cod_status')
            ->whereIn('d.iddocumento', $subQuery)
            ->where('t.ativo', true)
            ->when($cursoId, fn($q) => $q->where('a.Curso_idcurso', $cursoId))
            ->orderByDesc('d.dataEmissao')
            ->select([
                'd.iddocumento', 'd.dataEmissao', 'd.descricao',
                'd.caminho_arquivo', 'd.tipo_idtipo',
                'a.nome as nome_aluno', 'a.ra',
                't.nome as tipo',
                DB::raw("COALESCE(s.nomeStatus, 'Não Avaliado') as status"),
                DB::raw('COALESCE(s.cod_status, 0) as cod_status'),
            ])
            ->get()->toArray();

        $dashboard = ['Validado' => 0, 'Invalidado' => 0, 'Visualizado' => 0, 'Não Avaliado' => 0];
        foreach ($docs as $doc) {
            $s = $doc->status ?? 'Não Avaliado';
            if (isset($dashboard[$s])) $dashboard[$s]++;
        }

        return ['documentos' => $docs, 'dashboard' => $dashboard, 'total' => count($docs)];
    }

    // ── Atualizar status de um documento ─────────────────────────────────────

    public function atualizarStatus(int $professorId, int $documentoId, int $tipoId, string $nomeStatus, string $feedback = ''): array
    {
        $codStatus = Status::where('nomeStatus', $nomeStatus)->value('cod_status');
        if (!$codStatus) return ['ok' => false, 'erro' => 'Status inválido'];

        DB::statement("
            INSERT INTO validacao 
                (professor_idprofessor, documento_iddocumento, documento_tipo_idtipo, status_cod_status)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status_cod_status = VALUES(status_cod_status)
        ", [$professorId, $documentoId, $tipoId, $codStatus]);

        if (!empty($feedback) && $nomeStatus !== 'Visualizado') {
            $alunoId = Documento::where('iddocumento', $documentoId)->value('aluno_idaluno');
            Feedback::create([
                'descricao'                        => $feedback,
                'aluno_idaluno'                    => $alunoId,
                'validacao_documento_tipo_idtipo'  => $tipoId,
                'validacao_documento_iddocumento'  => $documentoId,
                'validacao_professor_idprofessor'  => $professorId,
            ]);
        }

        return ['ok' => true];
    }

    // ── Concluir / desconcluir aluno ─────────────────────────────────────────

    public function setConcluido(int $alunoId, bool $concluido): array
    {
        Aluno::where('idaluno', $alunoId)->update(['concluido' => $concluido]);
        return ['ok' => true];
    }

    // ── Cadastrar aluno individualmente ──────────────────────────────────────

    public function criarAluno(array $dados, ?int $professorId, ?int $cursoIdDireto): array
    {
        $cursoId = $cursoIdDireto
            ?? Curso::where('professor_idprofessor1', $professorId)->value('idcurso');

        if (!$cursoId) return ['error' => 'Curso não identificado'];

        if (Aluno::where('ra', $dados['ra'])->orWhere('email', $dados['email'])->exists()) {
            return ['error' => 'RA ou email já cadastrado'];
        }

        Aluno::create([
            'nome'          => $dados['nome'],
            'ra'            => $dados['ra'],
            'email'         => $dados['email'],
            'semestre'      => $dados['semestre'],
            'Curso_idcurso' => $cursoId,
            'senha'         => bcrypt($dados['ra']), // senha padrão = RA
        ]);

        return ['message' => 'Aluno criado com sucesso'];
    }

    // ── Cadastrar alunos via CSV ──────────────────────────────────────────────

    public function cadastrarAlunos(array $alunos, int $professorId, ?int $cursoIdDireto = null): array
    {
        $cursoId = $cursoIdDireto ?? Curso::where('professor_idprofessor1', $professorId)->value('idcurso');
        if (!$cursoId) return ['erro' => 'Curso não encontrado para este professor'];

        $cadastrados = [];
        $falhos      = [];

        foreach ($alunos as $aluno) {
            if (empty($aluno['nome']) || empty($aluno['ra']) || empty($aluno['email']) || empty($aluno['semestre'])) {
                $falhos[] = ['aluno' => $aluno, 'motivo' => 'Campos obrigatórios faltando'];
                continue;
            }

            if (!preg_match('/^\d{13}$/', $aluno['ra'])) {
                $falhos[] = ['aluno' => $aluno, 'motivo' => 'RA deve ter 13 dígitos'];
                continue;
            }

            if (Aluno::where('ra', $aluno['ra'])->orWhere('email', $aluno['email'])->exists()) {
                $falhos[] = ['aluno' => $aluno, 'motivo' => 'RA ou email já cadastrado'];
                continue;
            }

            Aluno::create([
                'nome'          => $aluno['nome'],
                'ra'            => $aluno['ra'],
                'email'         => $aluno['email'],
                'semestre'      => $aluno['semestre'],
                'Curso_idcurso' => $cursoId,
                'senha'         => bcrypt($aluno['ra']),
            ]);

            $cadastrados[] = $aluno['nome'];
        }

        return [
            'cadastrados'  => $cadastrados,
            'falhos'       => $falhos,
            'total_ok'     => count($cadastrados),
            'total_falho'  => count($falhos),
        ];
    }

    // ── Prazos ────────────────────────────────────────────────────────────────

    public function listarPrazos(int $alunoId): array
    {
        $prazos = DB::table('tipo as t')
            ->leftJoin('prazo_aluno as pa', function ($j) use ($alunoId) {
                $j->on('pa.tipo_idtipo', '=', 't.idtipo')
                  ->where('pa.aluno_idaluno', $alunoId);
            })
            ->where('t.ativo', true)
            ->orderBy('t.ordem')
            ->select([
                't.idtipo', 't.nome as tipo', 't.intervalo_dias',
                'pa.dataLimite',
                DB::raw("(
                    SELECT d.dataEmissao FROM documento d
                    WHERE d.aluno_idaluno = {$alunoId}
                      AND d.tipo_idtipo = (t.idtipo - 1)
                    ORDER BY d.iddocumento DESC LIMIT 1
                ) as dataEnvioAnterior"),
            ])
            ->get();

        return $prazos->map(function ($p) {
            $prazoFinal = null;
            if ($p->dataLimite) {
                $prazoFinal = $p->dataLimite;
            } elseif ($p->intervalo_dias && $p->dataEnvioAnterior) {
                $data = new DateTime($p->dataEnvioAnterior);
                $data->modify("+{$p->intervalo_dias} days");
                $prazoFinal = $data->format('Y-m-d');
            }
            return array_merge((array) $p, ['prazoFinal' => $prazoFinal]);
        })->toArray();
    }

    public function salvarPrazo(int $alunoId, int $tipoId, ?string $dataLimite): array
    {
        if ($dataLimite) {
            PrazoAluno::updateOrCreate(
                ['aluno_idaluno' => $alunoId, 'tipo_idtipo' => $tipoId],
                ['dataLimite' => $dataLimite]
            );
        } else {
            PrazoAluno::where('aluno_idaluno', $alunoId)->where('tipo_idtipo', $tipoId)->delete();
        }
        return ['ok' => true];
    }

    // ── Modelos ───────────────────────────────────────────────────────────────

    public function listarModelos(): array
    {
        $rows = DB::table('tipo as t')
            ->leftJoin('modelos as m', 'm.tipo_idtipo', '=', 't.idtipo')
            ->orderBy('t.nome')
            ->select('t.nome as tipo', 'm.caminho_arquivo', 'm.nome', 'm.descricao')
            ->get();

        $modelos = [];
        foreach ($rows as $row) {
            $modelos[$row->tipo] = [
                'caminho'  => $row->caminho_arquivo,
                'nome'     => $row->nome,
                'descricao' => $row->descricao,
            ];
        }

        return ['success' => true, 'modelos' => $modelos];
    }

    public function uploadModelo(int $professorId, string $tipoNome, ?string $descricao, $arquivo): array
    {
        $tipoId = Tipo::where('nome', $tipoNome)->value('idtipo');
        if (!$tipoId) return ['success' => false, 'message' => 'Tipo inválido'];

        $nomeArquivo    = $arquivo->getClientOriginalName();
        $caminhoRelativo = "uploads/modelos/{$nomeArquivo}";
        Storage::disk('public')->putFileAs('uploads/modelos', $arquivo, $nomeArquivo);

        Modelo::updateOrCreate(
            ['tipo_idtipo' => $tipoId],
            [
                'nome'                 => $nomeArquivo,
                'descricao'            => $descricao,
                'professor_idprofessor' => $professorId,
                'caminho_arquivo'      => $caminhoRelativo,
            ]
        );

        return ['success' => true, 'message' => 'Modelo salvo com sucesso!', 'caminho' => $caminhoRelativo];
    }

    public function removerModelo(string $tipoNome): array
    {
        $tipoId = \App\Models\Tipo::where('nome', $tipoNome)->value('idtipo');
        if (!$tipoId) return ['ok' => false, 'erro' => 'Tipo não encontrado'];

        // Zera o caminho mas mantém o registro no banco
        \App\Models\Modelo::where('tipo_idtipo', $tipoId)
            ->update(['caminho_arquivo' => null, 'nome' => null, 'descricao' => null]);

        return ['ok' => true];
    }

    public function baixarModelo(string $tipoNome)
    {
        $modelo = DB::table('modelos as m')
            ->join('tipo as t', 'm.tipo_idtipo', '=', 't.idtipo')
            ->where('t.nome', $tipoNome)
            ->select('m.caminho_arquivo', 'm.nome')
            ->first();

        return $modelo;
    }
}