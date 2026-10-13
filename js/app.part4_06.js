class="crumbs"><a href="index.html">Home</a> \u203a <a href="constellation.html?c=' + c.id + '">' + esc(c.nome) + '</a> \u203a ' + esc(s.nome) + '</div>' +
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
