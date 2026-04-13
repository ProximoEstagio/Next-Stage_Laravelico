<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professor extends Model
{
    protected $table      = 'professor';
    protected $primaryKey = 'idprofessor';

    protected $fillable = [
        'nome', 'registro', 'email', 'senha',
        'telefone', 'foto', 'nivel', 'token',
    ];

    protected $hidden = ['senha', 'token'];

    public function curso()
    {
        return $this->hasOne(Curso::class, 'professor_idprofessor1', 'idprofessor');
    }

    public function validacoes()
    {
        return $this->hasMany(Validacao::class, 'professor_idprofessor', 'idprofessor');
    }

    public function modelos()
    {
        return $this->hasMany(Modelo::class, 'professor_idprofessor', 'idprofessor');
    }
}
