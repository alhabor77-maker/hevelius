/* app.grid.js — Home: griglia 89 card + ricerca istantanea.
   ------------------------------------------------------------------
   AGGIORNAMENTO SAFARI iOS (ott 2026) — griglia static-first:
   index.html ora contiene GIÀ le 89 <a class="grid-card"> generate in
   build-time dentro #cards, prima del noscript. La griglia è quindi
   visibile anche se il JavaScript non parte (rete lenta, JS disattivato,
   errore in un altro script). Questo file ora:
     1) rende la ricerca istantanea attiva SUBITO sulle card statiche
        (indice costruito dal DOM, senza attendere alcun fetch);
     2) quando data/griglia.json arriva, RIFINISCE la griglia aggiornando
        solo gli attributi che differiscono (niente ricostruzione, niente
        flash né selezione persa);
     3) costruisce la griglia da zero SOLO se #cards fosse vuoto
        (retrocompatibilità con una home senza griglia statica).
   Tutto ES5 puro: niente arrow function, template literal, const/let;
   niente Promise/MutationObserver nel percorso principale. */

(function () {
  'use strict';

  var state = {
    inited: false,   // indice ricerca pronto e collegato alle card
    starting: false, // fetch dati in corso
    items: []
  };

  function $id(id) { return document.getElementById(id); }

  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function linkFor(slug) {
    var target = (slug === 'pleiadi') ? 'toro' : slug;
    return 'constellation.html?c=' + encodeURIComponent(target);
  }

  function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }

  /* ------------------------- fetch dati ------------------------- */

  var RETRY = 3, RETRY_MS = 700;
  function fetchFirst(paths, cb) {
    var i = 0;
    (function next(tryN) {
      if (i >= paths.length) { cb(null); return; }
      if (typeof fetch !== 'function') { cb(null); return; }
      fetch(paths[i], { cache: 'default' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        if (isArr(d) && d.length) cb(d);
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

  function inlineData() {
    var tag = document.getElementById('griglia-data');
    if (!tag) return null;
    try {
      var d = JSON.parse(tag.textContent || tag.innerText || '');
      return (isArr(d) && d.length) ? d : null;
    } catch (e) { return null; }
  }

  /* --------------------------- normalizzazione --------------------------- */

  function normalizeItems(data) {
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var v = data[i];
      if (!v || !v.slug) continue;
      var titolo = v.titolo || v.nome || '';
      var latino = v.latino || '';
      var alt = isArr(v.alt_names) ? v.alt_names.join(' ') : '';
      var search = v.search ? String(v.search) : norm([titolo, latino, alt, v.slug].join(' '));
      out.push({
        slug: v.slug,
        titolo: titolo,
        latino: latino,
        tavola: v.tavola || '',
        img: v.img_url || v.thumb || v.img || '',
        href: linkFor(v.slug),
        search: search,
        el: null
      });
    }
    return out;
  }

  /* ------------------------------- filtro ------------------------------- */

  function filterGrid(query) {
    if (!state.inited) return;
    var q = norm(query);
    var empty = document.getElementById('grid-empty');
    var shown = 0;
    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      if (!it.el || !it.el.parentNode) continue;
      var show = !q || it.search.indexOf(q) !== -1;
      var cls = it.el.className;
      if (show) {
        if (cls.indexOf('is-hidden') !== -1) it.el.className = cls.replace(/\s*\bis-hidden\b/g, '');
        shown += 1;
      } else if (cls.indexOf('is-hidden') === -1) {
        it.el.className += ' is-hidden';
      }
    }
    if (empty) {
      if (q && shown === 0) {
        empty.textContent = 'Nessuna costellazione trovata per \u00ab' + String(query).trim() + '\u00bb';
        empty.style.display = '';
      } else {
        empty.style.display = 'none';
      }
    }
  }

  /* --------------------------- wiring ricerca --------------------------- */

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
    document.addEventListener('search', function (e) {
      if (e.target && e.target.id === 'search-box') filterGrid(e.target.value);
    });
  }

  function wiring() {
    wireSearch();
    var sb = document.getElementById('search-box');
    if (sb && sb.value) filterGrid(sb.value);
  }

  /* ------------------------------ card DOM ------------------------------ */

  function buildCard(it) {
    var el = document.createElement('a');
    el.className = 'grid-card';
    el.href = it.href;
    el.setAttribute('data-slug', it.slug);
    el.setAttribute('aria-label', it.titolo);
    var img = document.createElement('img');
    img.src = it.img;
    img.alt = 'Tavola: ' + it.titolo;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    el.appendChild(img);
    var cap = document.createElement('span');
    cap.className = 'card-mini-title';
    cap.textContent = it.titolo;
    el.appendChild(cap);
    return el;
  }

  function ensureEmptyMsg(box) {
    var empty = document.getElementById('grid-empty');
    if (empty) return;
    empty = document.createElement('p');
    empty.className = 'grid-empty';
    empty.id = 'grid-empty';
    empty.style.display = 'none';
    empty.setAttribute('role', 'status');
    empty.setAttribute('aria-live', 'polite');
    box.parentNode.insertBefore(empty, box.nextSibling);
  }

  /* ------------------------------- percorsi ------------------------------ */

  // Indice di ricerca dal DOM statico, attivo SUBITO (nessun fetch, nessuna attesa).
  function staticIndexFromDom() {
    if (state.inited) return false;
    var box = document.getElementById('cards');
    if (!box) return false;
    var links = box.querySelectorAll('a.grid-card');
    if (!links.length) return false;
    var items = [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var slug = a.getAttribute('data-slug') || '';
      var cap = a.querySelector('.card-mini-title');
      var titolo = cap ? cap.textContent : (a.getAttribute('aria-label') || slug);
      var img = a.querySelector('img');
      items.push({
        slug: slug,
        titolo: titolo,
        latino: '',
        tavola: '',
        img: img ? img.getAttribute('src') : '',
        href: a.getAttribute('href'),
        search: norm(titolo + ' ' + slug),
        el: a
      });
    }
    state.items = items;
    state.inited = true;
    wiring();
    return true;
  }

  // Dati JSON arrivati: se c'è la griglia statica la RIFINISCE (solo attributi
  // che differiscono); se non c'è, costruisce tutto.
  function initGrid(box, data) {
    var items = normalizeItems(data);
    if (!items.length) { staticIndexFromDom(); return; }
    state.items = items;
    state.inited = true;

    var existing = box.querySelectorAll('a.grid-card');
    if (existing.length) {
      var bySlug = {};
      for (var k = 0; k < items.length; k++) bySlug[items[k].slug] = items[k];
      for (var i = 0; i < existing.length; i++) {
        var el = existing[i];
        var it = bySlug[el.getAttribute('data-slug') || ''];
        if (!it) continue;
        var img = el.querySelector('img');
        if (img && it.img && img.getAttribute('src') !== it.img) img.setAttribute('src', it.img);
        var cap = el.querySelector('.card-mini-title');
        if (cap && it.titolo && cap.textContent !== it.titolo) cap.textContent = it.titolo;
        if (it.href && el.getAttribute('href') !== it.href) el.setAttribute('href', it.href);
        it.el = el;
      }
      // item senza card nel DOM statico (home statica incompleta): le aggiunge
      for (var j = 0; j < items.length; j++) {
        if (!items[j].el) {
          var nel = buildCard(items[j]);
          box.appendChild(nel);
          items[j].el = nel;
        }
      }
    } else {
      box.innerHTML = '';
      for (var m = 0; m < items.length; m++) {
        var cel = buildCard(items[m]);
        box.appendChild(cel);
        items[m].el = cel;
      }
    }
    ensureEmptyMsg(box);
    wiring();
  }

  // Griglia statica presente ma JSON mai arrivato: l'indice DOM basta.
  function staticFallback() {
    if (state.inited) return;
    if (staticIndexFromDom()) return;
    state.starting = false;
  }

  function start() {
    if (state.inited || state.starting) return;
    var body = document.body;
    var box = document.getElementById('cards');
    if (!box || !body || body.getAttribute('data-page') !== 'home') return;

    // 1) griglia statica in pagina: attiva subito ricerca/indice, poi (in
    //    background) rifinisci con i dati quando arrivano.
    if (box.querySelectorAll('a.grid-card').length) {
      state.starting = true;
      staticIndexFromDom();
      var data = window.GRIGLIA_DATA || inlineData();
      if (data) {
        state.starting = false;
        initGrid(box, data);
        return;
      }
      fetchFirst(['data/griglia.json', 'data/thumbs_manifest.json', 'js/griglia.json'],
        function (d) {
          state.starting = false;
          if (d) initGrid(box, d);
          else staticFallback();
        });
      return;
    }

    // 2) nessuna card statica (non dovrebbe accadere): percorso fetch classico.
    state.starting = true;
    var data2 = window.GRIGLIA_DATA || inlineData();
    if (data2) { initGrid(box, data2); return; }
    fetchFirst(['data/griglia.json', 'data/thumbs_manifest.json', 'js/griglia.json'],
      function (d) {
        state.starting = false;
        if (d) initGrid(box, d);
      });
  }

  wireSearch();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.appGrid = {
    renderGrid: start,
    filterGrid: filterGrid,
    ready: function () { return state.inited; }
  };
})();
