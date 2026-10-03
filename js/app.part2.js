    origine_nome: 'Nel mito greco le Pleiadi sono le sette figlie di Atlante e Pleione.',
    curiosita: 'Nella tavola di Hevelius l\u2019ammasso \u00e8 un gruppetto di piccole stelle sul dorso del Toro. A occhio nudo se ne distinguono di solito sei o sette, ma l\u2019ammasso ne contiene centinaia. Le singole stelle (Alcyone, Atlas, Electra, Maia, Merope, Taygeta, Pleione, Celaeno, Asterope) sono elencate nella pagina della costellazione.'
  };
  function starById(cid, sid) {
    var s = starsOf(cid).filter(function (s) { return s.id === sid; })[0] || null;
    if (!s && cid === 'toro' && sid === 'pleiadi') return PLEIADI_SCHEDA;
    return s;
  }
  function hotspotsOf(cid) { return (DATA.hotspots && Array.isArray(DATA.hotspots[cid])) ? DATA.hotspots[cid] : []; }
  function hotspotOf(cid, sid) { return hotspotsOf(cid).filter(function (h) { return h.star_id === sid; })[0] || null; }
  function fonteOf(c) {
    return DATA.fonti.filter(function (f) { return f.file === c.img; })[0] || null;
  }
  function fonteUrl(f) { return f && (f.url_fonte_pagina || f.pagina_commons || f.url_sorgente || f.url_file_originale) || null; }

  /* --------------------------------------------------------------- chrome */
  function renderHeader(active) {
    var el = $('#site-header');
    if (!el) return;
    var links = CONST.map(function (c) {
      var cur = (active === c.id) ? ' aria-current="page"' : '';
      return '<a href="constellation.html?c=' + c.id + editQ() + '"' + cur + '>' + esc(c.nome) + '</a>';
    }).join('');
    el.innerHTML = '<div class="wrap">' +
      '<a class="brand" href="index.html"><span class="star" aria-hidden="true">\u2726</span><span>Firmamentum Sobiescianum <small>Hevelius 1690</small></span></a>' +
      '<nav class="nav" aria-label="Costellazioni">' + links + '</nav></div>';
  }

  function renderFooter() {
    var el = $('#site-footer');
    if (!el) return;
    var credits = CONST.map(function (c) {
      var f = fonteOf(c), url = fonteUrl(f);
      var titolo = f && f.titolo_tavola ? f.titolo_tavola : (c.tavola + ' \u2013 ' + c.latino);
      var lic = f && f.licenza ? f.licenza : 'Pubblico dominio';
      var prov = f && (f.provenienza_scansione || f.istituzione_origine) ? f.provenienza_scansione || f.istituzione_origine : '';
      return '<li><strong>' + esc(c.nome) + '</strong>: ' + esc(titolo) +
        (prov ? '. Scansione: ' + esc(prov) : '') +
        '. Licenza: ' + esc(lic) + '.' +
        (url ? ' <a href="' + esc(url) + '" target="_blank" rel="noopener">Pagina sorgente (' + esc(hostOf(url)) + ')</a>' : '') + '</li>';
    }).join('');
    el.innerHTML = '<div class="wrap">' +
      '<div class="cols">' +
      '<div><h4>Crediti delle immagini</h4><ul>' + credits + '</ul></div>' +
      '<div><h4>Fonti e licenze</h4><ul>' +
      '<li>Tavole: Johannes Hevelius, <em>Firmamentum Sobiescianum sive Uranographia</em>, Danzica 1690 (opera in pubblico dominio).</li>' +
      '<li>Dati astronomici: ricavati dalle pagine di Wikipedia (CC BY-SA 4.0), con rimandi ai cataloghi Hipparcos/Gaia e SIMBAD; i valori sono approssimati.</li>' +
      '<li>I testi del sito sono originali, a scopo didattico.</li>' +
      '</ul></div>' +
      '<div><h4>Nota sull\u2019orientamento</h4><p>Le tavole di Hevelius mostrano il cielo <em>dall\u2019esterno</em> della sfera celeste, come su un globo: le figure sono in orientamento speculare rispetto al cielo che vediamo da Terra.</p></div>' +
      '</div>' +
      '<p class="legal">Prototipo didattico \u00b7 sito statico (HTML, CSS, JavaScript) \u00b7 <a href="index.html">Home</a></p></div>';
  }

  function setTitle(t) { document.title = t + ' \u00b7 Hevelius, Firmamentum Sobiescianum'; }

  function notice(msg, cls) {
    return '<div class="notice ' + (cls || '') + '">' + msg + '</div>';
  }

  /* ---------------------------------------------------------------- HOME */
  function pageHome() {
    renderHeader('');
    var grid = $('#cards');
    if (!grid) return;
    grid.innerHTML = CONST.map(function (c) {
      return '<a class="card" href="constellation.html?c=' + c.id + '">' +
        '<div class="thumb"><img src="' + c.thumb + '" alt="Tavola di Hevelius: ' + esc(c.nome) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + c.img + '\'"></div>' +
        '<div class="body"><h3>' + esc(c.nome) + '</h3><div class="latin">' + esc(c.latino) + ' \u00b7 ' + esc(c.tavola) + '</div>' +
        '<p>' + esc(c.blurb) + '</p><span class="more">Apri la tavola \u2192</span></div></a>';
    }).join('');
    loadAll().then(renderFooter);
  }

  /* ------------------------------------------------------- CONSTELLATION */
  var state = { c: null, zoom: 1, active: null, svgH: 0 };

  function pageConstellation() {
    var cid = qs('c');
    var c = constById(cid);
    var main = $('#main');
    renderHeader(c ? c.id : '');
    if (!c) {
      main.innerHTML = '<div class="narrow section"><h1>Costellazione non trovata</h1>' +
        notice('Scegli una delle costellazioni dalla <a href="index.html">home</a>.', 'error') + '</div>';
      setTitle('Costellazione non trovata');
      loadAll().then(renderFooter);
      return;
    }
    state.c = c;
    if (isEdit()) document.body.classList.add('edit-mode');
    setTitle(isEdit() ? 'Puntamento \u2013 ' + c.nome : c.nome);
    main.innerHTML = '<div class="wrap"><p class="plate-loading">Caricamento della tavola\u2026</p></div>';
    loadAll().then(function () {
      renderConstellation(c);
      renderFooter();
      var s = qs('s');
      if (s) openStar(c.id, s, true);
    });
  }

  function textBlock(c) {
    var t = DATA.testi && DATA.testi[c.id];
    if (!t) {
      return notice('I testi di questa costellazione non sono ancora disponibili. Riprova tra poco: la tavola e le schede delle stelle funzionano comunque.');
    }
    var html = '', used = {};
    SECTIONS.forEach(function (s) {
      if (t[s[0]]) { used[s[0]] = 1; html += '<h2>' + s[1] + '</h2>' + paragraphs(t[s[0]]); }
    });
    Object.keys(t).forEach(function (k) {
      if (used[k] || SKIP_KEYS[k] || typeof t[k] !== 'string' || !t[k]) return;
      html += '<h2>' + esc(prettify(k)) + '</h2>' + paragraphs(t[k]);
    });
    return html || notice('I testi di questa costellazione non sono ancora disponibili.');
  }

  function renderConstellation(c) {
    var main = $('#main');
    var t = DATA.testi && DATA.testi[c.id];
    var titolo = (t && t.titolo) || (c.nome + ' (' + c.latino + ')');
    var f = fonteOf(c), url = fonteUrl(f);
    var hs = hotspotsOf(c.id);
    var idx = CONST.indexOf(c);
    var prev = CONST[(idx + CONST.length - 1) % CONST.length], next = CONST[(idx + 1) % CONST.length];

    var hsMissing = !DATA.hotspots || !hs.length;
    var html = '<div class="wrap">' +
      '<div class="page-head"><div class="crumbs"><a href="index.html">Home</a> \u203a ' + esc(c.nome) + '</div>' +
      '<h1>' + esc(titolo) + '</h1><p class="sub">' + esc(c.tavola) + ' \u00b7 Firmamentum Sobiescianum, 1690</p></div>' +
      '<div class="toolbar" role="toolbar" aria-label="Strumenti della tavola">' +
      '<button class="btn" id="zoom-out" type="button" aria-label="Riduci">\u2212</button>' +
      '<button class="btn" id="zoom-in" type="button" aria-label="Ingrandisci">+</button>' +
      '<button class="btn" id="zoom-reset" type="button">Adatta</button>' +
      '<button class="btn" id="toggle-labels" type="button" aria-pressed="false">Mostra nomi</button>' +
      '<button class="btn" id="toggle-hs" type="button" aria-pressed="false">Nascondi punti</button>' +
      '<span class="spacer"></span><span class="hint">' + (hotspotsOf(c.id).length ? 'Tocca un cerchio dorato per aprire la scheda della stella.' : 'Su questa tavola non ci sono punti cliccabili: scegli una stella dall\u2019elenco qui sotto.') + '</span></div>' +
      '<div class="plate-viewport" id="viewport"><div class="plate-inner" id="plate" style="width:100%">' +
