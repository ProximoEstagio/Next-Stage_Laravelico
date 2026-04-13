<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Professor;
use App\Models\Aluno;
use App\Models\Secretaria;

class VerificarToken
{
    public function handle(Request $request, Closure $next, string ...$tipos)
    {
        $token = $request->bearerToken()
            ?? $request->header('X-Token')
            ?? $request->input('token');

        $tipoUsuario = $request->header('X-Tipo-Usuario')
            ?? $request->input('tipoUsuario');

        if (!$token || !$tipoUsuario) {
            return response()->json(['erro' => 'Não autenticado'], 401);
        }

        // Se a rota exige tipos específicos, valida
        if (!empty($tipos) && !in_array($tipoUsuario, $tipos)) {
            return response()->json(['erro' => 'Acesso não autorizado'], 403);
        }

        $model = match ($tipoUsuario) {
            'professor'  => Professor::class,
            'aluno'      => Aluno::class,
            'secretaria' => Secretaria::class,
            default      => null,
        };

        if (!$model || !$model::where('token', $token)->exists()) {
            return response()->json(['erro' => 'Token inválido'], 401);
        }

        // Injeta usuário autenticado na request
        $request->merge(['_tipoUsuario' => $tipoUsuario]);
        $request->merge(['_usuarioAutenticado' => $model::where('token', $token)->first()]);

        return $next($request);
    }
}
