<?php

namespace App\Features\Professor\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use App\Features\Professor\Services\ProfessorService;

class ProfessorController extends Controller
{
    public function __construct(private ProfessorService $service) {}

    // ── Alunos ────────────────────────────────────────────────────────────────

    public function listarAlunos(Request $request)
    {
        $nivel       = $request->query('nivel', 'professor');
        $professorId = $request->query('professor_id');
        $cursoId     = $request->query('curso_id');

        return response()->json(
            $this->service->listarAlunos($nivel, $professorId ? (int) $professorId : null, $cursoId ? (int) $cursoId : null)
        );
    }

    public function detalheAluno(Request $request)
    {
        $alunoId = $request->input('aluno_id');
        if (!$alunoId) return response()->json(['erro' => 'Aluno não identificado'], 400);

        $resultado = $this->service->detalheAluno((int) $alunoId);
        if (!$resultado) return response()->json(['erro' => 'Aluno não encontrado'], 404);

        return response()->json($resultado);
    }

    public function criarAluno(Request $request)
    {
        $request->validate([
            'nome'     => ['required', 'string'],
            'ra'       => ['required', 'regex:/^\d{13}$/'],
            'email'    => ['required', 'email'],
            'semestre' => ['required', 'integer', 'min:1', 'max:6'],
        ]);

        $resultado = $this->service->criarAluno(
            $request->only('nome', 'ra', 'email', 'semestre'),
            $request->input('professor_id') ? (int) $request->input('professor_id') : null,
            $request->input('curso_id')     ? (int) $request->input('curso_id') : null,
        );

        $status = isset($resultado['error']) ? 400 : 200;
        return response()->json($resultado, $status);
    }

    public function cadastrarAlunos(Request $request)
    {
        $alunos      = $request->input('alunos', []);
        $professorId = $request->input('professor_id');

        if (empty($alunos))      return response()->json(['erro' => 'Nenhum aluno enviado'], 400);
        if (!$professorId)       return response()->json(['erro' => 'Professor não identificado'], 400);

        return response()->json($this->service->cadastrarAlunos($alunos, (int) $professorId, $request->input("curso_id") ? (int) $request->input("curso_id") : null));
    }

    public function verificarDuplicatas(Request $request)
    {
        $alunos = $request->input('alunos', []);
        $ras    = array_column($alunos, 'ra');
        $emails = array_column($alunos, 'email');

        $rasExistentes    = \App\Models\Aluno::whereIn('ra', $ras)->pluck('ra')->toArray();
        $emailsExistentes = \App\Models\Aluno::whereIn('email', $emails)->pluck('email')->toArray();

        return response()->json([
            'ras'    => $rasExistentes,
            'emails' => $emailsExistentes,
        ]);
    }

    public function setConcluido(Request $request)
    {
        $request->validate([
            'aluno_id'  => ['required', 'integer'],
            'concluido' => ['required', 'boolean'],
        ]);

        return response()->json(
            $this->service->setConcluido((int) $request->input('aluno_id'), (bool) $request->input('concluido'))
        );
    }

    // ── Documentos ────────────────────────────────────────────────────────────

    public function listarDocumentos(Request $request)
    {
        $professorId = $request->input('professor_id');
        $nivel       = $request->input('nivel', 'professor');

        if (!$professorId) return response()->json(['erro' => 'Professor não identificado'], 400);

        return response()->json($this->service->listarDocumentos($nivel, (int) $professorId));
    }

    public function atualizarStatus(Request $request)
    {
        $request->validate([
            'professor_id' => ['required', 'integer'],
            'documento_id' => ['required', 'integer'],
            'tipo_id'      => ['required', 'integer'],
            'status'       => ['required', 'string'],
        ]);

        $resultado = $this->service->atualizarStatus(
            (int) $request->input('professor_id'),
            (int) $request->input('documento_id'),
            (int) $request->input('tipo_id'),
            $request->input('status'),
            $request->input('feedback') ?? ''
        );

        return response()->json($resultado);
    }

    // ── Prazos ────────────────────────────────────────────────────────────────

    public function listarPrazos(Request $request)
    {
        $alunoId = $request->query('aluno_id');
        if (!$alunoId) return response()->json(['erro' => 'aluno_id obrigatório'], 400);

        return response()->json($this->service->listarPrazos((int) $alunoId));
    }

    public function salvarPrazo(Request $request)
    {
        $request->validate([
            'aluno_id' => ['required', 'integer'],
            'tipo_id'  => ['required', 'integer'],
        ]);

        return response()->json(
            $this->service->salvarPrazo(
                (int) $request->input('aluno_id'),
                (int) $request->input('tipo_id'),
                $request->input('dataLimite')
            )
        );
    }

    // ── Modelos ───────────────────────────────────────────────────────────────

    public function listarModelos()
    {
        return response()->json($this->service->listarModelos());
    }

    public function uploadModelo(Request $request)
    {
        $request->validate([
            'arquivo'       => ['required', 'file'],
            'tipoDocumento' => ['required', 'string'],
        ]);

        $professorId = (int) ($request->input('professor_id') ?? 1);

        $resultado = $this->service->uploadModelo(
            $professorId,
            $request->input('tipoDocumento'),
            $request->input('instrucoes'),
            $request->file('arquivo')
        );

        return response()->json($resultado);
    }

    public function baixarModelo(Request $request)
    {
        $tipo   = $request->query('tipo');
        $modelo = $this->service->baixarModelo($tipo);

        if (!$modelo || !$modelo->caminho_arquivo) {
            return response()->json(['erro' => 'Modelo não encontrado'], 404);
        }

        $caminho = Storage::disk('public')->path($modelo->caminho_arquivo);

        if (!file_exists($caminho)) {
            return response()->json(['erro' => 'Arquivo não encontrado no servidor'], 404);
        }

        return response()->download($caminho, $modelo->nome);
    }
}