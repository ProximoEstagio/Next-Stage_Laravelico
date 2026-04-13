<?php

namespace App\Features\Aluno\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Aluno\Services\AlunoService;

class AlunoController extends Controller
{
    public function __construct(private AlunoService $service) {}

    public function listarDocumentos(Request $request)
    {
        $alunoId = $request->input('aluno_id');

        if (!$alunoId) {
            return response()->json(['erro' => 'Aluno não identificado'], 400);
        }

        return response()->json($this->service->listarDocumentos((int) $alunoId));
    }

    public function getTipos()
    {
        return response()->json($this->service->listarTipos());
    }

    public function criarDocumento(Request $request)
    {
        $request->validate([
            'arquivo'        => ['required', 'file'],
            'nome_documento' => ['required', 'string'],
            'tipo_documento' => ['required', 'integer'],
            'aluno_id'       => ['required', 'integer', 'exists:aluno,idaluno'],
        ]);

        $resultado = $this->service->criarDocumento(
            (int) $request->input('aluno_id'),
            (int) $request->input('tipo_documento'),
            $request->input('nome_documento'),
            $request->file('arquivo')
        );

        $status = $resultado['status'] === 'sucesso' ? 200 : 422;
        return response()->json($resultado, $status);
    }
}
