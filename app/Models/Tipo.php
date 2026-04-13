<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Tipo extends Model
{
    protected $table      = 'tipo';
    protected $primaryKey = 'idtipo';
    protected $fillable   = ['nome', 'descricao', 'ativo', 'ordem', 'intervalo_dias'];

    public function documentos()  { return $this->hasMany(Documento::class, 'tipo_idtipo', 'idtipo'); }
    public function modelo()      { return $this->hasOne(Modelo::class, 'tipo_idtipo', 'idtipo'); }
    public function prazos()      { return $this->hasMany(PrazoAluno::class, 'tipo_idtipo', 'idtipo'); }
}
