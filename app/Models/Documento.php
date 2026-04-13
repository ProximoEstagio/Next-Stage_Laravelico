<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    protected $table    = 'documento';
    protected $primaryKey = 'iddocumento';
    protected $fillable = [
        'dataEmissao', 'descricao', 'aluno_idaluno', 'tipo_idtipo', 'caminho_arquivo',
    ];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class, 'aluno_idaluno', 'idaluno');
    }

    public function tipo()
    {
        return $this->belongsTo(Tipo::class, 'tipo_idtipo', 'idtipo');
    }

    public function validacao()
    {
        return $this->hasOne(Validacao::class, 'documento_iddocumento', 'iddocumento');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'validacao_documento_iddocumento', 'iddocumento');
    }
}
