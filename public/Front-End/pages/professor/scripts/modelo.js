/**
 * modelo.js — Professor: visualizar modelos cadastrados (API Laravel)
 */
document.addEventListener('DOMContentLoaded', async () => {
    const descricoesPadrao = {
        A: 'Esse termo deve conter dados do aluno, da empresa, do supervisor direto e a data de início das atividades.',
        B: 'O aluno descreve as atividades realizadas e as relaciona com o conteúdo do curso.',
        C: 'Declaração de Atividades, que formaliza o encerramento das atividades desenvolvidas durante o período.',
    };

    try {
        const data = await Api.get('/professor/modelos');
        if (!data?.success) return;

        ['A', 'B', 'C'].forEach(tipo => {
            const modelo = data.modelos?.[tipo];

            // Descrição
            const descEl = document.getElementById('desc-modelo-' + tipo);
            if (descEl) {
                descEl.textContent = modelo?.descricao || descricoesPadrao[tipo];
            }

            // Link de visualização
            const linkEl = document.getElementById('link-modelo-' + tipo);
            if (linkEl) {
                if (modelo?.caminho) {
                    linkEl.href         = `${window.BASE}/storage/${modelo.caminho}`;
                    linkEl.target       = '_blank';
                    linkEl.style.display = 'inline';
                } else {
                    linkEl.style.display = 'none';
                }
            }
        });
    } catch (e) {
        console.error('Erro ao carregar modelos:', e);
    }
});
