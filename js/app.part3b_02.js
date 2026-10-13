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
