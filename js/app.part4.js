        notice('Per questo punto della tavola non c\u2019\u00e8 ancora una scheda dettagliata.');
    }
    return '<h2 id="panel-title">' + esc(s.nome) + '</h2>' +
      (s.bayer ? '<div class="bayer">' + esc(s.bayer) + '</div>' : '') +
      factsHTML(s) +
      (s.origine_nome ? '<h3>Il nome</h3><p>' + esc(s.origine_nome) + '</p>' : '') +
      (s.curiosita ? '<h3>Curiosit\u00e0</h3><p>' + esc(s.curiosita) + '</p>' : '') +
      (s.fonte_url ? '<p class="small muted">Fonte dati: <a href="' + esc(s.fonte_url) + '" target="_blank" rel="noopener">' + esc(hostOf(s.fonte_url)) + '</a></p>' : '');
  }

  function openStar(cid, sid, fromUrl) {
    if (isEdit()) return;                      // in modalità puntamento le schede non si aprono
    var panel = $('#panel'), scrim = $('#scrim');
    if (!panel) return;
    var h = hotspotOf(cid, sid);
    state.active = sid;
    panel.innerHTML = '<button class="close" type="button" aria-label="Chiudi">\u00d7</button>' +
      starBodyHTML(cid, sid, h) +
      '<div class="actions"><a class="btn primary" href="star.html?c=' + encodeURIComponent(cid) + '&s=' + encodeURIComponent(sid) + '">Scheda completa</a></div>';
    $('.close', panel).addEventListener('click', closePanel);
    panel.classList.add('open'); scrim.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    Array.prototype.forEach.call(document.querySelectorAll('.hs'), function (g) {
      g.classList.toggle('active', g.getAttribute('data-star') === sid);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#chips button'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-star') === sid);
    });
    if (fromUrl && h) scrollToHotspot(cid, h);
    try { $('.close', panel).focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function scrollToHotspot(cid, h) {
    var vp = $('#viewport'), plate = $('#plate');
    if (!vp || !plate) return;
    vp.scrollLeft = (h.x_pct / 100) * plate.offsetWidth - vp.clientWidth / 2;
    vp.scrollTop = (h.y_pct / 100) * plate.offsetHeight - vp.clientHeight / 2;
  }

  function closePanel() {
    var panel = $('#panel'), scrim = $('#scrim');
    if (!panel) return;
    panel.classList.remove('open'); scrim.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    state.active = null;
    Array.prototype.forEach.call(document.querySelectorAll('.hs.active'), function (g) { g.classList.remove('active'); });
    Array.prototype.forEach.call(document.querySelectorAll('#chips .active'), function (b) { b.classList.remove('active'); });
  }

  /* ---------------------------------------------------------------- STAR */
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
    var top = Math.min(Math.max(cy - hf / 2, 0), 1 - hf);
    var px = (1 - wf) > 0.0001 ? left / (1 - wf) * 100 : 0;
    var py = (1 - hf) > 0.0001 ? top / (1 - hf) * 100 : 0;
    var mx = (cx - left) / wf * 100, my = (cy - top) / hf * 100;
    var mr = Math.max(r / 100 / wf * 100, 6);                // raggio in % della cornice
    return '<figure class="crop-wrap" style="margin:0"><div class="crop" role="img" aria-label="Dettaglio della tavola intorno alla stella" ' +
      'style="background-image:url(\'' + c.img + '\');background-size:' + (100 / wf).toFixed(1) + '% auto;background-position:' + px.toFixed(2) + '% ' + py.toFixed(2) + '%">' +
      '<span class="mark" style="left:' + mx.toFixed(2) + '%;top:' + my.toFixed(2) + '%;width:' + (mr * 2).toFixed(2) + '%;height:' + (mr * 2).toFixed(2) + '%"></span></div>' +
      '<figcaption>Dettaglio della ' + esc(c.tavola) + ' (' + esc(c.nome) + '). Orientamento speculare: la tavola mostra il cielo dall\u2019esterno della sfera celeste.</figcaption></figure>';
  }

  function renderStar(c, sid) {
    var main = $('#main');
    var stars = starsOf(c.id);
    var s = starById(c.id, sid);
    var h = sid ? hotspotOf(c.id, sid) : null;
    var back = '<a class="btn" href="constellation.html?c=' + c.id + '">\u2190 Torna alla tavola: ' + esc(c.nome) + '</a>';

    if (!DATA.stelle) {
      main.innerHTML = '<div class="narrow section"><h1>Scheda non disponibile</h1>' +
        notice('I dati delle stelle non sono stati caricati. Riprova pi\u00f9 tardi.', 'error') + '<p>' + back + '</p></div>';
      setTitle('Scheda non disponibile');
      return;
    }
    if (!s) {
      main.innerHTML = '<div class="narrow section"><h1>' + (sid ? 'Stella non trovata' : 'Scegli una stella') + '</h1>' +
        notice(sid ? 'In ' + esc(c.nome) + ' non c\u2019\u00e8 una stella con questo identificativo.' : 'Seleziona una stella di ' + esc(c.nome) + ':') +
        '<ul class="star-chips">' + stars.map(function (x) {
          return '<li><a href="star.html?c=' + c.id + '&s=' + encodeURIComponent(x.id) + '">' + esc(x.nome) + '</a></li>';
        }).join('') + '</ul><p style="margin-top:1.5rem">' + back + '</p></div>';
      setTitle('Stella non trovata');
      return;
    }
    setTitle(s.nome + ' \u2013 ' + c.nome);
    var i = stars.indexOf(s);
    if (i < 0) i = stars.map(function (x) { return x.id; }).indexOf('alcyone');
    if (i < 0) i = 0;
    var prev = stars[(i + stars.length - 1) % stars.length], next = stars[(i + 1) % stars.length];
    var isP = c.id === 'toro' && PLEIADI_IDS.indexOf(s.id) >= 0;
    var t = DATA.testi && DATA.testi[c.id];

    main.innerHTML = '<div class="wrap">' +
      '<div class="page-head"><div class="crumbs"><a href="index.html">Home</a> \u203a <a href="constellation.html?c=' + c.id + '">' + esc(c.nome) + '</a> \u203a ' + esc(s.nome) + '</div>' +
      '<h1>' + esc(s.nome) + '</h1><p class="sub">' + esc(s.bayer || '') + (isP ? ' \u00b7 Pleiadi' : ' \u00b7 ' + esc(c.nome)) + '</p></div>' +
      '<div class="star-layout"><div>' + cropHTML(c, h) + '</div>' +
      '<div class="panel-box">' + factsHTML(s) +
      (s.origine_nome ? '<h3>Il nome</h3><p>' + esc(s.origine_nome) + '</p>' : '') +
      (s.curiosita ? '<h3>Curiosit\u00e0</h3><p>' + esc(s.curiosita) + '</p>' : '') +
      (s.fonte_url ? '<p class="small muted">Fonte dati: <a href="' + esc(s.fonte_url) + '" target="_blank" rel="noopener">' + esc(hostOf(s.fonte_url)) + '</a> (CC BY-SA)</p>' : '') +
      '</div></div>' +
      (isP && t && t.pleiadi ? '<section class="narrow prose section"><h2>Le Pleiadi nel mito</h2>' + paragraphs(t.pleiadi) + '</section>' : '') +
      '<div class="pager"><a class="btn" href="star.html?c=' + c.id + '&s=' + encodeURIComponent(prev.id) + '">\u2190 ' + esc(prev.nome) + '</a>' + back +
      '<a class="btn" href="star.html?c=' + c.id + '&s=' + encodeURIComponent(next.id) + '">' + esc(next.nome) + ' \u2192</a></div>' +
      '</div>';
  }

  /* ------------------------------------------------ MODALITA' PUNTAMENTO
