/**
 * modelo.js — Aluno: botões de baixar modelos (API Laravel)
 */
document.addEventListener('DOMContentLoaded', async () => {
    const descricoesPadrao = {
        A: 'Esse termo deve conter dados do aluno, da empresa, do supervisor direto e a data de início das atividades.',
        B: 'O aluno descreve as atividades realizadas e as relaciona com o conteúdo do curso.',
        C: 'Declaração de Atividades, que formaliza o encerramento das atividades desenvolvidas durante o período.',
    };

    // Botões de download
    ['A', 'B', 'C'].forEach(tipo => {
        const btn = document.getElementById('link-modelo-' + tipo);
        if (btn) {
            btn.addEventListener('click', () => {
                Api.download(
                    '/professor/modelos/baixar',
                    { tipo },
                    `Modelo_${tipo}.pdf`
                );
            });
        }
    });

    // Carrega descrições dinâmicas
    try {
        const data = await Api.get('/professor/modelos');
        if (!data?.success) return;

        ['A', 'B', 'C'].forEach(tipo => {
            const modelo = data.modelos?.[tipo];
            const descEl = document.getElementById('desc-modelo-' + tipo);
            if (descEl) {
                descEl.textContent = modelo?.descricao || descricoesPadrao[tipo];
            }
        });
    } catch (e) {
        console.error('Erro ao carregar descrições:', e);
    }
});
