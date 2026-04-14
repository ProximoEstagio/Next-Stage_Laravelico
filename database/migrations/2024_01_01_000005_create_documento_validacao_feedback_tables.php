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
            $table->foreign(
                [
                    'validacao_documento_tipo_idtipo',
                    'validacao_documento_iddocumento',
                    'validacao_professor_idprofessor'
                ],
                'fk_feedback_validacao' 
            )->references(
                [
                    'documento_tipo_idtipo',
                    'documento_iddocumento',
                    'professor_idprofessor'
                ]
            )->on('validacao');
        });

        

        
    }

    public function down(): void
    {
        
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('validacao');
        Schema::dropIfExists('documento');
    }
};
