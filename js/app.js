/* Hevelius – Firmamentum Sobiescianum · app.js
 * Nessun build step. Funziona con `python3 -m http.server` dalla cartella del sito.
 *
 * File dati (tutti relativi a ./data/):
 *   stelle.json                  { costellazione_id: [ {id, nome, bayer, origine_nome, magnitudine, spettro, distanza_al, curiosita, fonte_url} ] }
 *   hotspots.json                { costellazione_id: [ {star_id, x_pct, y_pct, r_pct, [label], [group]} ] }
 *                                x_pct/y_pct = centro in % di larghezza/altezza immagine; r_pct = raggio in % della LARGHEZZA.
 *   testi_orione_canemin.json    { orione:{titolo, descrizione_astronomica, mito, hevelius, ...}, cane_minore:{...} }
 *   testi_toro_scorpione.json    { toro:{..., pleiadi}, scorpione:{...} }
 *   fonti_*.json                 { immagini:[ {file, costellazione, titolo_tavola, licenza, url_fonte_pagina|pagina_commons, ...} ] }
 * I file mancanti non bloccano il sito: la parte corrispondente mostra un avviso.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ config */
  var CONST = [
    { id: 'orione', nome: 'Orione', latino: 'Orion', tavola: 'Tavola QQ', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/1920px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/960px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', w: 1920, h: 1514,
      blurb: 'Il cacciatore del cielo invernale, con la Cintura e la grande nebulosa M42.' },
    { id: 'scorpione', nome: 'Scorpione', latino: 'Scorpius', tavola: 'Tavola II', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Johannes_Hevelius_-_Scorpius.jpg/1920px-Johannes_Hevelius_-_Scorpius.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Johannes_Hevelius_-_Scorpius.jpg/960px-Johannes_Hevelius_-_Scorpius.jpg', w: 1920, h: 1567,
      blurb: 'Il rivale di Orione, con il cuore rosso di Antares. Esemplare colorato a mano.' },
    { id: 'cane_minore', nome: 'Cane Minore', latino: 'Canis Minor', tavola: 'Tavola SS', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Canis_Minor_-_Prodromus_astronomiae_1690_%285590605%29.jpg/1920px-Canis_Minor_-_Prodromus_astronomiae_1690_%285590605%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Canis_Minor_-_Prodromus_astronomiae_1690_%285590605%29.jpg/960px-Canis_Minor_-_Prodromus_astronomiae_1690_%285590605%29.jpg', w: 1920, h: 1511,
      blurb: 'Il piccolo cane di Orione, guidato da Procione, vicina stella d\u2019inverno.' },
    { id: 'toro', nome: 'Toro', latino: 'Taurus', tavola: 'Tavola CC', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Taurus_-_Prodromus_astronomiae_1690_%285590444%29.jpg/1920px-Taurus_-_Prodromus_astronomiae_1690_%285590444%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Taurus_-_Prodromus_astronomiae_1690_%285590444%29.jpg/960px-Taurus_-_Prodromus_astronomiae_1690_%285590444%29.jpg', w: 1920, h: 1503,
      blurb: 'Il toro di Zeus con Aldebaran, le Iadi e le Pleiadi.' }
  ];
  var TESTI_FILES = ['data/testi_orione_canemin.json', 'data/testi_toro_scorpione.json'];
  var FONTI_FILES = ['data/fonti_orione_canemin.json', 'data/fonti_toro_scorpione.json'];
  var PLEIADI_IDS = ['alcyone', 'atlas', 'electra', 'maia', 'merope', 'taygeta', 'pleione', 'celaeno', 'asterope', 'pleiadi'];
  var SECTIONS = [
    ['descrizione_astronomica', 'La costellazione nel cielo'],
    ['mito', 'Storia e mito'],
    ['pleiadi', 'Le Pleiadi'],
    ['hevelius', 'La tavola di Hevelius']
  ];
  var SKIP_KEYS = { titolo: 1, nome: 1, id: 1 };

  /* ------------------------------------------------------------------ util */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () { return null; });
  }
  function constById(id) { return CONST.filter(function (c) { return c.id === id; })[0] || null; }
  function paragraphs(text) {
    return String(text).split(/\n{2,}/).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
  }
  function prettify(key) {
    var s = key.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function fmtDist(d) {
    if (d == null || d === '') return null;
    if (typeof d === 'number') return d.toLocaleString('it-IT') + ' anni luce';
    return String(d);
  }
  function starName(id) {
    return prettify(String(id || '').replace(/_/g, ' '));
  }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  /* --------------------------------------------------------------- dati */
  var DATA = { stelle: null, hotspots: null, testi: null, fonti: [] };

  function loadAll() {
    var jobs = [
      getJSON('data/stelle.json'),
      getJSON('data/hotspots.json'),
      Promise.all(TESTI_FILES.map(getJSON)),
      Promise.all(FONTI_FILES.map(getJSON))
    ];
    return Promise.all(jobs).then(function (r) {
      DATA.stelle = r[0];
      DATA.hotspots = r[1];
      var testi = {}, anyTesti = false;
      r[2].forEach(function (t) {
        if (t && typeof t === 'object') { anyTesti = true; Object.keys(t).forEach(function (k) { testi[k] = t[k]; }); }
      });
      DATA.testi = anyTesti ? testi : null;
      r[3].forEach(function (f) {
        if (f && Array.isArray(f.immagini)) DATA.fonti = DATA.fonti.concat(f.immagini);
      });
    });
  }

  function starsOf(cid) { return (DATA.stelle && DATA.stelle[cid]) || []; }
  var PLEIADI_SCHEDA = {
    id: 'pleiadi', nome: 'Pleiadi (M45)', bayer: 'Ammasso aperto \u00b7 Messier 45',
    magnitudine: '1,6 (complessiva)', distanza_al: 440,
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
      return '<a href="constellation.html?c=' + c.id + '"' + cur + '>' + esc(c.nome) + '</a>';
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
        notice('Scegli una delle quattro costellazioni dalla <a href="index.html">home</a>.', 'error') + '</div>';
      setTitle('Costellazione non trovata');
      loadAll().then(renderFooter);
      return;
    }
    state.c = c;
    setTitle(c.nome);
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
      '<img id="plate-img" src="' + c.img + '" alt="Tavola di Hevelius: ' + esc(c.nome) + '" width="' + c.w + '" height="' + c.h + '">' +
      '<svg id="overlay" viewBox="0 0 1000 ' + (1000 * c.h / c.w).toFixed(2) + '" preserveAspectRatio="none" aria-label="Stelle cliccabili"></svg>' +
      '</div></div>' +
      '<p class="plate-caption">' + esc(f && f.titolo_tavola ? f.titolo_tavola : c.tavola) +
      (f && f.licenza ? ' \u2014 ' + esc(f.licenza) : '') +
      (url ? ' \u2014 <a href="' + esc(url) + '" target="_blank" rel="noopener">fonte</a>' : '') + '</p>' +
      '<p class="mirror-note callout"><strong>Attenzione all\u2019orientamento.</strong> Hevelius disegna il cielo visto dall\u2019esterno della sfera celeste: la tavola \u00e8 speculare rispetto al cielo reale, con est e ovest invertiti.</p>' +
      (hsMissing ? notice('I punti cliccabili di questa tavola non sono ancora pronti: usa l\u2019elenco qui sotto per aprire le schede delle stelle.') : '') +
      '<section class="section" aria-labelledby="stelle-h"><h2 id="stelle-h">Le stelle principali</h2><div id="chips"></div></section>' +
      '<section class="section"><div class="narrow prose">' + textBlock(c) + '</div></section>' +
      '<div class="pager"><a class="btn" href="constellation.html?c=' + prev.id + '">\u2190 ' + esc(prev.nome) + '</a>' +
      '<a class="btn" href="constellation.html?c=' + next.id + '">' + esc(next.nome) + ' \u2192</a></div>' +
      '</div>' +
      '<div class="scrim" id="scrim"></div><aside class="star-panel" id="panel" role="dialog" aria-modal="false" aria-labelledby="panel-title" aria-hidden="true"></aside>';
    main.innerHTML = html;

    renderChips(c);
    drawOverlay(c);
    wireToolbar(c);
    $('#scrim').addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    var img = $('#plate-img');
    function onImg() {
      if (img.naturalWidth) { c.w = img.naturalWidth; c.h = img.naturalHeight; drawOverlay(c); }
    }
    if (img.complete) onImg(); else img.addEventListener('load', onImg);
    img.addEventListener('error', function () {
      $('#viewport').innerHTML = '<p class="plate-loading">Impossibile caricare l\u2019immagine della tavola.</p>';
    });
    if (window.ResizeObserver) new ResizeObserver(fitLabels).observe($('#plate'));
    else window.addEventListener('resize', fitLabels);
  }

  function groupOf(cid, h) {
    if (h && h.group) return String(h.group).toLowerCase();
    if (cid === 'toro' && h && PLEIADI_IDS.indexOf(h.star_id) >= 0) return 'pleiadi';
    return '';
  }

  function drawOverlay(c) {
    var svg = $('#overlay');
    if (!svg) return;
    var H = 1000 * c.h / c.w;
    svg.setAttribute('viewBox', '0 0 1000 ' + H.toFixed(2));
    var hs = hotspotsOf(c.id);
    svg.innerHTML = hs.map(function (h) {
      var cx = (+h.x_pct) * 10, cy = (+h.y_pct) / 100 * H, r = Math.max((+h.r_pct || 1.2) * 10, 5);
      var s = starById(c.id, h.star_id);
      var name = h.label || (s && s.nome) || starName(h.star_id);
      var g = groupOf(c.id, h);
      var act = (state.active === h.star_id) ? ' active' : '';
      return '<g class="hs' + (g ? ' group-' + esc(g) : '') + act + '" data-star="' + esc(h.star_id) + '" tabindex="0" role="button" aria-label="' + esc(name) + ': apri la scheda">' +
        '<circle class="pulse" cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="' + r.toFixed(2) + '"></circle>' +
        '<circle class="ring" cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="' + r.toFixed(2) + '"></circle>' +
        '<text class="lbl" x="' + (cx + r + 4).toFixed(2) + '" y="' + (cy + 4).toFixed(2) + '">' + esc(name) + '</text></g>';
    }).join('');
    Array.prototype.forEach.call(svg.querySelectorAll('.hs'), function (g) {
      var id = g.getAttribute('data-star');
      g.addEventListener('click', function () { openStar(c.id, id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStar(c.id, id); } });
    });
    fitLabels();
  }

  function fitLabels() {
    var svg = $('#overlay');
    if (!svg) return;
    var w = svg.getBoundingClientRect().width;
    if (!w || w < 200) w = 1000;                 // layout non disponibile/troppo piccolo: valore di ripiego
    var fs = Math.min(60, 15 * 1000 / w);        // ~15 px a schermo
    Array.prototype.forEach.call(svg.querySelectorAll('.lbl'), function (t) {
      t.style.fontSize = fs.toFixed(2) + 'px';
      t.style.strokeWidth = (fs * 0.33).toFixed(2) + 'px';
    });
  }

  function renderChips(c) {
    var box = $('#chips');
    if (!box) return;
    var stars = starsOf(c.id);
    if (!stars.length) { box.innerHTML = notice('I dati delle stelle non sono disponibili al momento.'); return; }
    var groups = {}, order = [];
    stars.forEach(function (s) {
      var g = (c.id === 'toro' && PLEIADI_IDS.indexOf(s.id) >= 0) ? 'Le Pleiadi' : 'Stelle principali';
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(s);
    });
    box.innerHTML = '<ul class="star-chips">' + order.map(function (g) {
      return (order.length > 1 ? '<li class="chip-group">' + g + '</li>' : '') + groups[g].map(function (s) {
        var has = !!hotspotOf(c.id, s.id);
        return '<li><button type="button" data-star="' + esc(s.id) + '"' + (has ? '' : ' class="nospot" title="Non segnata sulla tavola"') + '>' + esc(s.nome) + '</button></li>';
      }).join('');
    }).join('') + '</ul>';
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { openStar(c.id, b.getAttribute('data-star')); });
    });
  }

  function wireToolbar(c) {
    var plate = $('#plate'), vp = $('#viewport');
    function setZoom(z) {
      var old = state.zoom;
      state.zoom = Math.min(4, Math.max(1, z));
      var cx = (vp.scrollLeft + vp.clientWidth / 2) / (plate.offsetWidth || 1);
      var cy = (vp.scrollTop + vp.clientHeight / 2) / (plate.offsetHeight || 1);
      plate.style.width = (state.zoom * 100) + '%';
      if (old !== state.zoom) {
        vp.scrollLeft = cx * plate.offsetWidth - vp.clientWidth / 2;
        vp.scrollTop = cy * plate.offsetHeight - vp.clientHeight / 2;
      }
    }
    $('#zoom-in').addEventListener('click', function () { setZoom(state.zoom + 0.5); });
    $('#zoom-out').addEventListener('click', function () { setZoom(state.zoom - 0.5); });
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

  /* ---------------------------------------------------------------- init */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    if (page === 'home') pageHome();
    else if (page === 'constellation') pageConstellation();
    else if (page === 'star') pageStar();
  });
})();
