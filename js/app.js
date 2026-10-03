// Hevelius - caricamento asincrono del codice dell'app.
// Scarica le parti dell'applicazione in ordine, le unisce, le esegue
// e poi segnala alla pagina che il caricamento e' completato.
// Se una parte non si carica, mostra un avviso al posto della pagina vuota.
(function () {
  'use strict';

  var PARTS = [
    'js/app.part1.js',
    'js/app.part2.js',
    'js/app.part3.js',
    'js/app.part4.js',
    'js/app.part5.js',
    'js/app.part6.js'
  ];
  var MSG = 'Errore nel caricamento: controlla la connessione e ricarica la pagina.';

  function showError() {
    var el = document.getElementById('app-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-error';
      el.className = 'notice error';
      el.setAttribute('role', 'alert');
      el.style.margin = '1rem 0';
      document.body.insertBefore(el, document.body.firstChild);
    }
    el.textContent = MSG;
  }

  function run(code) {
    try {
      var s = document.createElement('script');
      s.text = code + '\n;document.dispatchEvent(new Event("DOMContentLoaded"));';
      document.head.appendChild(s);
    } catch (e) {
      showError();
    }
  }

  function step(i, code) {
    if (i >= PARTS.length) {
      run(code);
      return;
    }
    fetch(PARTS[i], { cache: 'default' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' su ' + PARTS[i]);
      return r.text();
    }).then(function (t) {
      step(i + 1, code + t);
    }).catch(function () {
      showError();
    });
  }

  step(0, '');
})();
