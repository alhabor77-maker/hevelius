      '<li>Tavole: Johannes Hevelius, <em>Firmamentum Sobiescianum sive Uranographia</em>, Danzica 1690 (opera in pubblico dominio).</li>' +
      '<li>Dati astronomici: ricavati dalle pagine di Wikipedia (CC BY-SA 4.0), con rimandi ai cataloghi Hipparcos/Gaia e SIMBAD; i valori sono approssimati.</li>' +
      '<li>I testi del sito sono originali, a scopo didattico.</li>' +
      '</ul></div>' +
      '<div><h4>Nota sull\u2019orientamento</h4><p>Le tavole di Hevelius mostrano il cielo <em>dall\u2019esterno</em> della sfera celeste, come su un globo: le figure sono in orientamento speculare rispetto al cielo che vediamo da Terra.</p></div>' +
      '</div>' +
      '<p class="legal">Prototipo didattico \u00b7 sito statico (HTML, CSS, JavaScript) \u00b7 <a href="index.html">Home</a></p></div>';
  }

  function setTitle(t) { document.title = t + ' \u00b7 Hevelius, Firmamentum Sobiescianum'; }

  function notice(msg, cls) {
    return '<div class="notice ' + (cls || '') + '">' + msg + '</div>';
  }

  /* ---------------------------------------------------------------- HOME */
  function pageHome() {
    renderHeader('');
    var grid = $('#cards');
    if (!grid) return;
    grid.innerHTML = CONST.map(function (c) {
      return '<a class="card" href="constellation.html?c=' + c.id + '">' +
        '<div class="thumb"><img src="' + c.thumb + '" alt="Tavola di Hevelius: ' + esc(c.nome) + '" loading="lazy" onerror="this.onerror=null;this