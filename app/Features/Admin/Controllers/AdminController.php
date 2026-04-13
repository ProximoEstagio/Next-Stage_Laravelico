<?php

namespace App\Features\Admin\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Admin\Services\AdminService;

class AdminController extends Controller
{
    public function __construct(private AdminService $service) {}

    // ── Cursos ────────────────────────────────────────────────────────────────

    public function listarCursos()
    {
        return response()->json($this->service->listarCursos());
    }

    public function criarCurso(Request $request)
    {
        $request->validate([
            'nomeCurso'    => ['required', 'string'],
            'professor_id' => ['required', 'integer'],
        ]);

        return response()->json(
            $this->service->criarCurso($request->input('nomeCurso'), (int) $request->input('professor_id'))
        );
    }

    public function atualizarCurso(Request $request)
    {
        $request->validate([
            'curso_id'     => ['required', 'integer'],
            'professor_id' => ['required', 'integer'],
        ]);

        return response()->json(
            $this->service->atualizarCurso((int) $request->input('curso_id'), (int) $request->input('professor_id'))
        );
    }

    // ── Professores ───────────────────────────────────────────────────────────

    public function listarProfessores()
    {
        return response()->json($this->service->listarProfessores());
    }

    public function criarProfessor(Request $request)
    {
        $request->validate([
            'nome'  => ['required', 'string'],
            'email' => ['required', 'email'],
            'senha' => ['required', 'string', 'min:4'],
        ]);

        return response()->json($this->service->criarProfessor($request->all()));
    }

    // ── Tipos ─────────────────────────────────────────────────────────────────

    public function gerenciarTipos(Request $request)
    {
        if ($request->isMethod('GET')) {
            return response()->json($this->service->listarTipos());
        }

        $action = $request->input('action');

        return match ($action) {
            'criar'         => response()->json($this->service->criarTipo($request->input('nome', ''))),
            'toggleAtivo'   => response()->json($this->service->toggleAtivo((int) $request->input('tipo_id'))),
            'atualizarOrdem'=> response()->json($this->service->atualizarOrdem($request->input('tipos', []))),
            default         => response()->json(['erro' => 'Ação inválida'], 400),
        };
    }
}
