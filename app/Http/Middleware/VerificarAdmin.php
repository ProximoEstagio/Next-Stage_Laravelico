<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerificarAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = $request->input('_usuarioAutenticado');

        if (!$usuario || ($usuario->nivel ?? '') !== 'admin') {
            return response()->json(['erro' => 'Acesso restrito a administradores'], 403);
        }

        return $next($request);
    }
}
