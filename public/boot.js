// Scripts de démarrage, sortis de index.html : la politique de sécurité (CSP,
// vercel.json) interdit tout script inline, ce qui bloque la plupart des
// injections XSS.

// Écran de chargement : masqué une fois la page chargée (au plus tard 4,5 s).
(function () {
  var splash = document.getElementById('nfl-splash');
  var hideSplash = function () {
    if (splash) splash.classList.add('hidden');
    setTimeout(function () { if (splash && splash.parentNode) splash.parentNode.removeChild(splash); }, 700);
  };
  window.addEventListener('load', function () {
    setTimeout(hideSplash, 800);
  });
  setTimeout(hideSplash, 4500);
})();

// Service worker (PWA + notifications push admin).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(
      function (registration) {
        console.log('PWA ServiceWorker actif :', registration.scope);
      },
      function (err) {
        console.log('Erreur d\'enregistrement ServiceWorker PWA :', err);
      }
    );
  });
}
