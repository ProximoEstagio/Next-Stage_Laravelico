<?php

namespace App\Features\Secretaria\Controllers;

use Illuminate\Routing\Controller;
use App\Features\Secretaria\Services\SecretariaService;

class SecretariaController extends Controller
{
    public function __construct(private SecretariaService $service) {}

    public function listarConcluidos()
    {
        $alunos = $this->service->listarConcluidos();
        return response()->json(['alunos' => $alunos, 'total' => count($alunos)]);
    }
}
