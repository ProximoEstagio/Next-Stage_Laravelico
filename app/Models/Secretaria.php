<?php namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Secretaria extends Model
{
    protected $table      = 'secretaria';
    protected $primaryKey = 'idsecretaria';
    protected $fillable   = ['nome', 'email', 'senha', 'telefone', 'foto', 'token'];
    protected $hidden     = ['senha', 'token'];
}
