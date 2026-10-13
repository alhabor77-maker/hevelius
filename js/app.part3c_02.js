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
