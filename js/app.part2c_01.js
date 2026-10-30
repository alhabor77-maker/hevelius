    main.innerHTML = '<div class="wrap"><p class="plate-loading">Caricamento della tavola\u2026</p></div>';
    loadAll().then(function () {
      renderConstellation(c);
      renderConstSidebar(c.id);
      renderFooter();
      var s = qs('s');
      if (s) openStar(c.id, s, true);
    });
  }

  function textBlock(c) {
    var t = DATA.testi && DATA.testi[c.id];
    if (!t) {
      return notice('I testi di questa costellazione non sono ancora disponibili. Riprova tra poco: la tavola e le schede delle stelle funzionano comunque.');
    }
    var html = '', used = {};
    SECTIONS.forEach(function (s) {
      if (t[s[0]]) {
        used[s[0]] = 1;
        var label = s[1];
        if (s[0] === 'hevelius') {
          var tv = String(c.tavola || '');
          if (tv.indexOf('Bode') === 0) label = 'La tavola di Bode (1801)';
          else if (tv.indexOf('Lacaille') === 0) label = 'La tavola di Lacaille (1756)';
        }
        html += '<h2>' + label + '</h2>' + paragraphs(t[s[0]]);
      }
    });
    Object.keys(t).forEach(function (k) {
      if (used[k] || SKIP_KEYS[k] || typeof t[k] !== 'string' || !t[k]) return;
      html += '<h2>' + esc(prettify(k)) + '</h2>' + paragraphs(t[k]);
    });
    return html || notice('I testi di questa costellazione non sono ancora disponibili.');
  }

  function renderConstellation(c) {
    var main = $('#main');
    var t = DATA.testi && DATA.testi[c.id];
    var titolo = (t && t.titolo) || (c.nome + ' (' + c.latino + ')');
    var f = fonteOf(c), url = fonteUrl(f);
    var hs = hotspotsOf(c.id);
    var idx = CONST.indexOf(c);
    var prev = CONST[(idx + CONST.length - 1) % CONST.length], next = CONST[(idx + 1) % CONST.length];

    var hsMissing = !DATA