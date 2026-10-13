h.max(0, x))), y: ed1(Math.min(100, Math.max(0, y))) };
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
      ring.hidden