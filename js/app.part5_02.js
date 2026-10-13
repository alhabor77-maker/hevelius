id; })[0] || null; }
  function edTotal() {
    var o = edLoad(), n = 0;
    Object.keys(o).forEach(function (k) { if (Array.isArray(o[k])) n += o[k].length; });
    return n;
  }
  function ed1(n) { return Math.round(n * 10) / 10; }
  function edFmt(n) { return ed1(n).toFixed(1); }
  function edName(sid) {
    var l = ed.stars.filter(function (s) { return s.id === sid; })[0];
    return l ? l.nome : starName(sid);
  }
  function edStarList(c) {
    var out = [], seen = {};
    function add(id, nome) {
      if (!id || seen[id]) return;
      seen[id] = 1; out.push({ id: id, nome: nome || starName(id) });
    }
    starsOf(c.id).forEach(function (s) { add(s.id, s.nome); });
    if (c.id === 'toro') add('pleiadi', PLEIADI_SCHEDA.nome);
    hotspotsOf(c.id).forEach(function (h) { add(h.star_id, h.label); });
    edList(c.id).forEach(function (p) { add(p.star_id); });
    return out;
  }
  function edHas(cid, sid) { return !!(hotspotOf(cid, sid) || edSaved(cid, sid)); }

  function edCopy(text, done) {
    function fallback() {
      var box = $('#ed-fallback'), ta = $('#ed-ta'), ok = false;
      box.hidden = false; ta.value = text;
      try { ta.focus(); ta.select(); ta.setSelectionRange(0, text.length); } catch (e) { /* ignore */ }
      try { ok = !!document.execCommand('copy'); } catch (e2) { ok = false