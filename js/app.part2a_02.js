e"' : '';
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
