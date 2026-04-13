<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Modelo extends Model
{
    protected $table      = 'modelos';
    protected $primaryKey = 'idmodelo';
    protected $fillable   = ['nome', 'descricao', 'professor_idprofessor', 'tipo_idtipo', 'caminho_arquivo'];

    public function tipo()      { return $this->belongsTo(Tipo::class, 'tipo_idtipo', 'idtipo'); }
    public function professor() { return $this->belongsTo(Professor::class, 'professor_idprofessor', 'idprofessor'); }
}
