div class="narrow section"><h1>Scheda non disponibile</h1>' +
        notice('I dati delle stelle non sono stati caricati. Riprova pi\u00f9 tardi.', 'error') + '<p>' + back + '</p></div>';
      setTitle('Scheda non disponibile');
      return;
    }
    if (!s) {
      main.innerHTML = '<div class="narrow section"><h1>' + (sid ? 'Stella non trovata' : 'Scegli una stella') + '</h1>' +
        notice(sid ? 'In ' + esc(c.nome) + ' non c\u2019\u00e8 una stella con questo identificativo.' : 'Seleziona una stella di ' + esc(c.nome) + ':') +
        '<ul class="star-chips">' + stars.map(function (x) {
          return '<li><a href="star.html?c=' + c.id + '&s=' + encodeURIComponent(x.id) + '">' + esc(x.nome) + '</a></li>';
        }).join('') + '</ul><p style="margin-top:1.5rem">' + back + '</p></div>';
      setTitle('Stella non trovata');
      return;
    }
    setTitle(s.nome + ' \u2013 ' + c.nome);
    var i = stars.indexOf(s);
    if (i < 0) i = stars.map(function (x) { return x.id; }).indexOf('alcyone');
    if (i < 0) i = 0;
    var prev = stars[(i + stars.length - 1) % stars.length], next = stars[(i + 1) % stars.length];
    var isP = c.id === 'toro' && PLEIADI_IDS.indexOf(s.id) >= 0;
    var t = DATA.testi && DATA.testi[c.id];

    main.innerHTML = '<div class="wrap">' +
      '<div class="page-head"><div 