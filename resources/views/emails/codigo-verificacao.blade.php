<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Código de verificação</title>
</head>
<body style="margin:0;padding:24px;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
        <tr>
            <td>
                <h2 style="margin:0 0 16px;color:#b91c1c;">{{ config('app.name') }}</h2>

                <p>Olá, <strong>{{ $nome }}</strong>!</p>

                <p>Use o código abaixo para concluir seu login:</p>

                <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;background:#f4f4f7;border-radius:8px;padding:16px;margin:16px 0;">
                    {{ $codigo }}
                </p>

                <p>O código expira em <strong>{{ $minutosValidade }} minutos</strong> e só pode ser usado uma vez.</p>

                <p style="color:#b91c1c;">
                    Se você não tentou entrar, ignore este e-mail e troque sua senha.
                    Nunca compartilhe este código com ninguém.
                </p>

                <p style="font-size:12px;color:#888;margin-top:24px;">
                    Esta é uma mensagem automática, por favor não responda.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
