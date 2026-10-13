 la connessione e ricarica la pagina.';
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
