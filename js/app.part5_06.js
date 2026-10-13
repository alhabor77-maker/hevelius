'), cnt = $('#ed-count');
    var list = edList(c.id);
    if (cnt) cnt.textContent = 'Punti salvati: ' + list.length + (edTotal() !== list.length ? ' (in totale ' + edTotal() + ')' : '');
    if (ul) {
      ul.innerHTML = list.map(function (p) {
        return '<li><button type="button" class="ed-pick" data-star="' + esc(p.star_id) + '">' + esc(edName(p.star_id)) +
          ' \u2014 ' + edFmt(+p.x_pct) + '; ' + edFmt(+p.y_pct) + '</button>' +
          '<button type="button" class="ed-del" data-star="' + esc(p.star_id) + '" aria-label="Rimuovi ' + esc(edName(p.star_id)) + '">\u00d7</button></li>';
      }).join('') || '<li class="muted">Nessun punto salvato in questa tavola.</li>';
    }
    edLens();
  }

  function initEditMode(c) {
    ed.c = c;
    ed.stars = edStarList(c);
    var plate = $('#plate'), bar;
    if (!plate || !ed.stars.length) {
      var tb = $('.toolbar');
      if (tb) tb.insertAdjacentHTML('beforebegin', notice('Modalit\u00e0 puntamento non disponibile: i dati delle stelle non sono stati caricati.', 'error'));
      return;
    }
    var html = '<div class="ed-bar" id="ed-bar">' +
      '<div class="ed-main">' +
      '<div class="ed-title">Modalit\u00e0 puntamento \u00b7 ' + esc(c.nome) + '</div>' +
      '<label class="sr-only" for="ed-select">Stella da posizionare</label>' +
