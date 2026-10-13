.hotspots || !hs.length;
    var html = '<div class="wrap"><div class="const-layout">' +
      '<aside class="const-side" id="const-side" aria-label="Le costellazioni dell\'atlante"><h2>Costellazioni</h2><nav><ul id="const-side-list"></ul></nav></aside>' +
      '<div class="page-head"><div class="crumbs"><a href="index.html">Home</a> \u203a ' + esc(c.nome) + '</div>' +
      '<h1>' + esc(titolo) + '</h1><p class="sub">' + esc(c.tavola) + ' \u00b7 Firmamentum Sobiescianum, 1690</p></div>' +
      '<div class="toolbar" role="toolbar" aria-label="Strumenti della tavola">' +
      '<button class="btn" id="zoom-out" type="button" aria-label="Riduci">\u2212</button>' +
      '<button class="btn" id="zoom-in" type="button" aria-label="Ingrandisci">+</button>' +
      '<button class="btn" id="zoom-reset" type="button">Adatta</button>' +
      '<button class="btn" id="toggle-labels" type="button" aria-pressed="false">Mostra nomi</button>' +
      '<button class="btn" id="toggle-hs" type="button" aria-pressed="false">Nascondi punti</button>' +
      '<span class="spacer"></span><span class="hint">' + (hotspotsOf(c.id).length ? 'Tocca un cerchio dorato per aprire la scheda della stella.' : 'Su questa tavola non ci sono punti cliccabili: scegli una stella dall\u2019elenco qui sotto.') + '</span></div>' +
      '<div class="plate-viewport" id="viewport"><div class="plate-inner" id="plate" style="width:100%">' +
