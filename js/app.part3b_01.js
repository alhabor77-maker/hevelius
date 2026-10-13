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
  