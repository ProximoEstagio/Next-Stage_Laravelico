<?php

namespace App\Features\Auth\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Auth\Services\AuthService;
use App\Features\Auth\Services\TwoFactorService;
use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\Verificar2faRequest;
use App\Features\Auth\Requests\Reenviar2faRequest;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private TwoFactorService $twoFactor,
    ) {}

    public function login(LoginRequest $request)
    {
        try {
            $result = $this->authService->login(
                $request->validated('email'),
                $request->validated('senha')
            );
        } catch (\RuntimeException $e) {
            // Falha ao enviar o código 2FA por e-mail
            return response()->json([
                'erro' => 'Não foi possível enviar o código de verificação. Tente novamente em instantes.',
            ], 503);
        }

        if (!$result) {
            return response()->json(['erro' => 'Usuário ou senha inválidos'], 401);
        }

        return response()->json($result);
    }

    // ── 2FA: segunda etapa do login ───────────────────────────────────────────

    public function verificarDoisFatores(Verificar2faRequest $request)
    {
        $resultado = $this->twoFactor->verificar(
            $request->validated('desafio'),
            $request->validated('codigo')
        );

        if (!$resultado['ok']) {
            return response()->json($resultado['corpo'], $resultado['status']);
        }

        $login = $this->authService->concluirLogin($resultado['tipo'], $resultado['usuario_id']);

        if (!$login) {
            return response()->json(['erro' => 'Usuário não encontrado', 'expirado' => true], 401);
        }

        return response()->json($login);
    }

    public function reenviarDoisFatores(Reenviar2faRequest $request)
    {
        $resultado = $this->twoFactor->reenviar($request->validated('desafio'));

        return response()->json($resultado['corpo'], $resultado['status']);
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
