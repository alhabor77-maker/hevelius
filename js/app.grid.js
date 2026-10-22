/* =========================================================================
   app_grid.js — Griglia miniature cliccabili + ricerca istantanea (home)
   -------------------------------------------------------------------------
   Da caricare DOPO js/app.js in index.html. Nessuna dipendenza esterna,
   nessun duplicate-fetch: app.js (pageHome) renderizza la griglia legacy
   dentro #cards dopo i 41 part-fetch; questo script attende che quella
   sia pronta, poi la SOSTITUISCE con la griglia compatta costruita dai
   dati-card (89 voci: 88 costellazioni + Pleiadi).

   Sorgenti dati-card, in ordine di priorità (la prima disponibile vince):
     1. window.GRIGLIA_DATA  (array, stesso schema del manifest)
     2. <script type="application/json" id="griglia-data">[...]</script>
     3. fetch 'data/griglia.json' → 'data/thumbs_manifest.json' → 'js/griglia.json'
     4. fallback: parsing della griglia legacy già renderizzata da app.js
        (titolo + latino + slug; SENZA nomi alternativi)

   Schema atteso per voce (come /workspace/griglia/work/thumbs_manifest.json):
     { slug, titolo, latino, alt_names[], img_url, tavola, search? }
   Il campo `search` è opzionale: se assente viene ricalcolato lato client
   con la stessa normalizzazione (minuscole, NFD senza accenti, niente
   punteggiatura) su titolo + latino + alt_names + slug.

   API pubblica (per debug / integrazioni):
     window.appGrid.renderGrid(), window.appGrid.filterGrid(query)
   ========================================================================= */
