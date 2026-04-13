document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById('hamburguer');
  const menu = document.getElementById('nav-left');
  const perfil = document.getElementById('perfil');

  if (!hamburger || !menu || !perfil) return;

  const menuLinks = menu.querySelectorAll('a');

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('visible');
    perfil.classList.toggle('invisible');
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('visible');
      perfil.classList.remove('invisible');
    });
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
      perfil.classList.remove('invisible');
      menu.classList.remove('visible');
    }
  });
});