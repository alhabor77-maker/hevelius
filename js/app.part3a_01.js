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
      '<div class="pager"><a class="btn" href="constellation.html?c=' + prev.id + editQ() + '">\u2190 ' + esc(prev.