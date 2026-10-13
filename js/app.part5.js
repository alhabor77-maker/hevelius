   * Attiva solo con ?edit=1 (es. constellation.html?c=toro&edit=1).
   * Serve a trovare le coordinate degli hotspot toccando la tavola:
   *   - menu con tutte le stelle (\u2713 = ha gi\u00e0 un hotspot o un punto salvato)
   *   - tap sulla tavola = mirino (x_pct, y_pct con 1 decimale) + lente d'ingrandimento
   *   - "Salva punto" aggiunge alla lista locale (localStorage), "Copia tutto" copia il JSON
   *     {"toro":[{"star_id":"aldebaran","x_pct":45.1,"y_pct":56.2,"r_pct":1.2}]}
   * Non modifica mai i file del sito: il JSON copiato va incollato in data/hotspots.json.
   */
  var ED_KEY = 'hevelius_puntamento_v1';
  var ed = { c: null, stars: [], sel: null, cur: null, r: 1.2, step: 0.1, mem: null };

  function edLoad() {
    try {
      var s = window.localStorage.getItem(ED_KEY);
      if (s) { var o = JSON.parse(s); if (o && typeof o === 'object' && !Array.isArray(o)) return o; }
    } catch (e) { /* localStorage non disponibile: si usa la memoria */ }
    return ed.mem || {};
  }
  function edStore(o) {
    ed.mem = o;
    try { window.localStorage.setItem(ED_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
  }
  function edList(cid) { var o = edLoad(); return Array.isArray(o[cid]) ? o[cid] : []; }
  function edSaved(cid, sid) { return edList(cid).filter(function (p) { return p.star_id === sid; })[0] || null; }
  function edTotal() {
    var o = edLoad(), n = 0;
    Object.keys(o).forEach(function (k) { if (Array.isArray(o[k])) n += o[k].length; });
    return n;
  }
  function ed1(n) { return Math.round(n * 10) / 10; }
  function edFmt(n) { return ed1(n).toFixed(1); }
  function edName(sid) {
    var l = ed.stars.filter(function (s) { return s.id === sid; })[0];
    return l ? l.nome : starName(sid);
  }
  function edStarList(c) {
    var out = [], seen = {};
    function add(id, nome) {
      if (!id || seen[id]) return;
      seen[id] = 1; out.push({ id: id, nome: nome || starName(id) });
    }
    starsOf(c.id).forEach(function (s) { add(s.id, s.nome); });
    if (c.id === 'toro') add('pleiadi', PLEIADI_SCHEDA.nome);
    hotspotsOf(c.id).forEach(function (h) { add(h.star_id, h.label); });
    edList(c.id).forEach(function (p) { add(p.star_id); });
    return out;
  }
  function edHas(cid, sid) { return !!(hotspotOf(cid, sid) || edSaved(cid, sid)); }

  function edCopy(text, done) {
    function fallback() {
      var box = $('#ed-fallback'), ta = $('#ed-ta'), ok = false;
      box.hidden = false; ta.value = text;
      try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); } catch (e) { /* ignore */ }
      try { ok = !!document.execCommand('copy'); } catch (e2) { ok = false; }
      done(ok, true);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { $('#ed-fallback').hidden = true; done(true, false); }, fallback);
    } else fallback();
  }

  function edMsg(t, bad) {
    var m = $('#ed-msg');
    if (!m) return;
    m.textContent = t; m.classList.toggle('bad', !!bad);
  }

  function edPayload() {
    var o = edLoad(), out = {};
    Object.keys(o).forEach(function (cid) {
      if (!Array.isArray(o[cid]) || !o[cid].length) return;
      out[cid] = o[cid].map(function (p) {
        return { star_id: p.star_id, x_pct: p.x_pct, y_pct: p.y_pct, r_pct: p.r_pct };
      });
    });
    return out;
  }

  function edSelect(sid, noScroll) {
    var c = ed.c;
    if (!c || !sid) return;
    ed.sel = sid;
    var s = edSaved(c.id, sid), h = hotspotOf(c.id, sid), src = s || h;
    if (src && isFinite(+src.x_pct) && isFinite(+src.y_pct)) {
      ed.cur = { x: ed1(+src.x_pct), y: ed1(+src.y_pct) };
      ed.r = ed1(+src.r_pct || 1.2);
    } else {
      ed.cur = null; ed.r = 1.2;
    }
    edRefresh();
    if (ed.cur && !noScroll) scrollToHotspot(c.id, { x_pct: ed.cur.x, y_pct: ed.cur.y });
  }

  function edSetPoint(x, y) {
    if (!isFinite(x) || !isFinite(y)) return;
    ed.cur = { x: ed1(Math.min(100, Math.max(0, x))), y: ed1(Math.min(100, Math.max(0, y))) };
    edMsg('');
    edRefresh();
  }

  function edLens() {
    var lens = $('#ed-lens'), c = ed.c;
    if (!lens || !c) return;
    if (!ed.cur) { lens.style.backgroundImage = 'none'; lens.classList.add('empty'); return; }
    var box = lens.clientWidth || 104;
    var bgW = box / 0.06;                                   // la lente mostra il 6% della larghezza della tavola
    var bgH = bgW * c.h / c.w;
    lens.classList.remove('empty');
    lens.style.backgroundImage = 'url("' + c.img + '")';
    lens.style.backgroundSize = bgW.toFixed(1) + 'px ' + bgH.toFixed(1) + 'px';
    lens.style.backgroundPosition = (box / 2 - ed.cur.x / 100 * bgW).toFixed(1) + 'px ' + (box / 2 - ed.cur.y / 100 * bgH).toFixed(1) + 'px';
  }

  function edRefresh() {
    var c = ed.c;
    if (!c) return;
    var sel = $('#ed-select');
    if (sel) {
      sel.innerHTML = ed.stars.map(function (s) {
        var mark = edHas(c.id, s.id) ? '\u2713 ' : '\u00a0\u00a0\u00a0';
        var loc = edSaved(c.id, s.id) ? ' (salvato)' : '';
        return '<option value="' + esc(s.id) + '">' + mark + esc(s.nome) + loc + '</option>';
      }).join('');
      if (ed.sel) sel.value = ed.sel;
    }
    var ring = $('#ed-ring'), cross = $('#ed-cross');
    if (ring && cross) {
      ring.hidden = cross.hidden = !ed.cur;
      if (ed.cur) {
        cross.style.left = ring.style.left = ed.cur.x + '%';
        cross.style.top = ring.style.top = ed.cur.y + '%';
        ring.style.width = (ed.r * 2) + '%';
      }
    }
    var co = $('#ed-coords'), st = $('#ed-status');
    if (co) co.innerHTML = ed.cur
      ? 'x <b>' + edFmt(ed.cur.x) + '</b> \u00b7 y <b>' + edFmt(ed.cur.y) + '</b> \u00b7 r <b>' + edFmt(ed.r) + '</b>'
      : 'x \u2013 \u00b7 y \u2013 \u00b7 r <b>' + edFmt(ed.r) + '</b>';
    if (st) {
      var s = ed.sel ? edSaved(c.id, ed.sel) : null, h = ed.sel ? hotspotOf(c.id, ed.sel) : null, t;
      if (!ed.cur) t = 'Tocca la tavola per posizionare il mirino.';
      else if (s && ed1(s.x_pct) === ed.cur.x && ed1(s.y_pct) === ed.cur.y && ed1(s.r_pct) === ed.r) t = 'Punto salvato nella lista.';
      else if (!s && h && ed1(+h.x_pct) === ed.cur.x && ed1(+h.y_pct) === ed.cur.y) t = 'Posizione attuale del sito (non modificata).';
      else t = 'Da salvare: premi \u201cSalva punto\u201d.';
      st.textContent = t;
    }
    var dots = $('#ed-dots');
    if (dots) dots.innerHTML = edList(c.id).map(function (p) {
      return '<span class="ed-dot" style="left:' + (+p.x_pct) + '%;top:' + (+p.y_pct) + '%" data-n="' + esc(edName(p.star_id)) + '"></span>';
    }).join('');
    var ul = $('#ed-list'), cnt = $('#ed-count');
    var list = edList(c.id);
    if (cnt) cnt.textContent = 'Punti salvati: ' + list.length + (edTotal() !== list.length ? ' (in totale ' + edTotal() + ')' : '');
    if (ul) {
      ul.innerHTML = list.map(function (p) {
        return '<li><button type="button" class="ed-pick" data-star="' + esc(p.star_id) + '">' + esc(edName(p.star_id)) +
          ' \u2014 ' + edFmt(+p.x_pct) + '; ' + edFmt(+p.y_pct) + '</button>' +
          '<button type="button" class="ed-del" data-star="' + esc(p.star_id) + '" aria-label="Rimuovi ' + esc(edName(p.star_id)) + '">\u00d7</button></li>';
      }).join('') || '<li class="muted">Nessun punto salvato in questa tavola.</li>';
    }
    edLens();
  }

  function initEditMode(c) {
    ed.c = c;
    ed.stars = edStarList(c);
    var plate = $('#plate'), bar;
    if (!plate || !ed.stars.length) {
      var tb = $('.toolbar');
      if (tb) tb.insertAdjacentHTML('beforebegin', notice('Modalit\u00e0 puntamento non disponibile: i dati delle stelle non sono stati caricati.', 'error'));
      return;
    }
    var html = '<div class="ed-bar" id="ed-bar">' +
      '<div class="ed-main">' +
      '<div class="ed-title">Modalit\u00e0 puntamento \u00b7 ' + esc(c.nome) + '</div>' +
      '<label class="sr-only" for="ed-select">Stella da posizionare</label>' +