(function () {
  'use strict';

  var state = {
    inited: false,   // griglia nuova renderizzata + wiring fatto
    starting: false, // init in corso (evita doppi fetch/avvii)
    items: []        // voci normalizzate: {slug,titolo,latino,tavola,img,href,search,el}
  };

  /* ---------------------------- utilità ---------------------------- */

  function $id(id) { return document.getElementById(id); }

  // Normalizzazione identica a quella usata per il campo `search` del manifest
  // (design_miniature.md §3): minuscole, NFD senza segni, solo [a-z0-9 ].
  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Link di una card. Pleiadi: non esiste una scheda dedicata
     (constellation.html?c=pleiadi risponde «Costellazione non trovata»),
     quindi la card punta alla pagina del Toro, che contiene la sezione M45.
     Per ripristinare il link diretto basta tornare a encodeURIComponent(slug). */
  function linkFor(slug) {
    var target = (slug === 'pleiadi') ? 'toro' : slug;
    return 'constellation.html?c=' + encodeURIComponent(target);
  }

  /* ------------------------- sorgenti dati ------------------------- */

  function inlineData() {
    var tag = $id('griglia-data');
    if (!tag) return null;
    try {
      var d = JSON.parse(tag.textContent || tag.innerText || '');
      return (Object.prototype.toString.call(d) === '[object Array]' && d.length) ? d : null;
    } catch (e) { return null; }
  }

  // Tenta i path in sequenza; risponde cb(data) o cb(null) se nessuno va bene.
  // Ogni path viene ritentato fino a RETRY volte con una piccola pausa: su rete
  // mobile un fetch che fallisce una volta non deve lasciare la griglia vuota
  // (in quel caso l'utente vedrebbe per sempre il segnaposto / il noscript).
  var RETRY = 3, RETRY_MS = 700;
  function fetchFirst(paths, cb) {
    var i = 0;
    (function next(tryN) {
      if (i >= paths.length) { cb(null); return; }
      // fetch globale (del browser); in ambiente senza fetch si salta al fallback
      if (typeof fetch !== 'function') { cb(null); return; }
      fetch(paths[i], { cache: 'default' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        if (Object.prototype.toString.call(d) === '[object Array]' && d.length) cb(d);
        else throw new Error('dati non validi');
      }).catch(function () {
        if (tryN + 1 < RETRY) {
          setTimeout(function () { next(tryN + 1); }, RETRY_MS);
          return;
        }
        i += 1; next(0);
      });
    })(0);
  }

  // Fallback: ricostruisce i dati dalle card legacy già presenti in #cards
  // (render di pageHome di app.js: a.card > .thumb img / h3 / .latin).
  function domFallbackData() {
    var box = $id('cards');
    if (!box) return [];
    var links = box.querySelectorAll('a.card[href*="constellation.html"]');
    var out = [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var m = a.getAttribute('href').match(/[?&]c=([^&]+)/);
      if (!m) continue;
      var slug;
      try { slug = decodeURIComponent(m[1]); } catch (e) { slug = m[1]; }
      var imgEl = a.querySelector('img');
      var h3 = a.querySelector('h3, .body h3');
      var lat = a.querySelector('.latin');
      var titolo = h3 ? h3.textContent : slug;
      var latino = lat ? lat.textContent : '';
      out.push({
        slug: slug,
        titolo: titolo,
        latino: latino,
        alt_names: [],
        img_url: imgEl ? imgEl.getAttribute('src') : '',
        tavola: '',
        search: norm(titolo + ' ' + latino + ' ' + slug)
      });
    }
    return out;
  }

  /* --------------------------- inizializzazione --------------------------- */

  function start() {
    if (state.inited || state.starting) return;
    // Solo in home (body[data-page="home"]) e solo se esiste #cards.
    var body = document.body;
    var box = $id('cards');
    if (!box || !body || body.getAttribute('data-page') !== 'home') return;
    state.starting = true;

    // 1) dati sincroni (globale o tag JSON inline)
    var data = window.GRIGLIA_DATA || inlineData();
    if (data) { initGrid(box, data); return; }

    // 2) dati via fetch (uno dei tre path); in parallelo si aspetta che la
    //    griglia legacy di app.js sia apparsa (serve al fallback DOM e come
    //    segnale che CONST è stata renderizzata).
    var legacyReady = waitForLegacyGrid(box, 20000);
    fetchFirst(['data/griglia.json', 'data/thumbs_manifest.json', 'js/griglia.json'],
      function (d) {
        legacyReady.then(function (ok) {
          // ok=false può significare solo «timeout»: se i dati fetch ci sono,
          // li usiamo comunque (il fallback DOM serve solo a d=null).
          if (d) { initGrid(box, d); return; }
          // Nessun file dati disponibile → fallback: leggo le card legacy
          // (altrimenti la griglia nuova non esisterebbe affatto).
          var fb = domFallbackData();
          if (fb.length) initGrid(box, fb);
          else state.starting = false; // lascio la griglia legacy com'è
        });
      });
  }

  // Risolve true appena #cards contiene le card legacy di pageHome (a.card),
  // false dopo `timeout` ms. Se lo script viene caricato DOPO app.js (caso
  // previsto: <script src=js/app.js> poi <script src=js/app_grid.js>), la
  // griglia legacy è spesso già lì; se arriva prima, ascoltiamo le mutazioni.
  function waitForLegacyGrid(box, timeout) {
    return new Promise(function (resolve) {
      var done = false;
      var check = function () { return box.querySelector('a.card[href*="constellation.html"]'); };
      if (check()) { resolve(true); return; }
      var to = setTimeout(function () { if (!done) { done = true; mo.disconnect(); resolve(false); } }, timeout);
      var mo = new MutationObserver(function () {
        if (check()) {
          if (!done) { done = true; clearTimeout(to); mo.disconnect(); resolve(true); }
        }
      });
      mo.observe(box, { childList: true, subtree: true });
    });
  }

  /* ------------------------------ render ------------------------------ */

  // Sostituisce il contenuto di #cards (segnaposto + griglia legacy di app.js)
  // con la griglia compatta. I dati non validi non toccano il DOM.
  function initGrid(box, data) {
    state.inited = true;
    state.starting = false;

    var items = normalizeItems(data);
    if (!items.length) { state.inited = false; return; }
    state.items = items;

    box.innerHTML = ''; // via il segnaposto «Carico le tavole…» e la griglia legacy
    for (var i = 0; i < items.length; i++) {
      var el = document.createElement('a');
      el.className = 'grid-card';
      el.href = items[i].href;
      el.setAttribute('data-slug', items[i].slug);
      el.setAttribute('aria-label', items[i].titolo);

      var img = document.createElement('img');
      img.src = items[i].img;
      img.alt = 'Tavola: ' + items[i].titolo;
      img.setAttribute('loading', 'lazy');    // lazy su TUTTE le immagini (le prime 9 di solito
      img.setAttribute('decoding', 'async');  // sono above-the-fold e partono comunque subito)
      el.appendChild(img);

      var cap = document.createElement('span');
      cap.className = 'card-mini-title';
      cap.textContent = items[i].titolo;
      el.appendChild(cap);

      items[i].el = el;
      box.appendChild(el);
    }

    // Messaggio «zero risultati» (nascosto di default; lo mostra filterGrid)
    var empty = document.createElement('p');
    empty.className = 'grid-empty';
    empty.id = 'grid-empty';
    empty.style.display = 'none';
    empty.setAttribute('role', 'status');
    empty.setAttribute('aria-live', 'polite');
    box.parentNode.insertBefore(empty, box.nextSibling);

    wireSearch();
    // Se l'utente ha già digitato qualcosa mentre caricava (o c'è un ?q=),
    // filtra subito con il valore corrente della barra.
    var sb = $id('search-box');
    if (sb && sb.value) filterGrid(sb.value);
  }

  // Normalizza il manifest in voci di lavoro; `search` è precomputato se
  // assente (stesso algoritmo del campo `search` del manifest, §3 del design).
  function normalizeItems(data) {
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var v = data[i];
      if (!v || !v.slug) continue;
      var titolo = v.titolo || v.nome || '';
      var latino = v.latino || '';
      var alt = Object.prototype.toString.call(v.alt_names) === '[object Array]' ? v.alt_names.join(' ') : '';
      var slug = v.slug;
      var search = v.search ? String(v.search) : norm([titolo, latino, alt, slug].join(' '));
      out.push({
        slug: slug,
        titolo: titolo,
        latino: latino,
        tavola: v.tavola || '',
        img: v.img_url || v.thumb || v.img || '',
        href: linkFor(slug),
        search: search,
        el: null
      });
    }
    return out;
  }

  /* ------------------------------ filtro ------------------------------ */

  // Filtra la griglia: substring case-insensitive senza accenti su
  // titolo + latino + alt_names + slug (campo `search` normalizzato).
  // Query vuota = tutte visibili. Zero risultati = messaggio dedicato.
  function filterGrid(query) {
    if (!state.inited) return;
    var q = norm(query);
    var box = $id('cards');
    var empty = $id('grid-empty');
    if (!box) return;

    var shown = 0;
    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      if (!it.el) continue;
      var show = !q || it.search.indexOf(q) !== -1;
      if (show) { it.el.classList.remove('is-hidden'); shown += 1; }
      else { it.el.classList.add('is-hidden'); }
    }

    if (empty) {
      if (q && shown === 0) {
        empty.textContent = 'Nessuna costellazione trovata per «' + String(query).trim() + '»';
        empty.style.display = '';
      } else {
        empty.style.display = 'none';
      }
    }
  }

  /* ------------------------------ wiring ------------------------------ */

  // Ricerca DELEGATA a livello document, registrata SUBITO (non dopo initGrid):
  // se l'utente digita mentre la griglia carica, il filtro viene comunque
  // applicato appena initGrid finisce (che a sua volta rilegge #search-box).
  // Il flag su window evita doppi listener se lo script venisse incluso 2 volte.
  function wireSearch() {
    if (window.__appGridSearchWired) return;
    window.__appGridSearchWired = true;

    var t = null;
    document.addEventListener('input', function (e) {
      var box = e.target;
      if (!box || box.id !== 'search-box') return;
      if (t) clearTimeout(t);
      t = setTimeout(function () { filterGrid(box.value); }, 150);
    });
    // clear (x) di type=search su Safari iOS: evento 'search' + click sulla x
    document.addEventListener('search', function (e) {
      if (e.target && e.target.id === 'search-box') filterGrid(e.target.value);
    });
  }
  wireSearch();
  /* ------------------------------ avvio ------------------------------ */

  // Partenza: al DOM se non è ancora passato, altrimenti subito.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    // readyState interactive/complete: DOM pronto, si parte (lo script è
    // defer/async o in fondo al body). pageHome di app.js potrebbe non avere
    // ancora finito: waitForLegacyGrid in start() gestisce l'attesa.
    start();
  }

  // Escape hatch per debug/integrazioni (es. test da console).
  window.appGrid = {
    renderGrid: start,
    filterGrid: filterGrid,
    ready: function () { return state.inited; }
  };
})();
