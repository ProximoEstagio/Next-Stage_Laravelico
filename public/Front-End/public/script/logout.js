/**
 * logout.js — Logout via API Laravel
 */
async function logout() {
  const token       = localStorage.getItem('token');
  const tipoUsuario = localStorage.getItem('tipoUsuario');
  const email       = localStorage.getItem('emailUser');

  try {
    await fetch(window.API + '/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, tipoUsuario, email }),
    });
  } catch (e) {
    console.error('Erro ao fazer logout:', e);
  } finally {
    localStorage.clear();
    window.location.replace(window.BASE + '/Front-End/index.html');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout')?.addEventListener('click', logout);
});
