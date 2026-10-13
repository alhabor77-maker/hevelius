------- STAR */
  function pageStar() {
    var cid = qs('c'), sid = qs('s');
    var c = constById(cid);
    var main = $('#main');
    renderHeader(c ? c.id : '');
    if (!c) {
      main.innerHTML = '<div class="narrow section"><h1>Stella non trovata</h1>' +
        notice('Torna alla <a href="index.html">home</a> e scegli una costellazione.', 'error') + '</div>';
      setTitle('Stella non trovata');
      loadAll().then(renderFooter);
      return;
    }
    main.innerHTML = '<div class="wrap"><p class="plate-loading">Caricamento\u2026</p></div>';
    loadAll().then(function () {
      renderStar(c, sid);
      renderFooter();
    });
  }

  function cropHTML(c, h) {
    if (!h) {
      return '<div class="crop-empty">Questa stella non ha un punto segnato sulla tavola. ' +
        '<a href="constellation.html?c=' + c.id + '">Apri la tavola intera</a>.</div>';
    }
    var W = c.w, Hh = c.h;
    var r = (+h.r_pct || 1.2);
    var wf = Math.min(1, Math.max(0.14, r * 7 / 100));      // frazione di larghezza mostrata
    var hf = wf * W / Hh;                                     // frazione di altezza (cornice quadrata)
    if (hf > 1) { hf = 1; wf = Hh / W; }
    var cx = h.x_pct / 100, cy = h.y_pct / 100;
    var left = Math.min(Math.max(cx - wf / 2, 0), 1 - wf);
    var top = Math.min(Math.max(cy - hf / 