<?php

return [
    'required'  => 'O campo :attribute é obrigatório.',
    'email'     => 'O campo :attribute deve ser um e-mail válido.',
    'min'       => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
    ],
    'max'       => [
        'string' => 'O campo :attribute não pode ter mais de :max caracteres.',
    ],
    'unique'    => 'Este :attribute já está cadastrado.',
    'exists'    => 'O :attribute selecionado é inválido.',
    'integer'   => 'O campo :attribute deve ser um número inteiro.',
    'boolean'   => 'O campo :attribute deve ser verdadeiro ou falso.',
    'regex'     => 'O formato do campo :attribute é inválido.',
    'mimes'     => 'O campo :attribute deve ser um arquivo do tipo: :values.',
    'file'      => 'O campo :attribute deve ser um arquivo.',
    'numeric'   => 'O campo :attribute deve ser um número.',
    'string'    => 'O campo :attribute deve ser uma string.',
    'date'      => 'O campo :attribute não é uma data válida.',

    'attributes' => [
        'email'     => 'e-mail',
        'senha'     => 'senha',
        'nome'      => 'nome',
        'ra'        => 'R.A.',
        'semestre'  => 'semestre',
        'arquivo'   => 'arquivo',
        'foto'      => 'foto',
        'aluno_id'  => 'aluno',
        'tipo_id'   => 'tipo',
        'curso_id'  => 'curso',
    ],
];
