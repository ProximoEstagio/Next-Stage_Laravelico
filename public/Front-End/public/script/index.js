/**
 * index.js — Página de login (API Laravel) com 2FA por e-mail
 *
 * Fluxo: e-mail + senha -> (se o 2FA estiver ligado) código de 6 dígitos enviado por e-mail -> token.
 */
document.addEventListener('DOMContentLoaded', function () {
  // O index.html carrega este arquivo duas vezes; sem esta trava o login rodaria em dobro
  // (e, com 2FA, dois e-mails seriam enviados).
  if (window.__loginIniciado) return;
  window.__loginIniciado = true;

  const conteudo = document.getElementById('container');

  // Estado da segunda etapa (fica só em memória)
  let desafioAtual = null;
  let emailLogin   = '';
  let ocupado      = false;
  let timerReenvio = null;
  let acaoEnter    = null;

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

  const verificacao = `
    <p class="fs28">Verificação em duas etapas</p>
    <p>Enviamos um código de 6 dígitos para <strong id="emailMascarado"></strong>.
       Ele expira em <span id="minutosValidade"></span> minutos.</p>
    <div class="cl g16">
      <input type="text" id="codigo2fa" inputmode="numeric" autocomplete="one-time-code"
             maxlength="6" placeholder="000000" required>
    </div>
    <div class="rw jc-sb">
      <a href="#" id="linkReenviar">Reenviar código</a>
      <button id="btnVerificar" class="btn-V w28c">Verificar</button>
    </div>
    <a href="#login" id="linkVoltar">Voltar ao login</a>
  `;

  // ── Utilidades ─────────────────────────────────────────────────────────────
  async function postJson(endpoint, corpo) {
    const res  = await fetch(window.API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  function salvarSessao(data) {
    localStorage.setItem('token',        data.token);
    localStorage.setItem('tipoUsuario',  data.tipoUsuario);
    localStorage.setItem('nomeUser',     data.nome);
    localStorage.setItem('emailUser',    emailLogin);
    localStorage.setItem('idcurso',      data.idcurso      ?? '');
    localStorage.setItem('idprofessor',  data.idprofessor  ?? '');
    localStorage.setItem('idaluno',      data.idaluno      ?? '');
    localStorage.setItem('idsecretaria', data.idsecretaria ?? '');
    localStorage.setItem('nivel',        data.nivel        ?? '');

    window.location.replace(window.BASE + '/Front-End/' + data.page);
  }

  // ── Telas ──────────────────────────────────────────────────────────────────
  function mostrarLogin() {
    clearInterval(timerReenvio);
    desafioAtual = null;
    conteudo.innerHTML = login;
    document.getElementById('btnLogin').addEventListener('click', fazerLogin);
    acaoEnter = fazerLogin;
  }

  function mostrarVerificacao(dados) {
    desafioAtual = dados.desafio;
    conteudo.innerHTML = verificacao;

    // textContent: nunca injeta HTML vindo do servidor
    document.getElementById('emailMascarado').textContent  = dados.email_mascarado;
    document.getElementById('minutosValidade').textContent = Math.round(dados.expira_em / 60);

    const campo = document.getElementById('codigo2fa');
    campo.addEventListener('input', () => { campo.value = campo.value.replace(/\D/g, ''); });
    campo.focus();

    document.getElementById('btnVerificar').addEventListener('click', verificarCodigo);
    document.getElementById('linkReenviar').addEventListener('click', (e) => { e.preventDefault(); reenviarCodigo(); });
    document.getElementById('linkVoltar').addEventListener('click', (e) => { e.preventDefault(); mostrarLogin(); });

    acaoEnter = verificarCodigo;
    iniciarContagem(dados.reenvio_em || 60);
  }

  function iniciarContagem(segundos) {
    const link = document.getElementById('linkReenviar');
    clearInterval(timerReenvio);
    let restante = segundos;

    const atualizar = () => {
      if (!document.body.contains(link)) { clearInterval(timerReenvio); return; }
      if (restante > 0) {
        link.textContent = `Reenviar código (${restante}s)`;
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
        restante--;
      } else {
        link.textContent = 'Reenviar código';
        link.style.pointerEvents = '';
        link.style.opacity = '';
        clearInterval(timerReenvio);
      }
    };

    atualizar();
    timerReenvio = setInterval(atualizar, 1000);
  }

  // ── Ações ──────────────────────────────────────────────────────────────────
  async function fazerLogin() {
    if (ocupado) return;

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) { alert('Preencha email e senha.'); return; }

    ocupado = true;
    try {
      const { data } = await postJson('/login', { email, senha });
      emailLogin = email;

      if (data.requer2fa) {
        mostrarVerificacao(data);
      } else if (data.token) {
        salvarSessao(data);
      } else {
        alert(data.erro || 'Usuário ou senha inválidos');
      }
    } catch (e) {
      console.error('Erro na requisição:', e);
      alert('Erro ao conectar com o servidor.');
    } finally {
      ocupado = false;
    }
  }

  async function verificarCodigo() {
    if (ocupado || !desafioAtual) return;

    const codigo = document.getElementById('codigo2fa').value.trim();
    if (!/^\d{6}$/.test(codigo)) { alert('Digite o código de 6 dígitos.'); return; }

    ocupado = true;
    try {
      const { data } = await postJson('/2fa/verificar', { desafio: desafioAtual, codigo });

      if (data.token) {
        salvarSessao(data);
        return;
      }

      alert(data.erro || 'Não foi possível verificar o código.');

      if (data.expirado) {
        mostrarLogin();          // desafio expirou ou estourou as tentativas
      } else {
        const campo = document.getElementById('codigo2fa');
        campo.value = '';
        campo.focus();
      }
    } catch (e) {
      console.error('Erro na requisição:', e);
      alert('Erro ao conectar com o servidor.');
    } finally {
      ocupado = false;
    }
  }

  async function reenviarCodigo() {
    if (ocupado || !desafioAtual) return;

    ocupado = true;
    try {
      const { ok, data } = await postJson('/2fa/reenviar', { desafio: desafioAtual });

      if (ok) {
        iniciarContagem(data.reenvio_em || 60);
        alert('Enviamos um novo código para o seu e-mail.');
      } else {
        alert(data.erro || 'Não foi possível reenviar o código.');
        if (data.expirado) mostrarLogin();
        else if (data.aguarde) iniciarContagem(data.aguarde);
      }
    } catch (e) {
      console.error('Erro na requisição:', e);
      alert('Erro ao conectar com o servidor.');
    } finally {
      ocupado = false;
    }
  }

  // ── Inicialização ──────────────────────────────────────────────────────────
  // Um único listener de Enter (delegado) para a tela que estiver ativa
  conteudo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && acaoEnter) acaoEnter();
  });

  function pageload() {
    const page = window.location.hash || '#login';
    if (page === '#login') mostrarLogin();
  }

  window.addEventListener('hashchange', pageload);
  pageload();
});
