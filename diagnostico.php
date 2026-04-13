<?php
/**
 * diagnostico.php — Roda na raiz do projeto: php diagnostico.php
 * Verifica tudo que precisa estar ok antes do php artisan serve
 */

$ok   = "\033[32m✓\033[0m";
$fail = "\033[31m✗\033[0m";
$warn = "\033[33m⚠\033[0m";

echo "\n=== Diagnóstico Next Stage Laravel ===\n\n";

// 1. PHP
$phpVersion = PHP_VERSION;
$phpOk = version_compare($phpVersion, '8.2.0', '>=');
echo ($phpOk ? $ok : $fail) . " PHP: $phpVersion" . (!$phpOk ? " (precisa >= 8.2)" : "") . "\n";

// 2. Extensões necessárias
$exts = ['pdo', 'pdo_mysql', 'mbstring', 'xml', 'curl', 'zip', 'fileinfo'];
foreach ($exts as $ext) {
    $loaded = extension_loaded($ext);
    echo ($loaded ? $ok : $fail) . " Extensão $ext" . (!$loaded ? " (FALTANDO)" : "") . "\n";
}

// 3. vendor/
$hasVendor = is_dir(__DIR__ . '/vendor');
echo ($hasVendor ? $ok : $fail) . " vendor/ " . (!$hasVendor ? "(rode: composer install)" : "") . "\n";

// 4. .env
$hasEnv = file_exists(__DIR__ . '/.env');
echo ($hasEnv ? $ok : $warn) . " .env " . (!$hasEnv ? "(rode: cp .env.example .env)" : "") . "\n";

if ($hasEnv) {
    $env = file_get_contents(__DIR__ . '/.env');

    // APP_KEY
    preg_match('/APP_KEY=(.*)/', $env, $m);
    $key = trim($m[1] ?? '');
    $hasKey = !empty($key) && $key !== '';
    echo ($hasKey ? $ok : $fail) . " APP_KEY " . (!$hasKey ? "(rode: php artisan key:generate)" : "") . "\n";

    // DB
    preg_match('/DB_DATABASE=(.*)/', $env, $m);
    $db = trim($m[1] ?? '');
    echo ($db ? $ok : $warn) . " DB_DATABASE: " . ($db ?: "(vazio)") . "\n";

    preg_match('/DB_PORT=(.*)/', $env, $m);
    $port = trim($m[1] ?? '3306');
    echo "$ok DB_PORT: $port\n";
}

// 5. storage/
$dirs = [
    'storage/framework/cache/data',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'storage/app/public',
    'bootstrap/cache',
];
foreach ($dirs as $dir) {
    $path    = __DIR__ . '/' . $dir;
    $exists  = is_dir($path);
    $writable = $exists && is_writable($path);
    if (!$exists) {
        echo "$fail $dir (não existe)\n";
    } elseif (!$writable) {
        echo "$fail $dir (sem permissão de escrita — rode: chmod -R 775 storage bootstrap/cache)\n";
    } else {
        echo "$ok $dir\n";
    }
}

// 6. public/storage link
$link = __DIR__ . '/public/storage';
if (is_link($link)) {
    echo "$ok public/storage (symlink ok)\n";
} elseif (is_dir($link)) {
    echo "$warn public/storage (pasta, não symlink — rode: php artisan storage:link)\n";
} else {
    echo "$warn public/storage (rode: php artisan storage:link)\n";
}

// 7. Testar conexão com banco
if ($hasEnv) {
    preg_match('/DB_HOST=(.*)/',     $env, $mh); $host = trim($mh[1] ?? '127.0.0.1');
    preg_match('/DB_PORT=(.*)/',     $env, $mp); $port = trim($mp[1] ?? '3306');
    preg_match('/DB_DATABASE=(.*)/', $env, $md); $db   = trim($md[1] ?? '');
    preg_match('/DB_USERNAME=(.*)/', $env, $mu); $user = trim($mu[1] ?? 'root');
    preg_match('/DB_PASSWORD=(.*)/', $env, $mw); $pass = trim($mw[1] ?? '');

    if ($db && extension_loaded('pdo_mysql')) {
        try {
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            echo "$ok Conexão MySQL: $host:$port/$db\n";

            // Verificar tabelas
            $tabelas = ['professor', 'aluno', 'curso', 'tipo', 'status', 'documento', 'validacao', 'secretaria'];
            $existentes = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            $faltando = array_diff($tabelas, $existentes);
            if (empty($faltando)) {
                echo "$ok Tabelas do banco: todas presentes\n";
            } else {
                echo "$fail Tabelas faltando: " . implode(', ', $faltando) . " (rode: php artisan migrate --seed)\n";
            }
        } catch (Exception $e) {
            echo "$fail Conexão MySQL falhou: " . $e->getMessage() . "\n";
            echo "  → Verifique DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD no .env\n";
        }
    } else {
        echo "$warn Pulando teste de banco (PDO MySQL não disponível ou DB_DATABASE vazio)\n";
    }
}

echo "\n=== Concluído ===\n\n";
