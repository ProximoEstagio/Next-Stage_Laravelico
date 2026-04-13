<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Status fixos
        DB::table('status')->insertOrIgnore([
            ['cod_status' => 1, 'nomeStatus' => 'Validado',     'descricao' => 'Documento validado pelo professor'],
            ['cod_status' => 2, 'nomeStatus' => 'Invalidado',   'descricao' => 'Documento invalidado pelo professor'],
            ['cod_status' => 3, 'nomeStatus' => 'Visualizado',  'descricao' => 'Documento visualizado mas não avaliado'],
            ['cod_status' => 4, 'nomeStatus' => 'Não Avaliado', 'descricao' => 'Documento ainda não foi visualizado'],
        ]);

        // Tipos de documento
        DB::table('tipo')->insertOrIgnore([
            ['idtipo' => 1, 'nome' => 'A', 'descricao' => 'Documento Inicial',       'ativo' => 1, 'ordem' => 1, 'intervalo_dias' => null],
            ['idtipo' => 2, 'nome' => 'B', 'descricao' => 'Documento Intermediário', 'ativo' => 1, 'ordem' => 2, 'intervalo_dias' => 60],
            ['idtipo' => 3, 'nome' => 'C', 'descricao' => 'Documento Final',         'ativo' => 1, 'ordem' => 3, 'intervalo_dias' => 14],
        ]);

        // Professores
        DB::table('professor')->insertOrIgnore([
            [
                'idprofessor' => 1,
                'nome'        => 'Admin Teste',
                'registro'    => '1234567890123',
                'email'       => 'admin@admin.com',
                'senha'       => Hash::make('admin'),
                'nivel'       => 'admin',
            ],
            [
                'idprofessor' => 2,
                'nome'        => 'Professor Responsavel',
                'registro'    => '0000000000000',
                'email'       => 'professor@gmail.com',
                'senha'       => Hash::make('123456'),
                'nivel'       => 'professor',
            ],
        ]);

        // Cursos
        DB::table('curso')->insertOrIgnore([
            ['idcurso' => 1, 'nomeCurso' => 'DSM', 'professor_idprofessor1' => 2, 'ativo' => 1],
            ['idcurso' => 2, 'nomeCurso' => 'GTI', 'professor_idprofessor1' => 1, 'ativo' => 1],
        ]);

        // Aluno de exemplo
        DB::table('aluno')->insertOrIgnore([
            [
                'idaluno'       => 1,
                'nome'          => 'Aluno Exemplo',
                'ra'            => '1234567890123',
                'email'         => 'teste@gmail.com',
                'Curso_idcurso' => 1,
                'semestre'      => 2,
                'senha'         => Hash::make('teste123'),
                'concluido'     => 0,
            ],
        ]);

        // Secretaria
        DB::table('secretaria')->insertOrIgnore([
            [
                'idsecretaria' => 1,
                'nome'         => 'Secretaria Teste',
                'email'        => 'secretaria@teste.com',
                'senha'        => Hash::make('123456'),
            ],
        ]);
    }
}
