      '<select id="ed-select" aria-label="Stella da posizionare"></select>' +
      '<div class="ed-coords" id="ed-coords"></div>' +
      '<div class="ed-status" id="ed-status"></div>' +
      '</div>' +
      '<div class="ed-lens-wrap"><div class="ed-lens empty" id="ed-lens" aria-hidden="true"><span></span></div></div>' +
      '<div class="ed-row">' +
      '<button type="button" class="btn primary" id="ed-save">Salva punto</button>' +
      '<button type="button" class="btn" id="ed-copy">Copia tutto</button>' +
      '<button type="button" class="btn" id="ed-clear">Azzera</button>' +
      '</div>' +
      '<div class="ed-msg" id="ed-msg" role="status" aria-live="polite"></div>' +
      '<details class="ed-details"><summary>Regolazione fine e raggio</summary>' +
      '<div class="ed-row ed-nudge">' +
      '<button type="button" class="btn" data-nudge="-1,0" aria-label="Sinistra">\u25c0</button>' +
      '<button type="button" class="btn" data-nudge="0,-1" aria-label="Su">\u25b2</button>' +
      '<button type="button" class="btn" data-nudge="0,1" aria-label="Gi\u00f9">\u25bc</button>' +
      '<button type="button" class="btn" data-nudge="1,0" aria-label="Destra">\u25b6</button>' +
      '<button type="button" class="btn" id="ed-step" aria-label="Passo del mirino">passo 0,1</button>' +
      '<button type="button" class="btn" id="ed-rminus" aria-label="Raggio minore">r \u2212</button>' +
      '<button type="button" class="btn" id="ed-rplus" aria-label="Raggio maggiore">r +</button>' +
      '</div></details>' +
      '<div class="ed-fallback" id="ed-fallback" hidden><p>Copia non riuscita in automatico: tieni premuto sul testo, scegli \u201cSeleziona tutto\u201d e poi \u201cCopia\u201d.</p>' +
      '<textarea id="ed-ta" readonly rows="5" aria-label="Testo JSON da copiare"></textarea></div>' +
      '<details class="ed-details"><summary id="ed-count">Punti salvati: 0</summary><ul id="ed-list" class="ed-list"></ul></details>' +
      '</div>';
    var toolbar = $('.toolbar');
    if (toolbar) toolbar.insertAdjacentHTML('beforebegin', html);
    plate.insertAdjacentHTML('beforeend', '<div class="ed-layer" id="ed-layer"><div id="ed-dots"></div><div class="ed-ring" id="ed-ring" hidden></div><div class="ed-cross" id="ed-cross" hidden></div></div>');
    plate.classList.add('ed-plate');

    /* tap sulla tavola = posiziona il mirino (click non parte se il dito ha trascinato per scorrere) */
    plate.addEventListener('click', function (e) {
      var rc = plate.getBoundingClientRect();
      if (!rc.width || !rc.height) return;
      edSetPoint((e.clientX - rc.left) / rc.width * 100, (e.clientY - rc.top) / rc.height * 100);
    });
    $('#ed-select').addEventListener('change', function () { edSelect(this.value); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-nudge]'), function (b) {
      b.addEventListener('click', function () {
        if (!ed.cur) { edMsg('Prima tocca la tavola per posizionare il mirino.', true); return; }
        var d = b.getAttribute('data-nudge').split(',');
        edSetPoint(ed.cur.x + (+d[0]) * ed.step, ed.cur.y + (+d[1]) * ed.step);
      });
    });
    $('#ed-step').addEventListener('click', function () {
      ed.step = ed.step === 0.1 ? 0.5 : 0.1;
      this.textContent = 'passo ' + String(ed.step).replace('.', ',');
    });
    $('#ed-rminus').addEventListener('click', function () { ed.r = Math.max(0.3, ed1(ed.r - 0.1)); edRefresh(); });
    $('#ed-rplus').addEventListener('click', function () { ed.r = Math.min(5, ed1(ed.r + 0.1)); edRefresh(); });
    $('#ed-save').addEventListener('click', function () {
      if (!ed.sel) { edMsg('Scegli prima una stella dal menu.', true); return; }
      if (!ed.cur) { edMsg('Tocca la tavola per posizionare il mirino, poi salva.', true); return; }
      var o = edLoad(), l = Array.isArray(o[c.id]) ? o[c.id].slice() : [];
      var pt = { star_id: ed.sel, x_pct: ed.cur.x, y_pct: ed.cur.y, r_pct: ed.r };
      var i = l.map(function (p) { return p.star_id; }).indexOf(ed.sel);
      if (i >= 0) l[i] = pt; else l.push(pt);
      o[c.id] = l; edStore(o);
      edRefresh();
      edMsg('Salvato: ' + edName(ed.sel) + ' (' + edFmt(pt.x_pct) + '; ' + edFmt(pt.y_pct) + ').');
    });
    $('#ed-copy').addEventListener('click', function () {
      var p = edPayload();
      if (!Object.keys(p).length) { edMsg('Non c\u2019\u00e8 ancora nessun punto salvato da copiare.', true); return; }
      edCopy(JSON.stringify(p), function (ok, fb) {
        if (ok) edMsg('Copiato negli appunti (' + edTotal() + ' punti). Incollalo nella chat.');
        else edMsg(fb ? 'Seleziona il testo qui sotto e copialo a mano.' : 'Copia non riuscita.', !fb);
      });
    });
    $('#ed-clear').addEventListener('click', function () {
      var n = edTotal();
      if (!n) { edMsg('La lista \u00e8 gi\u00e0 vuota.'); return; }
      if (!window.confirm('Cancellare tutti i ' + n + ' punti salvati?')) return;
      edStore({}); $('#ed-fallback').hidden = true;
      edRefresh(); edMsg('Lista azzerata.');
    });
    $('#ed-list').addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var sid = t.getAttribute('data-star');
      if (!sid) return;
      if (t.classList.contains('ed-del')) {
        var o = edLoad();
        o[c.id] = edList(c.id).filter(function (p) { return p.star_id !== sid; });
        if (!o[c.id].length) delete o[c.id];
        edStore(o);
        if (ed.sel === sid) edSelect(sid, true); else edRefresh();
        edMsg('Rimosso: ' + edName(sid) + '.');
      } else if (t.classList.contains('ed-pick')) {
        edSelect(sid);
      }
    });

    /* stella iniziale: ?s=..., altrimenti la prima senza punto, altrimenti la prima */
    var want = qs('s');
    var first = ed.stars.filter(function (s) { return s.id === want; })[0] ||
      ed.stars.filter(function (s) { return !edHas(c.id, s.id); })[0] || ed.stars[0];
    edSelect(first.id, true);
    if (window.ResizeObserver) new ResizeObserver(edLens).observe($('#ed-lens'));
  }

  /* ---------------------------------------------------------------- init */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    if (page === 'home') pageHome();
    else if (page === 'constellation') pageConstellation();
    else if (page === 'star') pageStar();
  });
})();
