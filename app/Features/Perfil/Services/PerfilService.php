<?php

namespace App\Features\Perfil\Services;

use Illuminate\Support\Facades\Storage;
use App\Models\Professor;
use App\Models\Aluno;
use App\Models\Secretaria;

class PerfilService
{
    private array $tiposPermitidos = ['aluno', 'professor', 'secretaria'];

    public function carregar(string $tipo, string $email): ?array
    {
        if (!in_array($tipo, $this->tiposPermitidos)) return null;

        $model = $this->getModel($tipo);
        $user  = $model::where('email', $email)->first();
        if (!$user) return null;

        $data = $user->toArray();

        // Adiciona nome do curso se aplicável
        if ($tipo === 'aluno' && $user->curso) {
            $data['nomeCurso'] = $user->curso->nomeCurso;
        }
        if ($tipo === 'professor' && $user->curso) {
            $data['nomeCurso'] = $user->curso->nomeCurso;
        }

        unset($data['senha'], $data['token']);
        return $data;
    }

    public function atualizar(string $tipo, string $emailAtual, array $dados): array
    {
        if (!in_array($tipo, $this->tiposPermitidos)) {
            return ['status' => 'error', 'message' => 'Tipo inválido'];
        }

        if (!empty($dados['telefone']) && !preg_match('/^\d{10,13}$/', $dados['telefone'])) {
            return ['status' => 'error', 'message' => 'Telefone deve conter entre 10 e 13 números'];
        }

        $model   = $this->getModel($tipo);
        $payload = [
            'nome'     => $dados['nome'],
            'email'    => $dados['email'],
            'telefone' => $dados['telefone'] ?? null,
        ];

        if (!empty($dados['senha'])) {
            $payload['senha'] = bcrypt($dados['senha']);
        }

        $model::where('email', $emailAtual)->update($payload);

        return ['status' => 'success', 'message' => 'Perfil atualizado com sucesso'];
    }

    public function uploadFoto(string $tipo, string $email, $arquivo): array
    {
        if (!in_array($tipo, ['aluno', 'professor'])) {
            return ['status' => 'erro', 'mensagem' => 'Tipo inválido'];
        }

        $ext = strtolower($arquivo->getClientOriginalExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png'])) {
            return ['status' => 'erro', 'mensagem' => 'Apenas JPG e PNG são permitidos'];
        }

        if ($arquivo->getSize() > 2 * 1024 * 1024) {
            return ['status' => 'erro', 'mensagem' => 'A foto deve ter no máximo 2MB'];
        }

        $nomeArquivo     = $tipo . '_' . md5($email) . '.' . $ext;
        $caminhoRelativo = "uploads/fotos/{$nomeArquivo}";

        Storage::disk('public')->putFileAs('uploads/fotos', $arquivo, $nomeArquivo);

        $model = $this->getModel($tipo);
        $model::where('email', $email)->update(['foto' => $caminhoRelativo]);

        return ['status' => 'sucesso', 'foto' => $caminhoRelativo];
    }

    private function getModel(string $tipo): string
    {
        return match ($tipo) {
            'professor'  => Professor::class,
            'aluno'      => Aluno::class,
            'secretaria' => Secretaria::class,
        };
    }
}
