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

  /* ---------------------------------------------------------------- chrome */
  /* Menu compatto (fix 2026-10-22): in home resta la nav completa con tutte
     le voci (nascosta comunque sotto gli 820px dal CSS della griglia); su
     constellation.html e star.html la nav completa di 88 link in flex-wrap
     spingeva la tavola fuori schermo: li il menu diventa brand + Home +
     una tendina che rimanda a constellation.html?c=<slug>. L'elenco completo
     resta nella sidebar della pagena (renderConstSidebar). */
  function renderHeader(active) {
    var el = $('#site-header');
    if (!el) return;
    var brand = '<a class="brand" href="index.html"><span class="star" aria-hidden="true">\u2726</span><span>Firmamentum Sobiesciaum<small>Hevelius 1690</small></span></a>';
    if (document.body.getAttribute('data-page') === 'home') {
      var links = CONST.map(function (c) {
        var cur = (active === c.id) ? ' aria-current="page"' : '';
        return '<a href="constellation.html?c=' + c.id + editQ() + "' + cur + '>' + esc(c.nome) + '</a>';
      }).join('');
      el.innerHTML = '<div class="wrap">' + brand +
        '<nav class="nav" aria-label="Costellazioni">' + links + '</nav></div>';
      return;
    }
    var opts = CONST.map(function (c) {
      var sel = (active === c.id) ? ' selected' : '';
      return '<option value="' + esc(c.id) + '"' + sel + '>' + esc(c.nome) + '</option>';
    }).join('');
    el.innerHTML = '<div class="wrap">' + brand +
      '<nav class="nav nav-compact" aria-label="Costellazioni">' +
      '<a href="index.html">Home</a>' +
      '<label class="nav-jump"><span class="sr-only">Vai a una costellazione</span>' +
      '<select id="nav-jump" aria-label="Scegli una costellazione">' +
      '<option value="">Costellazioni\u2026</option>' + opts + '</select></label></nav></div>';
    var jump = el.querySelector('#nav-jump');
    if (jump) {
      jump.onchange = function () {
        var v = this.value;
        if (!v) return;
        location.href = 'constellation.html?c=' + encodeURIComponent(v) + editQ();
      };
    }
  }
