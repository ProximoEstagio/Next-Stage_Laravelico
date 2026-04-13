<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aluno', function (Blueprint $table) {
            $table->id('idaluno');
            $table->string('nome', 45);
            $table->char('ra', 13)->unique();
            $table->string('email', 80)->unique();
            $table->unsignedBigInteger('Curso_idcurso');
            $table->integer('semestre');
            $table->string('senha', 255);
            $table->char('token', 64)->nullable();
            $table->char('telefone', 13)->nullable();
            $table->string('foto', 255)->nullable();
            $table->boolean('concluido')->default(false);
            $table->timestamps();

            $table->foreign('Curso_idcurso')
                  ->references('idcurso')
                  ->on('curso');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aluno');
    }
};
