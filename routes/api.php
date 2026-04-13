<?php

use Illuminate\Support\Facades\Route;

use App\Features\Auth\Controllers\AuthController;
use App\Features\Aluno\Controllers\AlunoController;
use App\Features\Professor\Controllers\ProfessorController;
use App\Features\Admin\Controllers\AdminController;
use App\Features\Secretaria\Controllers\SecretariaController;
use App\Features\Perfil\Controllers\PerfilController;

// ── Públicas ──────────────────────────────────────────────────────────────────
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/logout',          [AuthController::class, 'logout']);
Route::post('/verificar-token', [AuthController::class, 'verificarToken']);

// ── Qualquer usuário autenticado ──────────────────────────────────────────────
Route::middleware('auth.token')->group(function () {
    Route::post('/perfil',                 [PerfilController::class,   'infoPerfil']);
    Route::post('/upload-foto',            [PerfilController::class,   'uploadFoto']);

    // Modelos — aluno também precisa listar e baixar
    Route::get('/professor/modelos',        [ProfessorController::class, 'listarModelos']);
    Route::get('/professor/modelos/baixar', [ProfessorController::class, 'baixarModelo']);
});

// ── Aluno ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth.token:aluno'])->prefix('aluno')->group(function () {
    Route::post('/documentos',      [AlunoController::class, 'listarDocumentos']);
    Route::post('/criar-documento', [AlunoController::class, 'criarDocumento']);
    Route::get('/tipos',            [AlunoController::class, 'getTipos']);
});

// ── Professor ─────────────────────────────────────────────────────────────────
Route::middleware(['auth.token:professor'])->prefix('professor')->group(function () {
    // Alunos
    Route::get('/alunos',          [ProfessorController::class, 'listarAlunos']);
    Route::post('/aluno/detalhe',  [ProfessorController::class, 'detalheAluno']);
    Route::post('/aluno/criar',    [ProfessorController::class, 'criarAluno']);
    Route::post('/alunos/csv',          [ProfessorController::class, 'cadastrarAlunos']);
    Route::post('/alunos/verificar',     [ProfessorController::class, 'verificarDuplicatas']);
    Route::post('/aluno/concluir', [ProfessorController::class, 'setConcluido']);

    // Documentos
    Route::post('/documentos',     [ProfessorController::class, 'listarDocumentos']);
    Route::post('/status',         [ProfessorController::class, 'atualizarStatus']);

    // Prazos
    Route::get('/prazos',          [ProfessorController::class, 'listarPrazos']);
    Route::post('/prazos',         [ProfessorController::class, 'salvarPrazo']);

    // Upload de modelos (só professor)
    Route::post('/modelos/upload', [ProfessorController::class, 'uploadModelo']);
});

// ── Admin (professor com nível admin) ─────────────────────────────────────────
Route::middleware(['auth.token:professor', 'auth.admin'])->prefix('admin')->group(function () {
    Route::match(['GET', 'POST'], '/tipos', [AdminController::class, 'gerenciarTipos']);
    Route::get('/cursos',            [AdminController::class, 'listarCursos']);
    Route::post('/cursos',           [AdminController::class, 'criarCurso']);
    Route::post('/cursos/atualizar', [AdminController::class, 'atualizarCurso']);
    Route::get('/professores',       [AdminController::class, 'listarProfessores']);
    Route::post('/professores',      [AdminController::class, 'criarProfessor']);
});

// ── Secretaria ────────────────────────────────────────────────────────────────
Route::middleware(['auth.token:secretaria'])->prefix('secretaria')->group(function () {
    Route::get('/alunos-concluidos', [SecretariaController::class, 'listarConcluidos']);
});