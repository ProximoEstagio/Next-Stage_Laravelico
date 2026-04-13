<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = ['current_password', 'password', 'password_confirmation', 'senha'];

    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'erro'   => 'Dados inválidos',
                        'campos' => $e->errors(),
                    ], 422);
                }

                return response()->json([
                    'erro' => $e->getMessage() ?: 'Erro interno do servidor',
                ], method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500);
            }
        });
    }
}
