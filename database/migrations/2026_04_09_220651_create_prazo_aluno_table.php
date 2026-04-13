<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }
};