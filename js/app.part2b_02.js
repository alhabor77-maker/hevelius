.src=\'' + c.img + '\'"></div>' +
        '<div class="body"><h3>' + esc(c.nome) + '</h3><div class="latin">' + esc(c.latino) + ' \u00b7 ' + esc(c.tavola) + '</div>' +
        '<p>' + esc(c.blurb) + '</p><span class="more">Apri la tavola \u2192</span></div></a>';
    }).join('');
    loadAll().then(renderFooter);
  }

  function renderConstSidebar(activeId) {
    var el = $('#const-side-list');
    if (!el) return;
    el.innerHTML = CONST.map(function (c) {
      var cur = (activeId === c.id) ? ' aria-current="true" class="active"' : '';
      return '<li><a href="constellation.html?c=' + c.id + editQ() + '"' + cur + '>' + esc(c.nome) + ' <small>' + esc(c.latino) + '</small></a></li>';
    }).join('');
  }

  /* ------------------------------------------------------- CONSTELLATION */
  var state = { c: null, zoom: 1, active: null, svgH: 0 };

  function pageConstellation() {
    var cid = qs('c');
    var c = constById(cid);
    var main = $('#main');
    renderHeader(c ? c.id : '');
    if (!c) {
      main.innerHTML = '<div class="narrow section"><h1>Costellazione non trovata</h1>' +
        notice('Scegli una delle costellazioni dalla <a href="index.html">home</a>.', 'error') + '</div>';
      setTitle('Costellazione non trovata');
      loadAll().then(renderFooter);
      return;
    }
    state.c = c;
    if (isEdit()) document.body.classList.add('edit-mode');
    setTitle(isEdit() ? 'Puntamento \u2013 ' + c.nome : c.nome);
