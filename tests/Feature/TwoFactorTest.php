<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\CodigoVerificacaoMail;
use App\Models\Professor;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['two_factor.enabled' => true]);
        Mail::fake();

        Professor::create([
            'nome'     => 'Professor 2FA',
            'registro' => '1234567890123',
            'email'    => 'prof2fa@teste.com',
            'senha'    => Hash::make('senha123'),
            'nivel'    => 'professor',
        ]);
    }

    /** Primeira etapa: retorna [desafio, codigo enviado por e-mail]. */
    private function primeiraEtapa(): array
    {
        $resp = $this->postJson('/api/login', [
            'email' => 'prof2fa@teste.com',
            'senha' => 'senha123',
        ]);

        $resp->assertOk()
             ->assertJsonPath('requer2fa', true)
             ->assertJsonMissingPath('token');

        return [$resp->json('desafio'), $this->ultimoCodigoEnviado()];
    }

    private function ultimoCodigoEnviado(): string
    {
        $codigo = null;

        Mail::assertSent(CodigoVerificacaoMail::class, function ($mail) use (&$codigo) {
            $codigo = $mail->codigo;
            return true;
        });

        return $codigo;
    }

    private function codigoErrado(string $certo): string
    {
        return $certo === '000000' ? '111111' : '000000';
    }

    public function test_login_com_2fa_nao_emite_token_e_envia_codigo(): void
    {
        $this->primeiraEtapa();

        Mail::assertSent(CodigoVerificacaoMail::class, fn ($m) => $m->hasTo('prof2fa@teste.com'));
        $this->assertNull(Professor::first()->token);
    }

    public function test_senha_errada_nao_abre_desafio_nem_envia_email(): void
    {
        $this->postJson('/api/login', ['email' => 'prof2fa@teste.com', 'senha' => 'errada'])
             ->assertStatus(401);

        Mail::assertNothingSent();
    }

    public function test_codigo_correto_conclui_login_e_e_de_uso_unico(): void
    {
        [$desafio, $codigo] = $this->primeiraEtapa();

        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $codigo])
             ->assertOk()
             ->assertJsonStructure(['token', 'tipoUsuario', 'nome', 'nivel']);

        $this->assertNotNull(Professor::first()->token);

        // Reutilizar o mesmo desafio não funciona
        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $codigo])
             ->assertStatus(410);
    }

    public function test_codigo_incorreto_nao_emite_token_e_informa_tentativas(): void
    {
        [$desafio, $codigo] = $this->primeiraEtapa();

        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $this->codigoErrado($codigo)])
             ->assertStatus(422)
             ->assertJsonPath('tentativas_restantes', 4)
             ->assertJsonMissingPath('token');

        $this->assertNull(Professor::first()->token);
    }

    public function test_bloqueia_o_desafio_apos_muitas_tentativas(): void
    {
        [$desafio, $codigo] = $this->primeiraEtapa();
        $errado = $this->codigoErrado($codigo);

        for ($i = 1; $i <= 4; $i++) {
            $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $errado])
                 ->assertStatus(422);
        }

        // 5ª tentativa incorreta estoura o limite
        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $errado])
             ->assertStatus(429)
             ->assertJsonPath('expirado', true);

        // Mesmo o código certo não vale mais: é preciso fazer login de novo
        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $codigo])
             ->assertStatus(410);

        $this->assertNull(Professor::first()->token);
    }

    public function test_reenvio_respeita_intervalo_e_invalida_o_codigo_anterior(): void
    {
        [$desafio, $codigoAntigo] = $this->primeiraEtapa();

        // Logo após o envio: bloqueado pelo intervalo
        $this->postJson('/api/2fa/reenviar', ['desafio' => $desafio])
             ->assertStatus(429)
             ->assertJsonStructure(['erro', 'aguarde']);

        // Depois do intervalo: envia um novo código
        $this->travel(61)->seconds();

        $this->postJson('/api/2fa/reenviar', ['desafio' => $desafio])->assertOk();

        $novoCodigo = $this->ultimoCodigoEnviado();

        $this->postJson('/api/2fa/verificar', ['desafio' => $desafio, 'codigo' => $novoCodigo])
             ->assertOk()
             ->assertJsonStructure(['token']);
    }

    public function test_desafio_inexistente_retorna_410(): void
    {
        $this->postJson('/api/2fa/verificar', [
            'desafio' => str_repeat('a', 64),
            'codigo'  => '123456',
        ])->assertStatus(410)->assertJsonPath('expirado', true);
    }

    public function test_formato_invalido_retorna_422(): void
    {
        $this->postJson('/api/2fa/verificar', ['desafio' => 'curto', 'codigo' => '12'])
             ->assertStatus(422);
    }

    public function test_falha_no_envio_do_email_nao_emite_token(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP fora do ar'));

        $this->postJson('/api/login', ['email' => 'prof2fa@teste.com', 'senha' => 'senha123'])
             ->assertStatus(503)
             ->assertJsonMissingPath('token');

        $this->assertNull(Professor::first()->token);
    }

    public function test_com_2fa_desligado_o_login_continua_direto(): void
    {
        config(['two_factor.enabled' => false]);

        $this->postJson('/api/login', ['email' => 'prof2fa@teste.com', 'senha' => 'senha123'])
             ->assertOk()
             ->assertJsonStructure(['token', 'tipoUsuario', 'nome', 'nivel']);

        Mail::assertNothingSent();
    }
}
