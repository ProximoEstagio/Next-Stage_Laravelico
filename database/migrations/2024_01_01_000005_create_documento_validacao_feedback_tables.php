<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documento', function (Blueprint $table) {
            $table->id('iddocumento');
            $table->dateTime('dataEmissao');
            $table->string('descricao', 255)->nullable();
            $table->unsignedBigInteger('aluno_idaluno');
            $table->unsignedBigInteger('tipo_idtipo');
            $table->string('caminho_arquivo', 255)->nullable();
            $table->timestamps();

            $table->foreign('aluno_idaluno')->references('idaluno')->on('aluno');
            $table->foreign('tipo_idtipo')->references('idtipo')->on('tipo');
        });

        Schema::create('validacao', function (Blueprint $table) {
            $table->unsignedBigInteger('professor_idprofessor');
            $table->unsignedBigInteger('documento_iddocumento');
            $table->unsignedBigInteger('documento_tipo_idtipo');
            $table->unsignedBigInteger('status_cod_status');
            $table->timestamps();

            $table->primary(['documento_tipo_idtipo', 'documento_iddocumento', 'professor_idprofessor']);

            $table->foreign('professor_idprofessor')->references('idprofessor')->on('professor');
            $table->foreign('documento_iddocumento')->references('iddocumento')->on('documento');
            $table->foreign('documento_tipo_idtipo')->references('idtipo')->on('tipo');
            $table->foreign('status_cod_status')->references('cod_status')->on('status');
        });

        Schema::create('feedback', function (Blueprint $table) {
            $table->id('idfeedback');
            $table->text('descricao');
            $table->unsignedBigInteger('aluno_idaluno');
            $table->unsignedBigInteger('validacao_documento_tipo_idtipo');
            $table->unsignedBigInteger('validacao_documento_iddocumento');
            $table->unsignedBigInteger('validacao_professor_idprofessor');
            $table->timestamps();

            $table->foreign('aluno_idaluno')->references('idaluno')->on('aluno');
            $table->foreign([
                'validacao_documento_tipo_idtipo',
                'validacao_documento_iddocumento',
                'validacao_professor_idprofessor',
            ])->references([
                'documento_tipo_idtipo',
                'documento_iddocumento',
                'professor_idprofessor',
            ])->on('validacao');
        });

        Schema::create('modelos', function (Blueprint $table) {
            $table->id('idmodelo');
            $table->string('nome', 100);
            $table->text('descricao')->nullable();
            $table->unsignedBigInteger('professor_idprofessor');
            $table->unsignedBigInteger('tipo_idtipo')->unique();
            $table->string('caminho_arquivo', 255)->nullable();
            $table->timestamps();

            $table->foreign('professor_idprofessor')->references('idprofessor')->on('professor');
            $table->foreign('tipo_idtipo')->references('idtipo')->on('tipo');
        });

        Schema::create('prazo_aluno', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('aluno_idaluno');
            $table->unsignedBigInteger('tipo_idtipo');
            $table->date('dataLimite');
            $table->timestamps();

            $table->unique(['aluno_idaluno', 'tipo_idtipo']);
            $table->foreign('aluno_idaluno')->references('idaluno')->on('aluno');
            $table->foreign('tipo_idtipo')->references('idtipo')->on('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prazo_aluno');
        Schema::dropIfExists('modelos');
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('validacao');
        Schema::dropIfExists('documento');
    }
};
