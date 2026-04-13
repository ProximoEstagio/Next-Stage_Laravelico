<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secretaria', function (Blueprint $table) {
            $table->id('idsecretaria');
            $table->string('nome', 100);
            $table->string('email', 100)->unique();
            $table->string('senha', 255);
            $table->string('telefone', 20)->nullable();
            $table->string('foto', 255)->nullable();
            $table->string('token', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('tipo', function (Blueprint $table) {
            $table->id('idtipo');
            $table->string('nome', 45);
            $table->string('descricao', 45);
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->integer('intervalo_dias')->nullable();
            $table->timestamps();
        });

        Schema::create('status', function (Blueprint $table) {
            $table->id('cod_status');
            $table->string('nomeStatus', 20);
            $table->string('descricao', 200)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status');
        Schema::dropIfExists('tipo');
        Schema::dropIfExists('secretaria');
    }
};
