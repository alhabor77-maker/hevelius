   $('#zoom-reset').addEventListener('click', function () { setZoom(1); });
    var bl = $('#toggle-labels'), bh = $('#toggle-hs');
    bl.addEventListener('click', function () {
      var on = bl.getAttribute('aria-pressed') !== 'true';
      bl.setAttribute('aria-pressed', on); vp.classList.toggle('show-labels', on);
      bl.textContent = on ? 'Nascondi nomi' : 'Mostra nomi';
    });
    bh.addEventListener('click', function () {
      var on = bh.getAttribute('aria-pressed') !== 'true';
      bh.setAttribute('aria-pressed', on); vp.classList.toggle('hide-hotspots', on);
      bh.textContent = on ? 'Mostra punti' : 'Nascondi punti';
    });

    /* ---- Zoom automatico all'apertura (tavole condivise) ----
     * Se la tavola della costellazione corrente e' condivisa da piu' costellazioni,
     * il viewport si apre gia' ingrandito (~3x) centrato sulla zona della
     * costellazione; il pulsante esistente "Adatta" riporta la vista intera. */
    var ZOOM_CONDIVISE = {
      'Fig. P': {
        ofiucu: {cx: 47, cy: 55, z: 2.2},
        serpente: {cx: 27, cy: 56, z: 3},
      },
      'Fig. S': {
        delfino: {cx: 45, cy: 53, z: 3},
        freccia: {cx: 20, cy: 28, z: 3},
        cavallino: {cx: 69, cy: 76, z: 2.5},
      },
      'Fig. PP': {
        eridano: {cx: 50, cy: 57, z: 2.5},
        fenice: {cx: 16, cy: 62, z: 2.5},
        tucano: {cx: 15, cy: 86, z: 3},
      },
      'Fig. XX': {
        centauro: {cx: 38, cy: 55, z: 2.2},
        croce_del_sud: {cx: 42.9, cy: 79.6, z: 3},
      },
      'Fig. ZZ': {
        altare: {cx: 60, cy: 29, z: 3},
        triangolo_australe: {cx: 46, cy: 72, z: 3},
        pavone: {cx: 79, cy: 66, z: 2.5},
      },
      'Fig. BBB': {
        pesce_australe: {cx: 49, cy: 44, z: 2.5},
        gru: {cx: 51, cy: 74, z: 3},
      },
      'Fig. CCC': {
        lepre: {cx: 56, cy: 33, z: 3},
        colomba: {cx: 51, cy: 72, z: 3},
      },
      'Fig. EEe': {
        carena: {cx: 53, cy: 82, z: 3},
        vele: {cx: 40, cy: 57, z: 3},
        poppa: {cx: 17, cy: 49, z: 3},
        bussola: {cx: 70, cy: 75, z: 3},
      },
      'Fig. F': {
        boote: {cx: 53, cy: 55, z: 2.2},
        chioma: {cx: 28, cy: 68, z: 3},
      },
      'Fig. FFF': {
        indiani: {cx: 65, cy: 30, z: 3},
        volatile: {cx: 35, cy: 48, z: 3},
        cidneo: {cx: 53, cy: 78, z: 3},
        camaeleonte: {cx: 38, cy: 68, z: 3},
        mosca: {cx: 22, cy: 51, z: 3},
        pesce_volante: {cx: 30, cy: 84, z: 3},
        doradina: {cx: 42, cy: 82, z: 3},
      },
      'Bode 1801, Tav. XIX': {
        hydra: {cx: 50, cy: 51, z: 1.8},
        corvus: {cx: 38, cy: 37, z: 3},
        crater: {cx: 54, cy: 29, z: 3},
        antlia: {cx: 64, cy: 62, z: 3},
      },
      'Bode 1801, Tav. XVII': {
        caelum: {cx: 22, cy: 85, z: 3},
        fornax: {cx: 35, cy: 70, z: 3},
        sculptor: {cx: 77, cy: 72, z: 3},
      },
      'Bode 1801, Tav. XV': {
        circinus: {cx: 22, cy: 45, z: 3},
        norma: {cx: 40, cy: 50, z: 3},
        telescopium: {cx: 62, cy: 60, z: 3},
      },
      'Bode 1801, Tav. XX': {
        horologium: {cx: 42, cy: 70, z: 3},
        pictor: {cx: 71, cy: 77, z: 3},
        reticulum: {cx: 36, cy: 68, z: 3},
      },
    };
    /* pulsante "Vedi tutta la tavola": appare solo se si apre zoomato */
    var viewAll = document.createElement('button');
    viewAll.type = 'button';
    viewAll.id = 'view-full';
    viewAll.className = 'btn';
    viewAll.textContent = 'Vedi tutta la tavola';
    viewAll.setAttribute('aria-pressed', 'true');
    viewAll.style.display = 'none';
    $('#zoom-reset').insertAdjacentElement('afterend', viewAll);
    function showViewAll(on) {
      viewAll.style.display = on ? '' : 'none';
      viewAll.setAttribute('aria-pressed', String(!!on));
    }
    viewAll.addEventListener('click', function () {
      setZoom(1);
      showViewAll(false);
    });
    function applyInitialZoom() {
      var cfg = ZOOM_CONDIVISE[c.tavola];
      if (!cfg || !cfg[c.id]) return;
      if (isEdit()) return;                    /* modalita' puntamento: nessuno zoom automatico */
      var z = cfg[c.id];
      var plate = $('#plate'), vp = $('#viewport');
      if (!plate || !vp) return;
      function place() {
        state.zoom = Math.min(4, Math.max(1, z.z));
        plate.style.width = (state.zoom * 100) + '%';
        vp.scrollLeft = (z.cx / 100) * plate.offsetWidth - vp.clientWidth / 2;
        vp.scrollTop = (z.cy / 100) * plate.offsetHeight - vp.clientHeight / 2;
        showViewAll(true);
      }
      var img = $('#plate-img');
      if (img && img.complete && img.naturalWidth) place();
      else img.addEventListener('load', place, { once: true });
    }
    applyInitialZoom();
    $('#zoom-reset').addEventListener('click', function () { showViewAll(false); });
  }

  function factsHTML(s) {
    var rows = [];
    if (s.magnitudine) rows.push(['Magnitudine', s.magnitudine]);
    if (s.spettro) rows.push(['Classe spettrale', s.spettro]);
    var d = fmtDist(s.distanza_al);
    if (d) rows.push(['Distanza', '\u2248 ' + d]);
    return rows.length ? '<dl class="facts">' + rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('') + '</dl>' : '';
  }

  function starBodyHTML(cid, sid, h) {
    var s = starById(cid, sid);
    var name = (s && s.nome) || (h && h.label) || starName(sid);
    if (!s) {
      return '<h2 id="panel-title">' + esc(name) + '</h2>' +
