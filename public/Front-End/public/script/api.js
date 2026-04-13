/**
 * api.js — Helper central de requisições para a API Laravel
 *
 * Inclua este script APÓS config.js em todas as páginas:
 *   <script src="../../public/script/config.js"></script>
 *   <script src="../../public/script/api.js"></script>
 */

const Api = (() => {
  // ── Cabeçalhos padrão com autenticação ─────────────────────────────────────
  function getHeaders(isFormData = false) {
    const headers = {
      'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
      'X-Tipo-Usuario': localStorage.getItem('tipoUsuario') || '',
    };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
  }

  // ── GET ────────────────────────────────────────────────────────────────────
  async function get(endpoint, params = {}) {
    const url = new URL(window.API + endpoint);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.append(k, v);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // ── POST JSON ──────────────────────────────────────────────────────────────
  async function post(endpoint, body = {}) {
    const res = await fetch(window.API + endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  }

  // ── POST FormData (uploads) ────────────────────────────────────────────────
  async function upload(endpoint, formData) {
    const res = await fetch(window.API + endpoint, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  }

  // ── Download (blob) ────────────────────────────────────────────────────────
  async function download(endpoint, params = {}, nomeArquivo = 'download') {
    const url = new URL(window.API + endpoint);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const res = await fetch(url.toString(), { headers: getHeaders() });

    if (!res.ok) throw new Error('Arquivo não encontrado');

    const blob = await res.blob();
    const link = document.createElement('a');
    link.href   = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
  }

  // ── Handler de resposta ────────────────────────────────────────────────────
  async function handleResponse(res) {
    const data = await res.json().catch(() => ({}));

    // Token inválido → redireciona para login
    if (res.status === 401) {
      localStorage.clear();
      window.location.replace(window.BASE + '/Front-End/index.html');
      return;
    }

    if (!res.ok) {
      console.error('[Api] erro:', data);
    }

    return data;
  }

  return { get, post, upload, download };
})();
