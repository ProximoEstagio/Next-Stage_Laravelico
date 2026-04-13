<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    protected $table      = 'aluno';
    protected $primaryKey = 'idaluno';

    protected $fillable = [
        'nome', 'ra', 'email', 'senha',
        'Curso_idcurso', 'semestre',
        'telefone', 'foto', 'token', 'concluido',
    ];

    protected $hidden = ['senha', 'token'];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'Curso_idcurso', 'idcurso');
    }

    public function documentos()
    {
        return $this->hasMany(Documento::class, 'aluno_idaluno', 'idaluno');
    }

    public function prazos()
    {
        return $this->hasMany(PrazoAluno::class, 'aluno_idaluno', 'idaluno');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'aluno_idaluno', 'idaluno');
    }
}
