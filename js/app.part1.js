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
      blurb: 'Il toro di Zeus con Aldebaran, le Iadi e le Pleiadi.' },
    { id: 'cane_maggiore', nome: 'Cane Maggiore', latino: 'Canis Major', tavola: 'Fig. DDd', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Canis_Major_-_Prodromus_astronomiae_1690_%28436425%29.jpg/1920px-Canis_Major_-_Prodromus_astronomiae_1690_%28436425%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Canis_Major_-_Prodromus_astronomiae_1690_%28436425%29.jpg/960px-Canis_Major_-_Prodromus_astronomiae_1690_%28436425%29.jpg', w: 1920, h: 1512,
      blurb: 'Il cane di Orione, con Sirio, la stella pi\u00f9 luminosa del cielo notturno.' },
    { id: 'orsa_maggiore', nome: 'Orsa Maggiore', latino: 'Ursa Major', tavola: 'Fig. D', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ursa_Major_constellation_-_Prodromus_astronomiae_1690_%285590247%29.jpg/1920px-Ursa_Major_constellation_-_Prodromus_astronomiae_1690_%285590247%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ursa_Major_constellation_-_Prodromus_astronomiae_1690_%285590247%29.jpg/960px-Ursa_Major_constellation_-_Prodromus_astronomiae_1690_%285590247%29.jpg', w: 1920, h: 1526,
      blurb: 'L\u2019orsa del Grande Carro, con Mizar e Alcor e i miti di Callisto.' }
  ];
  var TESTI_FILES = ['data/testi_orione_canemin.json', 'data/testi_toro_scorpione.json', 'data/testi_cane_maggiore.json', 'data/testi_orsa_maggiore.json'];
  var FONTI_FILES = ['data/fonti_orione_canemin.json', 'data/fonti_toro_scorpione.json', 'data/fonti_cane_maggiore.json', 'data/fonti_orsa_maggiore.json'];
  var PLEIADI_IDS = ['alcyone', 'atlas', 'electra', 'maia', 'merope', 'taygeta', 'pleione', 'celaeno', 'asterope', 'pleiadi'];
  var SECTIONS = [
    ['descrizione_astronomica', 'La costellazione nel cielo'],
    ['mito', 'Storia e mito'],
    ['pleiadi', 'Le Pleiadi'],
    ['curiosita_culturali', 'Nella cultura popolare'],
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
  /* Modalità puntamento: attiva solo con ?edit=1 (vedi sezione in fondo) */
  function isEdit() { return qs('edit') === '1'; }
  function editQ() { return isEdit() ? '&edit=1' : ''; }
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
