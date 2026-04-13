<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PrazoAluno extends Model
{
    protected $table    = 'prazo_aluno';
    protected $fillable = ['aluno_idaluno', 'tipo_idtipo', 'dataLimite'];

    public function tipo()  { return $this->belongsTo(Tipo::class, 'tipo_idtipo', 'idtipo'); }
    public function aluno() { return $this->belongsTo(Aluno::class, 'aluno_idaluno', 'idaluno'); }
}
