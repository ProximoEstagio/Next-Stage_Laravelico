<?php

namespace App\Features\FAQ\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\FAQ\Services\FaqService;

class FaqController extends Controller
{
    public function __construct(private FaqService $service) {}

    public function listar()
    {
        return response()->json($this->service->listar());
    }

    public function listarTodos()
    {
        return response()->json($this->service->listarTodos());
    }

    public function criar(Request $request)
    {
        $request->validate([
            'pergunta' => ['required', 'string'],
            'resposta' => ['required', 'string'],
        ]);
        return response()->json($this->service->criar(
            $request->input('pergunta'),
            $request->input('resposta')
        ));
    }

    public function atualizar(Request $request, int $id)
    {
        $request->validate([
            'pergunta' => ['required', 'string'],
            'resposta' => ['required', 'string'],
        ]);
        return response()->json($this->service->atualizar(
            $id,
            $request->input('pergunta'),
            $request->input('resposta')
        ));
    }

    public function toggleAtivo(int $id)
    {
        return response()->json($this->service->toggleAtivo($id));
    }

    public function excluir(int $id)
    {
        return response()->json($this->service->excluir($id));
    }
}