<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('curso', function (Blueprint $table) {
            $table->id('idcurso');
            $table->string('nomeCurso', 45);
            $table->unsignedBigInteger('professor_idprofessor1');
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->foreign('professor_idprofessor1')
                  ->references('idprofessor')
                  ->on('professor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curso');
    }
};
