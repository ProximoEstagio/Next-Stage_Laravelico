<?php

use Illuminate\Support\Facades\Route;

// Rota raiz — redireciona para o front-end dentro de public/
Route::get('/', function () {
    return redirect('/Front-End/index.html');
});
