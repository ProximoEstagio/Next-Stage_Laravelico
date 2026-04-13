/**
 * popupCadastro.js — Cadastro manual de aluno (API Laravel)
 */
document.addEventListener('DOMContentLoaded', async function () {
    const nivel        = localStorage.getItem('nivel');
    const popupElement = document.querySelector('#popup-layer');
    if (!popupElement) return;

    let selectCursoHtml = '';
    if (nivel === 'admin') {
        const cursos = await Api.get('/admin/cursos');
        selectCursoHtml = `
            <select id="input-curso">
                <option value="">Selecione o curso</option>
                ${(cursos || []).map(c => `<option value="${c.idcurso}">${c.nomeCurso}</option>`).join('')}
            </select>`;
    }

    popupElement.innerHTML = `
        <div class="popup slim container">
            <div class="topV rw jc-sb">
                <div class="rw g16">
                    <span class="icon user-plus"></span>
                    <p class="TopTxt">Cadastrar Aluno Manualmente</p>
                </div>
                <span id="close-popup" class="icon closeW"></span>
            </div>
            <div class="cl p16 g16 jc-sb">
                <div class="filter-inputs">
                    <input id="input-nome"     placeholder="Nome"     type="text">
                    <input id="input-ra"       placeholder="R.A. (13 dígitos)" type="number" maxlength="13">
                    <input id="input-email"    placeholder="Email"    type="email">
                    <input id="input-semestre" placeholder="Semestre" type="number" min="1" max="6">
                    ${selectCursoHtml}
                </div>
                <button id="btn-cadastrar-aluno" class="btn-V">Cadastrar</button>
            </div>
        </div>`;

    // Abre / fecha
    document.querySelectorAll('#open-popup').forEach(btn => {
        btn.addEventListener('click', () => popupElement.classList.toggle('active'));
    });
    document.querySelector('#close-popup').onclick = () => popupElement.classList.remove('active');

    // Cadastrar
    document.querySelector('#btn-cadastrar-aluno').addEventListener('click', async () => {
        const nome     = document.querySelector('#input-nome')?.value.trim();
        const ra       = document.querySelector('#input-ra')?.value.trim();
        const email    = document.querySelector('#input-email')?.value.trim();
        const semestre = document.querySelector('#input-semestre')?.value.trim();
        const cursoId  = document.querySelector('#input-curso')?.value || null;

        if (!nome || !ra || !email || !semestre) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (!/^\d{13}$/.test(ra)) {
            alert('O RA deve conter exatamente 13 números.');
            return;
        }
        if (nivel === 'admin' && !cursoId) {
            alert('Selecione o curso do aluno.');
            return;
        }

        const professorId = localStorage.getItem('idprofessor');
        const body = { nome, ra, email, semestre, professor_id: professorId };
        if (cursoId) body.curso_id = cursoId;

        const data = await Api.post('/professor/aluno/criar', body);

        if (data?.message) {
            alert('Aluno cadastrado com sucesso!');
            popupElement.classList.remove('active');
            ['#input-nome', '#input-ra', '#input-email', '#input-semestre'].forEach(sel => {
                const el = document.querySelector(sel);
                if (el) el.value = '';
            });
            if (typeof carregarAlunos === 'function') carregarAlunos();
        } else {
            alert('Erro ao cadastrar: ' + (data?.error || 'Erro desconhecido'));
        }
    });
});
