(function () {
  'use strict';
  var P = ['js/app.part1a_01.js', 'js/app.part1a_02.js', 'js/app.part1b_01.js', 'js/app.part1b_02.js', 'js/app.part1c_01.js', 'js/app.part1c_02.js', 'js/app.part1d_01_01.js', 'js/app.part1d_01_02.js', 'js/app.part1d_02_01.js', 'js/app.part1d_02_02.js', 'js/app.part1e_01.js', 'js/app.part1e_02.js', 'js/app.part2a_01.js', 'js/app.part2a_02.js', 'js/app.part2b_01.js', 'js/app.part2b_02.js', 'js/app.part2c_01.js', 'js/app.part2c_02.js', 'js/app.part3a_01.js', 'js/app.part3a_02.js', 'js/app.part3b_01.js', 'js/app.part3b_02.js', 'js/app.part3c_01.js', 'js/app.part3c_02.js', 'js/app.part4_01.js', 'js/app.part4_02.js', 'js/app.part4_03.js', 'js/app.part4_04.js', 'js/app.part4_05.js', 'js/app.part4_06.js', 'js/app.part5_01.js', 'js/app.part5_02.js', 'js/app.part5_03.js', 'js/app.part5_04.js', 'js/app.part5_05.js', 'js/app.part5_06.js', 'js/app.part6_01.js', 'js/app.part6_02.js', 'js/app.part6_03.js', 'js/app.part6_04.js', 'js/app.part6_05.js'];
  var M = 'Errore nel caricamento: controlla la connessione e ricarica la pagina.';
  function err() {
    var el = document.getElementById('app-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-error';
      el.className = 'notice error';
      el.setAttribute('role', 'alert');
      el.style.margin = '1rem 0';
      document.body.insertBefore(el, document.body.firstChild);
    }
    el.textContent = M;
  }
  function run(c) {
    try {
      var s = document.createElement('script');
      s.text = c + '\n;document.dispatchEvent(new Event("DOMContentLoaded"));';
      document.head.appendChild(s);
    } catch (e) { err(); }
  }
  function step(i, c) {
    if (i >= P.length) { run(c); return; }
    fetch(P[i], { cache: 'default' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (t) { step(i + 1, c + t); }).catch(function () { err(); });
  }
  step(0, '');
})();
