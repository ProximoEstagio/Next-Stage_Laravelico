/**
 * requireLogin.js — Verifica autenticação via API Laravel
 * Inclua ANTES do defer dos outros scripts para bloquear acesso não autenticado.
 */

(async function () {
  const token       = localStorage.getItem('token');
  const tipoUsuario = localStorage.getItem('tipoUsuario');
  const LOGIN_URL   = window.BASE + '/Front-End/index.html';

  if (!token || !tipoUsuario) {
    window.location.replace(LOGIN_URL);
    return;
  }

  try {
    const res = await fetch(window.API + '/verificar-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, tipoUsuario }),
    });

    const data = await res.json();

    if (!data.valido) {
      localStorage.clear();
      window.location.replace(LOGIN_URL);
    }
  } catch (e) {
    console.error('Erro ao verificar token:', e);
    window.location.replace(LOGIN_URL);
  }
})();
