(function () {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "nextstage.local";

  window.API = isLocal
    ? window.location.origin + "/api"
    : "https://seu-dominio.com/api";
  window.BASE = isLocal ? window.location.origin : "https://seu-dominio.com";

  console.log("[config] API:", window.API);
  console.log("[config] BASE:", window.BASE);
})();
