<?php

namespace App\Features\Perfil\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Perfil\Services\PerfilService;

class PerfilController extends Controller
{
    public function __construct(private PerfilService $service) {}

    public function infoPerfil(Request $request)
    {
        $email  = $request->input('emailUser');
        $tipo   = $request->input('tipoUser');
        $reason = $request->input('reason');

        if ($reason === 'loadPage') {
            $dados = $this->service->carregar($tipo, $email);
            if (!$dados) return response()->json(['error' => 'Usuário não encontrado'], 404);
            return response()->json($dados);
        }

        if ($reason === 'update') {
            return response()->json(
                $this->service->atualizar($tipo, $email, $request->all())
            );
        }

        return response()->json(['status' => 'error', 'message' => 'Requisição inválida'], 400);
    }

    public function uploadFoto(Request $request)
    {
        $request->validate([
            'foto'     => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'emailUser' => ['required', 'email'],
            'tipoUser'  => ['required', 'string'],
        ]);

        $resultado = $this->service->uploadFoto(
            $request->input('tipoUser'),
            $request->input('emailUser'),
            $request->file('foto')
        );

        return response()->json($resultado);
    }
}
