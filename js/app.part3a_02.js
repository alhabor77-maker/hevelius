nome) + '</a>' +
      '<a class="btn" href="constellation.html?c=' + next.id + editQ() + '">' + esc(next.nome) + ' \u2192</a></div>' +
      '</div></div>' +
      '<div class="scrim" id="scrim"></div><aside class="star-panel" id="panel" role="dialog" aria-modal="false" aria-labelledby="panel-title" aria-hidden="true"></aside>';
    main.innerHTML = html;

    renderChips(c);
    drawOverlay(c);
    wireToolbar(c);
    $('#scrim').addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    var img = $('#plate-img');
    function onImg() {
      if (img.naturalWidth) { c.w = img.naturalWidth; c.h = img.naturalHeight; drawOverlay(c); }
    }
    if (img.complete) onImg(); else img.addEventListener('load', onImg);
    img.addEventListener('error', function () {
      $('#viewport').innerHTML = '<p class="plate-loading">Impossibile caricare l\u2019immagine della tavola.</p>';
    });
    if (window.ResizeObserver) new ResizeObserver(fitLabels).observe($('#plate'));
    else window.addEventListener('resize', fitLabels);
    if (isEdit()) initEditMode(c);
  }

  function groupOf(cid, h) {
    if (h && h.group) return String(h.group).toLowerCase();
    if (cid === 'toro' && h && PLEIADI_IDS.indexOf(h.star_id) >= 0) return 'pleiadi';
