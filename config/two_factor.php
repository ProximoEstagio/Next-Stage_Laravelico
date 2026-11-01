<?php

return [

    /*
    | Liga/desliga o 2FA por e-mail no login (todos os perfis).
    | Se o e-mail estiver fora do ar em desenvolvimento, use TWO_FACTOR_ENABLED=false.
    */
    'enabled' => env('TWO_FACTOR_ENABLED', true),

    // Validade do código, em minutos
    'ttl_minutes' => 10,

    // Tentativas incorretas permitidas por desafio antes de exigir novo login
    'max_attempts' => 5,

    // Quantos reenvios de código são permitidos por desafio
    'max_resends' => 3,

    // Intervalo mínimo entre envios, em segundos
    'resend_cooldown_seconds' => 60,
];
