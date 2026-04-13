<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class AlunoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome'          => $this->faker->name(),
            'ra'            => $this->faker->numerify('1############'),
            'email'         => $this->faker->unique()->safeEmail(),
            'senha'         => Hash::make('senha123'),
            'Curso_idcurso' => 1,
            'semestre'      => $this->faker->numberBetween(1, 6),
            'concluido'     => false,
        ];
    }
}
