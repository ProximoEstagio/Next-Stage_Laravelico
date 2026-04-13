<?php

namespace App\Features\Secretaria\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Aluno;

class SecretariaService
{
    public function listarConcluidos(): array
    {
        $alunos = Aluno::with('curso')
            ->where('concluido', true)
            ->orderBy('nome')
            ->get();

        return $alunos->map(function ($aluno) {
            $documentos = DB::table('documento as d')
                ->join('tipo as t', 'd.tipo_idtipo', '=', 't.idtipo')
                ->whereIn('d.iddocumento', function ($sub) use ($aluno) {
                    $sub->from('documento as d2')
                        ->selectRaw('MAX(d2.iddocumento)')
                        ->where('d2.aluno_idaluno', $aluno->idaluno)
                        ->groupBy('d2.tipo_idtipo');
                })
                ->where('d.aluno_idaluno', $aluno->idaluno)
                ->orderBy('t.ordem')
                ->select('d.iddocumento', 'd.descricao', 'd.caminho_arquivo', 'd.dataEmissao', 't.nome as tipo')
                ->get()->toArray();

            return [
                'idaluno'   => $aluno->idaluno,
                'nome'      => $aluno->nome,
                'ra'        => $aluno->ra,
                'email'     => $aluno->email,
                'semestre'  => $aluno->semestre,
                'nomeCurso' => $aluno->curso?->nomeCurso,
                'documentos' => $documentos,
            ];
        })->toArray();
    }
}
