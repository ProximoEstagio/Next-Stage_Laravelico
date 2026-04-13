/**
 * admin.js — Painel Admin (API Laravel)
 */
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('nivel') !== 'admin') {
        window.location.replace('alunos.html');
        return;
    }

    carregarTipos();
    carregarProfessores();
    carregarCursos();

    document.getElementById('btn-criar-tipo').addEventListener('click', criarTipo);
    document.getElementById('btn-novo-professor').addEventListener('click', abrirPopupProfessor);
    document.getElementById('btn-novo-curso').addEventListener('click', abrirPopupCurso);
});

// ── Tipos ─────────────────────────────────────────────────────────────────────

async function carregarTipos() {
    const data = await Api.get('/admin/tipos');
    const lista = document.getElementById('lista-tipos');
    lista.innerHTML = (data || []).map(tipo => `
        <div class="rw g16 jc-sb">
            <div class="rw g8" style="width:auto">
                <span class="icon-list ${tipo.ativo ? 'check' : 'off'}"></span>
                <p class="fs16"><b>Tipo ${tipo.nome}</b> — ordem ${tipo.ordem}</p>
            </div>
            <button class="btn-link fc" onclick="toggleTipo(${tipo.idtipo})">
                ${tipo.ativo ? 'Desativar' : 'Ativar'}
            </button>
        </div>`).join('');
}

async function criarTipo() {
    const nome = document.getElementById('input-novo-tipo').value.trim();
    if (!nome) { alert('Digite o nome do tipo.'); return; }

    const data = await Api.post('/admin/tipos', { action: 'criar', nome });
    if (data?.ok) {
        document.getElementById('input-novo-tipo').value = '';
        carregarTipos();
    } else {
        alert(data?.erro || 'Erro ao criar tipo.');
    }
}

async function toggleTipo(tipoId) {
    const data = await Api.post('/admin/tipos', { action: 'toggleAtivo', tipo_id: tipoId });
    if (data?.ok) carregarTipos();
}

// ── Professores ───────────────────────────────────────────────────────────────

async function carregarProfessores() {
    const data  = await Api.get('/admin/professores');
    const lista = document.getElementById('lista-professores');

    if (!Array.isArray(data) || !data.length) {
        lista.innerHTML = '<p>Nenhum professor cadastrado.</p>';
        return;
    }

    lista.innerHTML = data.map(p => `
        <div class="rw g16 jc-sb">
            <div class="cl g4">
                <p class="fs16"><b>${p.nome}</b>
                    <span style="font-size:12px;color:${p.nivel === 'admin' ? 'var(--vermelho)' : 'var(--cinza-claro)'}">
                        [${p.nivel}]
                    </span>
                </p>
                <p>${p.email}</p>
                <p>${p.nomeCurso ? 'Curso: ' + p.nomeCurso : 'Sem curso vinculado'}</p>
            </div>
        </div>`).join('');
}

async function abrirPopupProfessor() {
    const cursos = await Api.get('/admin/cursos');
    const popup  = document.getElementById('popup-layer');

    popup.innerHTML = `
        <div class="popup slim container">
            <div class="topV rw jc-sb">
                <p class="TopTxt">Cadastrar Professor</p>
                <span id="close-popup" class="icon closeW"></span>
            </div>
            <div class="cl p16 g16">
                <input id="prof-nome"     placeholder="Nome"     type="text">
                <input id="prof-email"    placeholder="Email"    type="email">
                <input id="prof-senha"    placeholder="Senha"    type="password">
                <input id="prof-telefone" placeholder="Telefone" type="text">
                <select id="prof-nivel">
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                </select>
                <select id="prof-curso">
                    <option value="">Sem curso vinculado</option>
                    ${(cursos || []).map(c => `<option value="${c.idcurso}">${c.nomeCurso}</option>`).join('')}
                </select>
                <button id="btn-salvar-professor" class="btn-V">Salvar</button>
            </div>
        </div>`;

    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('close-popup').addEventListener('click', fecharPopup);
    document.getElementById('btn-salvar-professor').addEventListener('click', salvarProfessor);
}

async function salvarProfessor() {
    const nome     = document.getElementById('prof-nome').value.trim();
    const email    = document.getElementById('prof-email').value.trim();
    const senha    = document.getElementById('prof-senha').value.trim();
    const telefone = document.getElementById('prof-telefone').value.trim();
    const nivel    = document.getElementById('prof-nivel').value;
    const cursoId  = document.getElementById('prof-curso').value || null;

    if (!nome || !email || !senha) { alert('Nome, email e senha são obrigatórios.'); return; }

    const data = await Api.post('/admin/professores', { nome, email, senha, telefone, nivel, curso_id: cursoId });
    if (data?.ok) {
        alert('Professor cadastrado com sucesso!');
        fecharPopup();
        carregarProfessores();
        carregarCursos();
    } else {
        alert(data?.erro || 'Erro ao cadastrar.');
    }
}

