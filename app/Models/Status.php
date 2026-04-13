<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    public $timestamps    = false;
    protected $table      = 'status';
    protected $primaryKey = 'cod_status';
    protected $fillable   = ['nomeStatus', 'descricao'];
}
