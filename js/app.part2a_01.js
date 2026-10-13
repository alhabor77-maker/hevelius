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
      var cur = (active === c.id) ? ' aria-current="pag