// ── Cursos ────────────────────────────────────────────────────────────────────

async function carregarCursos() {
    const data  = await Api.get('/admin/cursos');
    const lista = document.getElementById('lista-cursos');

    if (!Array.isArray(data) || !data.length) {
        lista.innerHTML = '<p>Nenhum curso cadastrado.</p>';
        return;
    }

    lista.innerHTML = data.map(c => `
        <div class="container cl" style="border:none;box-shadow:none;">
            <div class="rw g16 jc-sb">
                <div class="cl g4">
                    <p class="fs16"><b>${c.nomeCurso}</b></p>
                    <p>${c.nomeProfessor ? 'Professor: ' + c.nomeProfessor : 'Sem professor vinculado'}</p>
                </div>
                <button class="btn-link fc" onclick="abrirPopupReatribuir(${c.idcurso}, '${c.nomeCurso}')">
                    Reatribuir Professor
                </button>
            </div>
        </div>`).join('');
}

async function abrirPopupCurso() {
    const professores = await Api.get('/admin/professores');
    const semCurso    = (professores || []).filter(p => !p.idcurso);
    const popup       = document.getElementById('popup-layer');

    popup.innerHTML = `
        <div class="popup slim container">
            <div class="topV rw jc-sb">
                <p class="TopTxt">Criar Novo Curso</p>
                <span id="close-popup" class="icon closeW"></span>
            </div>
            <div class="cl p16 g16">
                <input id="curso-nome" placeholder="Nome do Curso" type="text">
                <select id="curso-professor">
                    <option value="">Selecione um professor responsável</option>
                    ${semCurso.map(p => `<option value="${p.idprofessor}">${p.nome}</option>`).join('')}
                </select>
                ${!semCurso.length ? '<p style="color:var(--vermelho);font-size:12px">Todos os professores já estão vinculados.</p>' : ''}
                <button id="btn-salvar-curso" class="btn-V">Criar Curso</button>
            </div>
        </div>`;

    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('close-popup').addEventListener('click', fecharPopup);
    document.getElementById('btn-salvar-curso').addEventListener('click', salvarCurso);
}

async function salvarCurso() {
    const nomeCurso   = document.getElementById('curso-nome').value.trim();
    const professorId = document.getElementById('curso-professor').value;

    if (!nomeCurso)   { alert('Digite o nome do curso.'); return; }
    if (!professorId) { alert('Selecione um professor.'); return; }

    const data = await Api.post('/admin/cursos', { nomeCurso, professor_id: professorId });
    if (data?.ok) {
        alert('Curso criado com sucesso!');
        fecharPopup();
        carregarCursos();
        carregarProfessores();
    } else {
        alert(data?.erro || 'Erro ao criar curso.');
    }
}

async function abrirPopupReatribuir(cursoId, nomeCurso) {
    const professores = await Api.get('/admin/professores');
    const popup       = document.getElementById('popup-layer');

    popup.innerHTML = `
        <div class="popup slim container">
            <div class="topV rw jc-sb">
                <p class="TopTxt">Reatribuir Professor — ${nomeCurso}</p>
                <span id="close-popup" class="icon closeW"></span>
            </div>
            <div class="cl p16 g16">
                <select id="reatribuir-professor">
                    <option value="">Selecione o novo professor</option>
                    ${(professores || []).map(p => `
                        <option value="${p.idprofessor}">
                            ${p.nome} ${p.nomeCurso ? '(em ' + p.nomeCurso + ')' : ''}
                        </option>`).join('')}
                </select>
                <button id="btn-salvar-reatribuir" class="btn-V">Salvar</button>
            </div>
        </div>`;

    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('close-popup').addEventListener('click', fecharPopup);
    document.getElementById('btn-salvar-reatribuir').addEventListener('click', async () => {
        const professorId = document.getElementById('reatribuir-professor').value;
        if (!professorId) { alert('Selecione um professor.'); return; }

        const data = await Api.post('/admin/cursos/atualizar', { curso_id: cursoId, professor_id: professorId });
        if (data?.ok) {
            alert('Professor reatribuído com sucesso!');
            fecharPopup();
            carregarCursos();
            carregarProfessores();
        } else {
            alert(data?.erro || 'Erro ao reatribuir.');
        }
    });
}

function fecharPopup() {
    const popup = document.getElementById('popup-layer');
    popup.classList.remove('active');
    document.body.style.overflow = 'auto';
}
