<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Novo documento enviado</title>
</head>
<body style="margin:0;padding:24px;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
        <tr>
            <td>
                <h2 style="margin:0 0 16px;color:#b91c1c;">{{ config('app.name') }}</h2>

                <p>Olá, <strong>{{ $nomeProfessor }}</strong>!</p>

                <p>O aluno <strong>{{ $nomeAluno }}</strong> (RA {{ $raAluno }}) enviou um novo documento para avaliação.</p>

                <table cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr>
                        <td style="border-bottom:1px solid #eee;color:#666;width:140px;">Tipo</td>
                        <td style="border-bottom:1px solid #eee;"><strong>{{ $tipoDocumento }}</strong></td>
                    </tr>
                    <tr>
                        <td style="border-bottom:1px solid #eee;color:#666;">Descrição</td>
                        <td style="border-bottom:1px solid #eee;">{{ $descricao }}</td>
                    </tr>
                    <tr>
                        <td style="color:#666;">Enviado em</td>
                        <td>{{ $dataEnvio }}</td>
                    </tr>
                </table>

                <p>Acesse o sistema para visualizar e avaliar o documento.</p>

                <p style="font-size:12px;color:#888;margin-top:24px;">
                    Esta é uma mensagem automática, por favor não responda.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
