<?php

namespace App\Features\Auth\Services;

use Carbon\Carbon;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\CodigoVerificacaoMail;

/**
 * 2FA por e-mail (código de 6 dígitos).
 *
 * Fluxo: a senha correta abre um "desafio" guardado no cache (nunca o código
 * em texto puro, só um HMAC). O token de sessão só é emitido depois que o
 * código do desafio for confirmado. Cada desafio é de uso único.
 */
class TwoFactorService
{
    public function ativo(): bool
    {
        return (bool) config('two_factor.enabled');
    }

    /**
     * Abre o desafio e envia o código por e-mail.
     *
     * @throws \RuntimeException se o e-mail não puder ser enviado
     */
    public function iniciar(string $tipo, int $usuarioId, string $email, string $nome): array
    {
        $desafio = bin2hex(random_bytes(32));
        $codigo  = $this->gerarCodigo();
        $agora   = now()->timestamp;

        Cache::put($this->chave($desafio), [
            'tipo'       => $tipo,
            'usuario_id' => $usuarioId,
            'email'      => $email,
            'nome'       => $nome,
            'hash'       => $this->hash($codigo),
            'tentativas' => 0,
            'reenvios'   => 0,
            'enviado_em' => $agora,
            'expira_em'  => $agora + $this->ttlSegundos(),
        ], Carbon::createFromTimestamp($agora + $this->ttlSegundos()));

        try {
            $this->enviarEmail($email, $nome, $codigo);
        } catch (\Throwable $e) {
            Cache::forget($this->chave($desafio));
            Log::error('Falha ao enviar código 2FA', ['tipo' => $tipo, 'usuario_id' => $usuarioId, 'erro' => $e->getMessage()]);
            throw new \RuntimeException('Falha ao enviar o código de verificação');
        }

        return [
            'requer2fa'       => true,
            'desafio'         => $desafio,
            'email_mascarado' => $this->mascararEmail($email),
            'expira_em'       => $this->ttlSegundos(),
            'reenvio_em'      => (int) config('two_factor.resend_cooldown_seconds'),
        ];
    }

    /**
     * Confere o código. Retorna ['ok' => true, 'tipo' => ..., 'usuario_id' => ...]
     * ou ['ok' => false, 'status' => HTTP, 'corpo' => [...]].
     */
    public function verificar(string $desafio, string $codigo): array
    {
        return $this->comTrava($desafio, function () use ($desafio, $codigo) {
            $chave = $this->chave($desafio);
            $dados = Cache::get($chave);

            if (!$dados) {
                return $this->falha(410, 'Código expirado. Faça login novamente.', ['expirado' => true]);
            }

            $max = (int) config('two_factor.max_attempts');

            if (!hash_equals($dados['hash'], $this->hash($codigo))) {
                $dados['tentativas']++;
                $restantes = $max - $dados['tentativas'];

                if ($restantes <= 0) {
                    Cache::forget($chave);
                    return $this->falha(429, 'Muitas tentativas incorretas. Faça login novamente.', ['expirado' => true]);
                }

                Cache::put($chave, $dados, Carbon::createFromTimestamp($dados['expira_em']));
                return $this->falha(422, 'Código incorreto.', ['tentativas_restantes' => $restantes]);
            }

            Cache::forget($chave); // uso único

            return ['ok' => true, 'tipo' => $dados['tipo'], 'usuario_id' => $dados['usuario_id']];
        });
    }

    /**
     * Gera e envia um novo código para o mesmo desafio.
     */
    public function reenviar(string $desafio): array
    {
        return $this->comTrava($desafio, function () use ($desafio) {
            $chave = $this->chave($desafio);
            $dados = Cache::get($chave);

            if (!$dados) {
                return $this->falha(410, 'Código expirado. Faça login novamente.', ['expirado' => true]);
            }

            if ($dados['reenvios'] >= (int) config('two_factor.max_resends')) {
                Cache::forget($chave);
                return $this->falha(429, 'Limite de reenvios atingido. Faça login novamente.', ['expirado' => true]);
            }

            $espera = (int) config('two_factor.resend_cooldown_seconds') - (now()->timestamp - $dados['enviado_em']);
            if ($espera > 0) {
                return $this->falha(429, "Aguarde {$espera} segundos para reenviar o código.", ['aguarde' => $espera]);
            }

            $codigo = $this->gerarCodigo();

            try {
                $this->enviarEmail($dados['email'], $dados['nome'], $codigo);
            } catch (\Throwable $e) {
                Log::error('Falha ao reenviar código 2FA', ['usuario_id' => $dados['usuario_id'], 'erro' => $e->getMessage()]);
                return $this->falha(503, 'Não foi possível enviar o código. Tente novamente em instantes.');
            }

            $agora = now()->timestamp;
            $dados['hash']       = $this->hash($codigo); // o código anterior deixa de valer
            $dados['reenvios']++;
            $dados['enviado_em'] = $agora;
            $dados['expira_em']  = $agora + $this->ttlSegundos();

            Cache::put($chave, $dados, Carbon::createFromTimestamp($dados['expira_em']));

            return [
                'ok'     => true,
                'status' => 200,
                'corpo'  => [
                    'ok'         => true,
                    'expira_em'  => $this->ttlSegundos(),
                    'reenvio_em' => (int) config('two_factor.resend_cooldown_seconds'),
                ],
            ];
        });
    }

    // ── Internos ──────────────────────────────────────────────────────────────

    private function enviarEmail(string $email, string $nome, string $codigo): void
    {
        Mail::to($email)->send(new CodigoVerificacaoMail(
            nome:           $nome,
            codigo:         $codigo,
            minutosValidade: (int) config('two_factor.ttl_minutes'),
        ));
    }

    /** Trava por desafio: impede que requisições paralelas burlem o limite de tentativas. */
    private function comTrava(string $desafio, callable $acao): array
    {
        try {
            return Cache::lock('2fa-lock:' . $desafio, 5)->block(3, $acao);
        } catch (LockTimeoutException) {
            return $this->falha(429, 'Muitas requisições. Tente novamente.');
        }
    }

    private function falha(int $status, string $erro, array $extra = []): array
    {
        return ['ok' => false, 'status' => $status, 'corpo' => ['erro' => $erro] + $extra];
    }

    private function chave(string $desafio): string
    {
        return '2fa:' . $desafio;
    }

    private function ttlSegundos(): int
    {
        return (int) config('two_factor.ttl_minutes') * 60;
    }

    private function gerarCodigo(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function hash(string $codigo): string
    {
        return hash_hmac('sha256', $codigo, (string) config('app.key'));
    }

    private function mascararEmail(string $email): string
    {
        [$local, $dominio] = explode('@', $email, 2) + [1 => ''];

        return mb_substr($local, 0, 1) . '***@' . $dominio;
    }
}
