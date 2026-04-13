<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Proteção contra mass assignment em produção
        Model::preventSilentlyDiscardingAttributes($this->app->isLocal());
    }
}
