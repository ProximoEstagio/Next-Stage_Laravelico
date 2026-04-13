<?php

return [
    'name'            => env('APP_NAME', 'Próximo Estágio'),
    'env'             => env('APP_ENV', 'production'),
    'debug'           => (bool) env('APP_DEBUG', false),
    'url'             => env('APP_URL', 'http://localhost'),
    'timezone'        => 'America/Sao_Paulo',
    'locale'          => 'pt_BR',
    'fallback_locale' => 'en',
    'faker_locale'    => 'pt_BR',
    'key'             => env('APP_KEY'),
    'cipher'          => 'AES-256-CBC',

    'providers' => \Illuminate\Support\ServiceProvider::defaultProviders()->merge([
        // App\Providers\AppServiceProvider::class,
    ])->toArray(),

    'aliases' => \Illuminate\Support\Facades\Facade::defaultAliases()->merge([
        //
    ])->toArray(),
];
