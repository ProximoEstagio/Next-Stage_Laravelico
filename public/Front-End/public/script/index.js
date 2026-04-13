/**
 * index.js — Página de login (atualizado para API Laravel)
 */
document.addEventListener('DOMContentLoaded', function () {
  const conteudo = document.getElementById('container');

  const login = `
    <p class="fs28">Faça seu Login</p>
    <div class="cl g16">
      <input type="email"    id="email" placeholder="Email"  required>
      <input type="password" id="senha" placeholder="Senha"  required>
    </div>
    <div class="rw jc-sb">
      <a href="#recuperar_senha">Esqueci minha senha</a>
      <button id="btnLogin" class="btn-V w28c">Logar</button>
    </div>
  `;

  async function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) { alert('Preencha email e senha.'); return; }

    try {
      const res  = await fetch(window.API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token',        data.token);
        localStorage.setItem('tipoUsuario',  data.tipoUsuario);
        localStorage.setItem('nomeUser',     data.nome);
        localStorage.setItem('emailUser',    email);
        localStorage.setItem('idcurso',      data.idcurso     ?? '');
        localStorage.setItem('idprofessor',  data.idprofessor ?? '');
        localStorage.setItem('idaluno',      data.idaluno     ?? '');
        localStorage.setItem('idsecretaria', data.idsecretaria ?? '');
        localStorage.setItem('nivel',        data.nivel       ?? '');

        window.location.replace(window.BASE + '/Front-End/' + data.page);
      } else {
        alert(data.erro || 'Usuário ou senha inválidos');
      }
    } catch (e) {
      console.error('Erro na requisição:', e);
      alert('Erro ao conectar com o servidor.');
    }
  }

  function pageload() {
    const page = window.location.hash || '#login';
    if (page === '#login') {
      conteudo.innerHTML = login;
      document.getElementById('btnLogin').addEventListener('click', fazerLogin);
      // Permite login com Enter
      conteudo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fazerLogin();
      });
    }
  }

  window.addEventListener('hashchange', pageload);
  pageload();
});
