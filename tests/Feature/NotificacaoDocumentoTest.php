<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\DocumentoEnviadoMail;
use App\Features\Aluno\Services\AlunoService;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Professor;
use App\Models\Tipo;

class NotificacaoDocumentoTest extends TestCase
{
    use RefreshDatabase;

    private function cenario(): array
    {
        $professor = Professor::create([
            'nome' => 'Professor Teste', 'registro' => '1234567890123',
            'email' => 'prof@teste.com', 'senha' => 'x', 'nivel' => 'professor',
        ]);
        $curso = Curso::create([
            'nomeCurso' => 'DSM', 'professor_idprofessor1' => $professor->idprofessor,
        ]);
        $aluno = Aluno::create([
            'nome' => 'Aluno Teste', 'ra' => '1234567890123', 'email' => 'aluno@teste.com',
            'senha' => 'x', 'Curso_idcurso' => $curso->idcurso, 'semestre' => 5,
        ]);
        $tipo = Tipo::create([
            'nome' => 'Plano de Estágio', 'descricao' => 'Plano de estágio',
            'ativo' => true, 'ordem' => 1,
        ]);

        return [$professor, $aluno, $tipo];
    }

    public function test_professor_recebe_email_quando_aluno_envia_documento(): void
    {
        Mail::fake();
        Storage::fake('public');
        [$professor, $aluno, $tipo] = $this->cenario();

        $resultado = app(AlunoService::class)->criarDocumento(
            $aluno->idaluno, $tipo->idtipo, 'Meu plano', UploadedFile::fake()->create('plano.pdf', 10)
        );

        $this->assertSame('sucesso', $resultado['status']);
        Mail::assertQueued(DocumentoEnviadoMail::class, fn ($m) => $m->hasTo($professor->email));
    }

    public function test_upload_funciona_mesmo_se_o_envio_do_email_falhar(): void
    {
        Storage::fake('public');
        [, $aluno, $tipo] = $this->cenario();

        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP fora do ar'));

        $resultado = app(AlunoService::class)->criarDocumento(
            $aluno->idaluno, $tipo->idtipo, 'Meu plano', UploadedFile::fake()->create('plano.pdf', 10)
        );

        $this->assertSame('sucesso', $resultado['status']);
        $this->assertDatabaseCount('documento', 1);
    }
}