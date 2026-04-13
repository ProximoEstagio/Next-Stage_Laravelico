<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table      = 'curso';
    protected $primaryKey = 'idcurso';
    protected $fillable   = ['nomeCurso', 'professor_idprofessor1', 'ativo'];

    public function professor()
    {
        return $this->belongsTo(Professor::class, 'professor_idprofessor1', 'idprofessor');
    }

    public function alunos()
    {
        return $this->hasMany(Aluno::class, 'Curso_idcurso', 'idcurso');
    }
}
