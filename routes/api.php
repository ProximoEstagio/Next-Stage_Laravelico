<?php

use Illuminate\Support\Facades\Route;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Aluno\Controllers\AlunoController;
use App\Features\Professor\Controllers\ProfessorController;
use App\Features\Admin\Controllers\AdminController;
use App\Features\Secretaria\Controllers\SecretariaController;
use App\Features\Perfil\Controllers\PerfilController;
use App\Features\FAQ\Controllers\FaqController;

// ── Públicas ──────────────────────────────────────────────────────────────────
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/logout',          [AuthController::class, 'logout']);
Route::post('/verificar-token', [AuthController::class, 'verificarToken']);

// ── Perfil ────────────────────────────────────────────────────────────────────
Route::middleware('auth.token')->group(function () {
    Route::post('/perfil',      [PerfilController::class, 'infoPerfil']);
    Route::post('/upload-foto', [PerfilController::class, 'uploadFoto']);

    
    // Route::get('/professor/modelos',        [ProfessorController::class, 'listarModelos']);
    // Route::get('/professor/modelos/baixar', [ProfessorController::class, 'baixarModelo']);

});

// ── Aluno ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth.token:aluno'])->prefix('aluno')->group(function () {
    Route::post('/documentos',      [AlunoController::class, 'listarDocumentos']);
    Route::post('/criar-documento', [AlunoController::class, 'criarDocumento']);
    Route::get('/tipos',            [AlunoController::class, 'getTipos']);

    Route::get('/modelos', [ProfessorController::class, 'listarModelos']);
    Route::get('/modelos/baixar', [ProfessorController::class, 'baixarModelo']);
});

// ── Professor ─────────────────────────────────────────────────────────────────
Route::middleware(['auth.token:professor'])->prefix('professor')->group(function () {
    // Alunos
    Route::get('/alunos',            [ProfessorController::class, 'listarAlunos']);
    Route::post('/aluno/detalhe',    [ProfessorController::class, 'detalheAluno']);
    Route::post('/aluno/criar',      [ProfessorController::class, 'criarAluno']);
    Route::post('/alunos/csv',       [ProfessorController::class, 'cadastrarAlunos']);
    Route::post('/alunos/verificar', [ProfessorController::class, 'verificarDuplicatas']);
    Route::post('/aluno/concluir',   [ProfessorController::class, 'setConcluido']);

    // Documentos
    Route::post('/documentos',          [ProfessorController::class, 'listarDocumentos']);
    Route::post('/status',              [ProfessorController::class, 'atualizarStatus']);
    Route::post('/documentos/corrigir', [ProfessorController::class, 'corrigirDocumento']);

    // Prazos
    Route::get('/prazos',  [ProfessorController::class, 'listarPrazos']);
    Route::post('/prazos', [ProfessorController::class, 'salvarPrazo']);

    // Modelos
    Route::get('/modelos',          [ProfessorController::class, 'listarModelos']);
    Route::post('/modelos/upload',  [ProfessorController::class, 'uploadModelo']);
    Route::post('/modelos/remover', [ProfessorController::class, 'removerModelo']);
    Route::get('/modelos/baixar',   [ProfessorController::class, 'baixarModelo']);

    

    // Tipos
    Route::get('/tipos', [ProfessorController::class, 'listarTipos']);
});

// ── Admin ─────────────────────────────────────────────────────────────────────
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

// ── FAQ (público para autenticados) ───────────────────────────────────────────
Route::middleware('auth.token')->group(function () {
    Route::get('/faq', [FaqController::class, 'listar']);
});
Route::middleware(['auth.token:professor', 'auth.admin'])
->prefix('admin')
->group(function () {
    Route::get('/faq',               [FaqController::class, 'listarTodos']);
    Route::post('/faq',              [FaqController::class, 'criar']);
    Route::post('/faq/{id}',         [FaqController::class, 'atualizar']);
    Route::post('/faq/{id}/toggle',  [FaqController::class, 'toggleAtivo']);
    Route::post('/faq/{id}/excluir', [FaqController::class, 'excluir']);
});
 
Route::get('/ver-foto/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404);
    }

    return response()->file($fullPath);
})->where('path', '.*');