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
    if (isEdit()) return;                      // in modalità puntamento le schede non si aprono
    var panel = $('#panel'), scrim = $('#scrim');
    if (!panel) return;
    var h = hotspotOf(cid, sid);
    state.active = sid;
    panel.innerHTML = '<button class="close" type="button" aria-label="Chiudi">\u00d7</button>' +
      starBodyHTML(cid, sid, h) +
      '<div class="actions"><a class="btn primary" href="star.html?c=' + encodeURIComponent(cid) + '&s=' + encodeURIComponent(sid) + '">Scheda completa</a></div>';
    $('.close', panel).addEventListener('click', closePanel);
    panel.classList.add('open'); scrim.classList.add('open');
    panel.setAttribute('aria-hidd