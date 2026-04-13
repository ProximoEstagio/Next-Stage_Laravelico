/**
 * listaAlunos.js — Professor/Admin (API Laravel)
 */
const usersPerPage = 5;
let todosAlunos = [];

function getIconClass(status) {
    const map = { Validado: 'check', Invalidado: 'off', Visualizado: 'eye', 'Não Avaliado': 'clock', empty: 'empty' };
    return map[status] || 'empty';
}

function criarSkeletons(qtd) {
    const userList = document.getElementById('listAlunos');
    userList.innerHTML = '';
    for (let i = 0; i < qtd; i++) {
        const line = document.createElement('tr');
        line.innerHTML = `
            <td class="loading"></td>
            <td class="loading"></td>
            <td><div class="rw jc-sa">
                <span class="icon-list empty"></span>
                <span class="icon-list empty"></span>
                <span class="icon-list empty"></span>
            </div></td>
            <td><div class="container-icon"><span class="link-empty"></span></div></td>`;
        userList.appendChild(line);
    }
}

function renderizarLista(alunos, pagina) {
    const userList    = document.getElementById('listAlunos');
    const pagination  = document.getElementById('pagination');
    const totalPaginas = Math.ceil(alunos.length / usersPerPage);
    const start       = (pagina - 1) * usersPerPage;
    const alunosPagina = alunos.slice(start, start + usersPerPage);

    userList.innerHTML = '';

    if (!alunosPagina.length) {
        userList.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px">Nenhum aluno encontrado</td></tr>`;
        pagination.innerHTML = '';
        return;
    }

    alunosPagina.forEach(user => {
        const statusKeys = Object.keys(user).filter(k => k.startsWith('status_'));
        const icones = statusKeys.map(k => {
            const tipo = k.replace('status_', '');
            return `<span class="icon-list ${getIconClass(user[k])}" title="Documento ${tipo}: ${user[k]}"></span>`;
        }).join('');

        const line = document.createElement('tr');
        line.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.ra}</td>
            <td><div class="rw jc-sa">${icones}</div></td>
            <td><div class="container-icon">
                <a href="aluno.html?id=${user.idaluno}" target="_blank">
                    <span class="link-empty"></span>
                </a>
            </div></td>`;
        userList.appendChild(line);
    });

    // Paginação
    pagination.innerHTML = '';
    for (let i = 0; i < totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        if (i + 1 === pagina) btn.classList.add('active');
        btn.onclick = () => renderizarLista(alunos, i + 1);
        pagination.appendChild(btn);
    }
}

function aplicarFiltros() {
    const nome     = document.querySelector('input[placeholder="Nome"]')?.value.toLowerCase().trim() || '';
    const email    = document.querySelector('input[placeholder="email"]')?.value.toLowerCase().trim() || '';
    const semestre = document.querySelector('input[placeholder="Semestre"]')?.value.trim() || '';

    const filtrados = todosAlunos.filter(a =>
        (!nome     || a.nome.toLowerCase().includes(nome)) &&
        (!email    || a.email.toLowerCase().includes(email)) &&
        (!semestre || String(a.semestre) === semestre)
    );
    renderizarLista(filtrados, 1);
}

async function carregarAlunos(cursoId = null) {
    criarSkeletons(usersPerPage);

    const nivel       = localStorage.getItem('nivel') || 'professor';
    const professorId = localStorage.getItem('idprofessor') || '';

    const data = await Api.get('/professor/alunos', {
        nivel,
        professor_id: professorId,
        curso_id: cursoId || undefined,
    });

    if (!data || data.erro) { console.error(data?.erro); return; }

    todosAlunos = data;
    renderizarLista(todosAlunos, 1);

    document.querySelector('.btn-C')?.addEventListener('click', aplicarFiltros);
    document.querySelectorAll('.filter-inputs input').forEach(input => {
        input.addEventListener('input', aplicarFiltros);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const nivel = localStorage.getItem('nivel');
    if (nivel === 'admin') {
        await adicionarFiltroCurso();
    } else {
        await carregarAlunos();
    }
});

async function adicionarFiltroCurso() {
    const cursos = await Api.get('/admin/cursos');
    const content = document.querySelector('.content');

    const filtroDiv = document.createElement('div');
    filtroDiv.className = 'container cl';
    filtroDiv.innerHTML = `
        <div class="topC rw g16"><p class="TopTxt">Selecionar Curso</p></div>
        <div class="p16">
            <select id="select-curso">
                <option value="">Todos os cursos</option>
                ${(cursos || []).map(c => `<option value="${c.idcurso}">${c.nomeCurso}</option>`).join('')}
            </select>
        </div>`;

    content.insertBefore(filtroDiv, content.firstChild);

    document.getElementById('select-curso').addEventListener('change', e => {
        carregarAlunos(e.target.value || null);
    });

    await carregarAlunos();
}
