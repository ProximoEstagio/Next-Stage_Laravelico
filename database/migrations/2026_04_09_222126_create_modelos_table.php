<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('modelos');
    }
};