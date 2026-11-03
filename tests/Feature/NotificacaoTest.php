<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Features\Aluno\Services\AlunoService;
use App\Features\Professor\Services\ProfessorService;
use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Documento;
use App\Models\Notificacao;
use App\Models\Professor;
use App\Models\Secretaria;
use App\Models\Status;
use App\Models\Tipo;

class NotificacaoTest extends TestCase
{
    use RefreshDatabase;

    private Professor $professor;
    private Aluno $aluno;
    private Tipo $tipo;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        Storage::fake('public');

        $this->professor = Professor::create([
            'nome' => 'Professor Teste', 'registro' => '1111111111111',
            'email' => 'prof@teste.com', 'senha' => 'x', 'nivel' => 'professor',
            'token' => 'token-prof',
        ]);
        $curso = Curso::create([
            'nomeCurso' => 'DSM', 'professor_idprofessor1' => $this->professor->idprofessor,
        ]);
        $this->aluno = Aluno::create([
            'nome' => 'Aluno Teste', 'ra' => '2222222222222', 'email' => 'aluno@teste.com',
            'senha' => 'x', 'Curso_idcurso' => $curso->idcurso, 'semestre' => 5,
            'token' => 'token-aluno',
        ]);
        $this->tipo = Tipo::create([
            'nome' => 'A', 'descricao' => 'Documento Inicial', 'ativo' => true, 'ordem' => 1,
        ]);

