<?php

namespace App\Features\Admin\Services;

use App\Models\Curso;
use App\Models\Professor;
use App\Models\Tipo;

class AdminService
{
    // ── Cursos ────────────────────────────────────────────────────────────────

    public function listarCursos(): array
    {
        return Curso::with('professor')
            ->orderBy('nomeCurso')
            ->get()
            ->map(fn($c) => [
                'idcurso'        => $c->idcurso,
                'nomeCurso'      => $c->nomeCurso,
                'nomeProfessor'  => $c->professor?->nome,
                'idprofessor'    => $c->professor?->idprofessor,
            ])
            ->toArray();
    }

    public function criarCurso(string $nomeCurso, int $professorId): array
    {
        if (Curso::where('nomeCurso', $nomeCurso)->exists()) {
            return ['erro' => 'Curso já existe'];
        }

        if (Curso::where('professor_idprofessor1', $professorId)->exists()) {
            return ['erro' => 'Este professor já está vinculado a outro curso'];
        }

        $curso = Curso::create([
            'nomeCurso'              => $nomeCurso,
            'professor_idprofessor1' => $professorId,
        ]);

        return ['ok' => true, 'idcurso' => $curso->idcurso];
    }

    public function atualizarCurso(int $cursoId, int $professorId): array
    {
        $jaVinculado = Curso::where('professor_idprofessor1', $professorId)
            ->where('idcurso', '!=', $cursoId)
            ->exists();

        if ($jaVinculado) {
            return ['erro' => 'Este professor já está vinculado a outro curso'];
        }

        Curso::where('idcurso', $cursoId)->update(['professor_idprofessor1' => $professorId]);
        return ['ok' => true];
    }

    // ── Professores ───────────────────────────────────────────────────────────

    public function listarProfessores(): array
    {
        return Professor::with('curso')
            ->orderBy('nome')
            ->get()
            ->map(fn($p) => [
                'idprofessor' => $p->idprofessor,
                'nome'        => $p->nome,
                'email'       => $p->email,
                'nivel'       => $p->nivel,
                'telefone'    => $p->telefone,
                'idcurso'     => $p->curso?->idcurso,
                'nomeCurso'   => $p->curso?->nomeCurso,
            ])
            ->toArray();
    }

    public function criarProfessor(array $dados): array
    {
        if (Professor::where('email', $dados['email'])->exists()) {
            return ['erro' => 'Email já cadastrado'];
        }

        $professor = Professor::create([
            'nome'      => $dados['nome'],
            'email'     => $dados['email'],
            'senha'     => bcrypt($dados['senha']),
            'registro'  => $dados['registro'] ?? '0000000000000',
            'telefone'  => $dados['telefone'] ?? null,
            'nivel'     => $dados['nivel'] ?? 'professor',
        ]);

        if (!empty($dados['curso_id'])) {
            Curso::where('idcurso', $dados['curso_id'])
                ->update(['professor_idprofessor1' => $professor->idprofessor]);
        }

        return ['ok' => true, 'idprofessor' => $professor->idprofessor];
    }

    // ── Tipos ─────────────────────────────────────────────────────────────────

    public function listarTipos(): array
    {
        return Tipo::orderBy('ordem')->get()->toArray();
    }

    public function criarTipo(string $nome): array
    {
        $nome = strtoupper(trim($nome));

        if (Tipo::where('nome', $nome)->exists()) {
            return ['erro' => 'Tipo já existe'];
        }

        $maxOrdem = Tipo::max('ordem') ?? 0;

        $tipo = Tipo::create([
            'nome'   => $nome,
            'descricao' => 'Documento ' . $nome,
            'ativo'  => true,
            'ordem'  => $maxOrdem + 1,
        ]);

        return ['ok' => true, 'idtipo' => $tipo->idtipo];
    }

    public function toggleAtivo(int $tipoId): array
    {
        $tipo = Tipo::find($tipoId);
        if (!$tipo) return ['erro' => 'Tipo não encontrado'];

        $tipo->update(['ativo' => !$tipo->ativo]);
        return ['ok' => true];
    }

    public function atualizarOrdem(array $tipos): array
    {
        foreach ($tipos as $t) {
            Tipo::where('idtipo', $t['idtipo'])->update(['ordem' => $t['ordem']]);
        }
        return ['ok' => true];
    }
}
