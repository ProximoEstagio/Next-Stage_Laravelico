<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacao extends Model
{
    protected $table      = 'notificacao';
    protected $primaryKey = 'idnotificacao';

    protected $fillable = [
        'destinatario_tipo', 'destinatario_id',
        'tipo', 'titulo', 'mensagem',
        'documento_id', 'lida_em',
    ];

    protected $casts = [
        'lida_em' => 'datetime',
    ];
}
