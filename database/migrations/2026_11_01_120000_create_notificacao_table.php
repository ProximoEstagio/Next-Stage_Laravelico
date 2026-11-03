<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificacao', function (Blueprint $table) {
            $table->id('idnotificacao');

            // Destinatário polimórfico simples: 'aluno' ou 'professor' + o id dele
            $table->string('destinatario_tipo', 20);
            $table->unsignedBigInteger('destinatario_id');

            $table->string('tipo', 40);          // ex.: documento_enviado, documento_validado...
            $table->string('titulo', 120);
            $table->string('mensagem', 500);
            $table->unsignedBigInteger('documento_id')->nullable();

            $table->timestamp('lida_em')->nullable();
            $table->timestamps();

            $table->index(
                ['destinatario_tipo', 'destinatario_id', 'lida_em'],
                'idx_notificacao_destinatario'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificacao');
    }
};
