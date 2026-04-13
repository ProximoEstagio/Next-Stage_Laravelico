<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Validacao extends Model
{
    protected $table   = 'validacao';
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = [
        'professor_idprofessor',
        'documento_iddocumento',
        'documento_tipo_idtipo',
        'status_cod_status',
    ];

    public function status()
    {
        return $this->belongsTo(Status::class, 'status_cod_status', 'cod_status');
    }

    public function professor()
    {
        return $this->belongsTo(Professor::class, 'professor_idprofessor', 'idprofessor');
    }

    public function documento()
    {
        return $this->belongsTo(Documento::class, 'documento_iddocumento', 'iddocumento');
    }
}