        Status::create(['nomeStatus' => 'Validado']);
        Status::create(['nomeStatus' => 'Invalidado']);
        Status::create(['nomeStatus' => 'Visualizado']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function enviarDocumento(): Documento
    {
        app(AlunoService::class)->criarDocumento(
            $this->aluno->idaluno, $this->tipo->idtipo, 'Meu plano', UploadedFile::fake()->create('plano.pdf', 10)
        );

        return Documento::firstOrFail();
    }

    private function avaliar(Documento $doc, string $status, string $feedback = ''): void
    {
        app(ProfessorService::class)->atualizarStatus(
            $this->professor->idprofessor, $doc->iddocumento, $this->tipo->idtipo, $status, $feedback
        );
    }

    private function comoAluno(): array
    {
        return ['Authorization' => 'Bearer token-aluno', 'X-Tipo-Usuario' => 'aluno'];
    }

    private function comoProfessor(): array
    {
        return ['Authorization' => 'Bearer token-prof', 'X-Tipo-Usuario' => 'professor'];
    }

    // ── Aluno envia → professor é notificado ──────────────────────────────────

    public function test_professor_recebe_notificacao_quando_aluno_envia_documento(): void
    {
        $doc = $this->enviarDocumento();

        $n = Notificacao::where('destinatario_tipo', 'professor')
            ->where('destinatario_id', $this->professor->idprofessor)
            ->first();

        $this->assertNotNull($n);
        $this->assertSame('documento_enviado', $n->tipo);
        $this->assertSame($doc->iddocumento, $n->documento_id);
        $this->assertStringContainsString('Aluno Teste', $n->mensagem);
        $this->assertNull($n->lida_em);
        $this->assertSame(0, Notificacao::where('destinatario_tipo', 'aluno')->count());
    }

    // ── Professor avalia → aluno é notificado ─────────────────────────────────

    public function test_aluno_recebe_notificacao_quando_documento_e_validado(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Validado');

        $n = Notificacao::where('destinatario_tipo', 'aluno')->first();

        $this->assertNotNull($n);
        $this->assertSame($this->aluno->idaluno, (int) $n->destinatario_id);
        $this->assertSame('documento_validado', $n->tipo);
        $this->assertStringContainsString('validado', $n->mensagem);
    }

    public function test_notificacao_de_invalidado_inclui_o_feedback(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Invalidado', 'Faltou a assinatura da empresa');

        $n = Notificacao::where('destinatario_tipo', 'aluno')->first();

        $this->assertSame('documento_invalidado', $n->tipo);
        $this->assertStringContainsString('Faltou a assinatura da empresa', $n->mensagem);
    }

    public function test_reavaliar_com_o_mesmo_status_e_sem_feedback_nao_duplica(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Validado');
        $this->avaliar($doc, 'Validado');

        $this->assertSame(1, Notificacao::where('destinatario_tipo', 'aluno')->count());
    }

    public function test_mudar_o_status_gera_nova_notificacao(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Invalidado', 'Corrigir');
        $this->avaliar($doc, 'Validado');

        $this->assertSame(2, Notificacao::where('destinatario_tipo', 'aluno')->count());
    }

    public function test_visualizado_nao_notifica_o_aluno(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Visualizado');

        $this->assertSame(0, Notificacao::where('destinatario_tipo', 'aluno')->count());
    }

    public function test_aluno_e_notificado_quando_professor_envia_correcao(): void
    {
        $doc = $this->enviarDocumento();

        app(ProfessorService::class)->corrigirDocumento(
            $this->professor->idprofessor, $doc->iddocumento, $this->tipo->idtipo,
            UploadedFile::fake()->create('corrigido.pdf', 10)
        );

        $n = Notificacao::where('destinatario_tipo', 'aluno')->first();

        $this->assertNotNull($n);
        $this->assertSame('documento_corrigido', $n->tipo);
    }

    // ── Prazos ────────────────────────────────────────────────────────────────

    public function test_aluno_e_notificado_quando_prazo_e_definido_alterado_ou_removido(): void
    {
        $svc = app(ProfessorService::class);
        $id  = $this->aluno->idaluno;
        $t   = $this->tipo->idtipo;

        $svc->salvarPrazo($id, $t, '2026-12-15');
        $svc->salvarPrazo($id, $t, '2026-12-15');   // igual: não notifica de novo
        $this->assertSame(1, Notificacao::where('destinatario_tipo', 'aluno')->count());
        $this->assertStringContainsString('15/12/2026', Notificacao::first()->mensagem);

        $svc->salvarPrazo($id, $t, '2026-12-20');   // alterado
        $svc->salvarPrazo($id, $t, null);           // removido
        $svc->salvarPrazo($id, $t, null);           // já não existia: não notifica
        $this->assertSame(3, Notificacao::where('destinatario_tipo', 'aluno')->count());
    }

    // ── API ───────────────────────────────────────────────────────────────────

    public function test_api_lista_apenas_as_notificacoes_do_proprio_usuario(): void
    {
        $doc = $this->enviarDocumento();          // 1 p/ professor
        $this->avaliar($doc, 'Validado');         // 1 p/ aluno

        $this->getJson('/api/notificacoes', $this->comoAluno())
            ->assertOk()
            ->assertJsonPath('nao_lidas', 1)
            ->assertJsonCount(1, 'notificacoes')
            ->assertJsonPath('notificacoes.0.tipo', 'documento_validado')
            ->assertJsonPath('notificacoes.0.lida', false);

        $this->getJson('/api/notificacoes', $this->comoProfessor())
            ->assertOk()
            ->assertJsonPath('nao_lidas', 1)
            ->assertJsonPath('notificacoes.0.tipo', 'documento_enviado');
    }

    public function test_api_marca_como_lida_e_atualiza_contador(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Validado');
        $id = Notificacao::where('destinatario_tipo', 'aluno')->value('idnotificacao');

        $this->postJson('/api/notificacoes/ler', ['id' => $id], $this->comoAluno())->assertOk();

        $this->getJson('/api/notificacoes', $this->comoAluno())
            ->assertJsonPath('nao_lidas', 0)
            ->assertJsonPath('notificacoes.0.lida', true);
    }

    public function test_api_nao_deixa_marcar_notificacao_de_outro_usuario(): void
    {
        $this->enviarDocumento();                 // notificação do PROFESSOR
        $idDoProfessor = Notificacao::where('destinatario_tipo', 'professor')->value('idnotificacao');

        $this->postJson('/api/notificacoes/ler', ['id' => $idDoProfessor], $this->comoAluno())->assertOk();

        $this->assertNull(Notificacao::find($idDoProfessor)->lida_em);
    }

    public function test_api_marca_todas_como_lidas(): void
    {
        $doc = $this->enviarDocumento();
        $this->avaliar($doc, 'Invalidado', 'x');
        $this->avaliar($doc, 'Validado');

        $this->postJson('/api/notificacoes/ler-todas', [], $this->comoAluno())->assertOk();

        $this->getJson('/api/notificacoes', $this->comoAluno())->assertJsonPath('nao_lidas', 0);
        // e não mexe nas do professor
        $this->getJson('/api/notificacoes', $this->comoProfessor())->assertJsonPath('nao_lidas', 1);
    }

    public function test_api_exige_autenticacao_e_nao_aceita_secretaria(): void
    {
        $this->getJson('/api/notificacoes')->assertStatus(401);

        Secretaria::create([
            'nome' => 'Sec', 'email' => 'sec@teste.com', 'senha' => 'x', 'token' => 'token-sec',
        ]);
        $this->getJson('/api/notificacoes', ['Authorization' => 'Bearer token-sec', 'X-Tipo-Usuario' => 'secretaria'])
            ->assertStatus(403);
    }

    public function test_falha_ao_criar_notificacao_nao_derruba_o_upload(): void
    {
        \Illuminate\Support\Facades\Schema::drop('notificacao');

        $resultado = app(AlunoService::class)->criarDocumento(
            $this->aluno->idaluno, $this->tipo->idtipo, 'Meu plano', UploadedFile::fake()->create('plano.pdf', 10)
        );

        $this->assertSame('sucesso', $resultado['status']);
        $this->assertDatabaseCount('documento', 1);
    }
}
