<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professor', function (Blueprint $table) {
            $table->id('idprofessor');
            $table->string('nome', 45);
            $table->char('registro', 13);
            $table->string('email', 80)->unique();
            $table->string('senha', 255);
            $table->char('telefone', 13)->nullable();
            $table->string('foto', 255)->nullable();
            $table->enum('nivel', ['professor', 'admin'])->default('professor');
            $table->char('token', 64)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professor');
    }
};
