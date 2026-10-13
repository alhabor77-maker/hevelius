2, 0), 1 - hf);
    var px = (1 - wf) > 0.0001 ? left / (1 - wf) * 100 : 0;
    var py = (1 - hf) > 0.0001 ? top / (1 - hf) * 100 : 0;
    var mx = (cx - left) / wf * 100, my = (cy - top) / hf * 100;
    var mr = Math.max(r / 100 / wf * 100, 6);                // raggio in % della cornice
    return '<figure class="crop-wrap" style="margin:0"><div class="crop" role="img" aria-label="Dettaglio della tavola intorno alla stella" ' +
      'style="background-image:url(\'' + c.img + '\');background-size:' + (100 / wf).toFixed(1) + '% auto;background-position:' + px.toFixed(2) + '% ' + py.toFixed(2) + '%">' +
      '<span class="mark" style="left:' + mx.toFixed(2) + '%;top:' + my.toFixed(2) + '%;width:' + (mr * 2).toFixed(2) + '%;height:' + (mr * 2).toFixed(2) + '%"></span></div>' +
      '<figcaption>Dettaglio della ' + esc(c.tavola) + ' (' + esc(c.nome) + '). Orientamento speculare: la tavola mostra il cielo dall\u2019esterno della sfera celeste.</figcaption></figure>';
  }

  function renderStar(c, sid) {
    var main = $('#main');
    var stars = starsOf(c.id);
    var s = starById(c.id, sid);
    var h = sid ? hotspotOf(c.id, sid) : null;
    var back = '<a class="btn" href="constellation.html?c=' + c.id + '">\u2190 Torna alla tavola: ' + esc(c.nome) + '</a>';

    if (!DATA.stelle) {
      main.innerHTML = '<