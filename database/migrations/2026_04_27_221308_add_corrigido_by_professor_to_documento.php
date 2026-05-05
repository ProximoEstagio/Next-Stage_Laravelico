<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documento', function (Blueprint $table) {
            $table->boolean('corrigido_por_professor')->default(false)->after('caminho_arquivo');
        });
    }

    public function down(): void
    {
        Schema::table('documento', function (Blueprint $table) {
            $table->dropColumn('corrigido_por_professor');
        });
    }
};