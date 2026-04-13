<?php

namespace App\Features\Auth\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Auth\Services\AuthService;
use App\Features\Auth\Requests\LoginRequest;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('senha')
        );

        if (!$result) {
            return response()->json(['erro' => 'Usuário ou senha inválidos'], 401);
        }

        return response()->json($result);
    }

    public function logout(Request $request)
    {
        $this->authService->logout(
            $request->input('tipoUsuario'),
            $request->input('email')
        );

        return response()->json(['ok' => true]);
    }

    public function verificarToken(Request $request)
    {
        $valido = $this->authService->verificarToken(
            $request->input('tipoUsuario'),
            $request->input('token')
        );

        return response()->json(['valido' => $valido]);
    }
}
