<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Models\Professor;
use App\Models\Aluno;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_professor_com_credenciais_validas(): void
    {
        Professor::create([
            'nome'      => 'Professor Teste',
            'registro'  => '1234567890123',
            'email'     => 'prof@teste.com',
            'senha'     => Hash::make('senha123'),
            'nivel'     => 'professor',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'prof@teste.com',
            'senha' => 'senha123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'tipoUsuario', 'nome', 'nivel']);
    }

    public function test_login_com_credenciais_invalidas(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'naoexiste@teste.com',
            'senha' => 'errada',
        ]);

        $response->assertStatus(401)
                 ->assertJsonFragment(['erro' => 'Usuário ou senha inválidos']);
    }

    public function test_verificar_token_valido(): void
    {
        $professor = Professor::create([
            'nome'      => 'Professor Teste',
            'registro'  => '1234567890123',
            'email'     => 'prof2@teste.com',
            'senha'     => Hash::make('senha123'),
            'nivel'     => 'professor',
            'token'     => 'token_valido_teste',
        ]);

        $response = $this->postJson('/api/verificar-token', [
            'token'       => 'token_valido_teste',
            'tipoUsuario' => 'professor',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['valido' => true]);
    }

    public function test_rota_protegida_sem_token_retorna_401(): void
    {
        $response = $this->postJson('/api/aluno/documentos', [
            'aluno_id' => 1,
        ]);

        $response->assertStatus(401);
    }
}
