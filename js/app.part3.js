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
      '<div class="pager"><a class="btn" href="constellation.html?c=' + prev.id + editQ() + '">\u2190 ' + esc(prev.nome) + '</a>' +
      '<a class="btn" href="constellation.html?c=' + next.id + editQ() + '">' + esc(next.nome) + ' \u2192</a></div>' +
      '</div>' +
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
    return '';
  }

  function drawOverlay(c) {
    var svg = $('#overlay');
    if (!svg) return;
    var H = 1000 * c.h / c.w;
    svg.setAttribute('viewBox', '0 0 1000 ' + H.toFixed(2));
    var hs = hotspotsOf(c.id);
    svg.innerHTML = hs.map(function (h) {
      var cx = (+h.x_pct) * 10, cy = (+h.y_pct) / 100 * H, r = Math.max((+h.r_pct || 1.2) * 10, 5);
      var s = starById(c.id, h.star_id);
      var name = h.label || (s && s.nome) || starName(h.star_id);
      var g = groupOf(c.id, h);
      var act = (state.active === h.star_id) ? ' active' : '';
      return '<g class="hs' + (g ? ' group-' + esc(g) : '') + act + '" data-star="' + esc(h.star_id) + '" tabindex="0" role="button" aria-label="' + esc(name) + ': apri la scheda">' +
        '<circle class="pulse" cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="' + r.toFixed(2) + '"></circle>' +
        '<circle class="ring" cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="' + r.toFixed(2) + '"></circle>' +
        '<text class="lbl" x="' + (cx + r + 4).toFixed(2) + '" y="' + (cy + 4).toFixed(2) + '">' + esc(name) + '</text></g>';
    }).join('');
    Array.prototype.forEach.call(svg.querySelectorAll('.hs'), function (g) {
      var id = g.getAttribute('data-star');
      g.addEventListener('click', function () { openStar(c.id, id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStar(c.id, id); } });
    });
    fitLabels();
  }

  function fitLabels() {
    var svg = $('#overlay');
    if (!svg) return;
    var w = svg.getBoundingClientRect().width;
    if (!w || w < 200) w = 1000;                 // layout non disponibile/troppo piccolo: valore di ripiego
    var fs = Math.min(60, 15 * 1000 / w);        // ~15 px a schermo
    Array.prototype.forEach.call(svg.querySelectorAll('.lbl'), function (t) {
      t.style.fontSize = fs.toFixed(2) + 'px';
      t.style.strokeWidth = (fs * 0.33).toFixed(2) + 'px';
    });
  }

  function renderChips(c) {
    var box = $('#chips');
    if (!box) return;
    var stars = starsOf(c.id);
    if (!stars.length) { box.innerHTML = notice('I dati delle stelle non sono disponibili al momento.'); return; }
    var groups = {}, order = [];
    stars.forEach(function (s) {
      var g = (c.id === 'toro' && PLEIADI_IDS.indexOf(s.id) >= 0) ? 'Le Pleiadi' : 'Stelle principali';
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(s);
    });
    box.innerHTML = '<ul class="star-chips">' + order.map(function (g) {
      return (order.length > 1 ? '<li class="chip-group">' + g + '</li>' : '') + groups[g].map(function (s) {
        var has = !!hotspotOf(c.id, s.id);
        return '<li><button type="button" data-star="' + esc(s.id) + '"' + (has ? '' : ' class="nospot" title="Non segnata sulla tavola"') + '>' + esc(s.nome) + '</button></li>';
      }).join('');
    }).join('') + '</ul>';
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        if (isEdit()) { edSelect(b.getAttribute('data-star')); return; }
        openStar(c.id, b.getAttribute('data-star'));
      });
    });
  }

  function wireToolbar(c) {
    var plate = $('#plate'), vp = $('#viewport');
    function setZoom(z) {
      var old = state.zoom;
      state.zoom = Math.min(4, Math.max(1, z));
      var cx = (vp.scrollLeft + vp.clientWidth / 2) / (plate.offsetWidth || 1);
      var cy = (vp.scrollTop + vp.clientHeight / 2) / (plate.offsetHeight || 1);
      plate.style.width = (state.zoom * 100) + '%';
      if (old !== state.zoom) {
        vp.scrollLeft = cx * plate.offsetWidth - vp.clientWidth / 2;
        vp.scrollTop = cy * plate.offsetHeight - vp.clientHeight / 2;
      }
    }
    $('#zoom-in').addEventListener('click', function () { setZoom(state.zoom + 0.5); });
    $('#zoom-out').addEventListener('click', function () { setZoom(state.zoom - 0.5); });
    $('#zoom-reset').addEventListener('click', function () { setZoom(1); });
    var bl = $('#toggle-labels'), bh = $('#toggle-hs');
    bl.addEventListener('click', function () {
      var on = bl.getAttribute('aria-pressed') !== 'true';
      bl.setAttribute('aria-pressed', on); vp.classList.toggle('show-labels', on);
      bl.textContent = on ? 'Nascondi nomi' : 'Mostra nomi';
    });
    bh.addEventListener('click', function () {
      var on = bh.getAttribute('aria-pressed') !== 'true';
      bh.setAttribute('aria-pressed', on); vp.classList.toggle('hide-hotspots', on);
      bh.textContent = on ? 'Mostra punti' : 'Nascondi punti';
    });
  }

  function factsHTML(s) {
    var rows = [];
    if (s.magnitudine) rows.push(['Magnitudine', s.magnitudine]);
    if (s.spettro) rows.push(['Classe spettrale', s.spettro]);
    var d = fmtDist(s.distanza_al);
    if (d) rows.push(['Distanza', '\u2248 ' + d]);
    return rows.length ? '<dl class="facts">' + rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('') + '</dl>' : '';
  }

  function starBodyHTML(cid, sid, h) {
    var s = starById(cid, sid);
    var name = (s && s.nome) || (h && h.label) || starName(sid);
    if (!s) {
      return '<h2 id="panel-title">' + esc(name) + '</h2>' +
