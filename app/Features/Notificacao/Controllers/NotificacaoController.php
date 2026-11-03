<?php

namespace App\Features\Notificacao\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Features\Notificacao\Services\NotificacaoService;

/**
 * O destinatário SEMPRE vem do token (middleware auth.token), nunca do body/query:
 * assim um usuário só enxerga e marca como lidas as próprias notificações.
 */
class NotificacaoController extends Controller
{
    public function __construct(private NotificacaoService $service) {}

    public function listar(Request $request): JsonResponse
    {
        [$tipo, $id] = $this->destinatario($request);

        return response()->json($this->service->listar($tipo, $id));
    }

    public function marcarLida(Request $request): JsonResponse
    {
        $request->validate(['id' => ['required', 'integer']]);
        [$tipo, $id] = $this->destinatario($request);

        $this->service->marcarLida($tipo, $id, (int) $request->input('id'));

        return response()->json(['ok' => true]);
    }

    public function marcarTodasLidas(Request $request): JsonResponse
    {
        [$tipo, $id] = $this->destinatario($request);

        $this->service->marcarTodasLidas($tipo, $id);

        return response()->json(['ok' => true]);
    }

    /** @return array{0:string,1:int} */
    private function destinatario(Request $request): array
    {
        $tipo    = $request->input('_tipoUsuario');
        $usuario = $request->input('_usuarioAutenticado');

        $id = $tipo === NotificacaoService::DEST_ALUNO
            ? $usuario->idaluno
            : $usuario->idprofessor;

        return [$tipo, (int) $id];
    }
}
