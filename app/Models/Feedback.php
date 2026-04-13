<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $table      = 'feedback';
    protected $primaryKey = 'idfeedback';
    protected $fillable   = [
        'descricao', 'aluno_idaluno',
        'validacao_documento_tipo_idtipo',
        'validacao_documento_iddocumento',
        'validacao_professor_idprofessor',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'aluno_idaluno', 'idaluno');
    }
}
