<?php

namespace App\Features\Auth\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\Professor;
use App\Models\Aluno;
use App\Models\Secretaria;

class AuthService
{
    private array $tiposPermitidos = ['aluno', 'professor', 'secretaria'];

    public function login(string $email, string $senha): ?array
    {
        // Tenta cada tipo de usuário
        foreach ($this->tiposPermitidos as $tipo) {
            $user = $this->buscarUsuario($tipo, $email);

            if ($user && Hash::check($senha, $user->senha)) {
                $token = $this->gerarToken($user, $tipo);

                return $this->montarResposta($user, $tipo, $token);
            }
        }

        return null;
    }

    public function logout(string $tipo, string $email): bool
    {
        if (!in_array($tipo, $this->tiposPermitidos)) return false;

        $model = $this->getModel($tipo);
        return (bool) $model::where('email', $email)->update(['token' => null]);
    }

    public function verificarToken(string $tipo, string $token): bool
    {
        if (!in_array($tipo, $this->tiposPermitidos) || empty($token)) return false;

        $model = $this->getModel($tipo);
        return $model::where('token', $token)->exists();
    }

    private function buscarUsuario(string $tipo, string $email)
    {
        $model = $this->getModel($tipo);
        return $model::where('email', $email)->first();
    }

    private function gerarToken($user, string $tipo): string
    {
        $token = bin2hex(random_bytes(32));
        $pk    = $this->getPrimaryKey($tipo);
        $model = $this->getModel($tipo);
        $model::where($pk, $user->$pk)->update(['token' => $token]);
        return $token;
    }

    private function montarResposta($user, string $tipo, string $token): array
    {
        $page = match ($tipo) {
            'aluno'      => 'pages/aluno/area_aluno.html',
            'secretaria' => 'pages/secretaria/secretaria.html',
            'professor'  => 'pages/professor/alunos.html',
        };

        return [
            'token'        => $token,
            'tipoUsuario'  => $tipo,
            'page'         => $page,
            'nome'         => $user->nome,
            'idcurso'      => $user->Curso_idcurso ?? null,
            'idprofessor'  => $user->idprofessor   ?? null,
            'idaluno'      => $user->idaluno        ?? null,
            'idsecretaria' => $user->idsecretaria   ?? null,
            'nivel'        => $user->nivel          ?? null,
        ];
    }

    private function getModel(string $tipo): string
    {
        return match ($tipo) {
            'professor'  => Professor::class,
            'aluno'      => Aluno::class,
            'secretaria' => Secretaria::class,
        };
    }

    private function getPrimaryKey(string $tipo): string
    {
        return match ($tipo) {
            'professor'  => 'idprofessor',
            'aluno'      => 'idaluno',
            'secretaria' => 'idsecretaria',
        };
    }
}
