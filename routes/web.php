<?php

use Illuminate\Support\Facades\Route;

// Rota raiz — redireciona para o front-end dentro de public/
Route::get('/', function () {
    return redirect('/Front-End/index.html');
});

use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\File;

Route::get('/arquivo/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!File::exists($fullPath)) {
        abort(404);
    }

    return Response::file($fullPath);
})->where('path', '.*');

