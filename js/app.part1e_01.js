      return r.json();
    }).catch(function () { return null; });
  }
  function constById(id) { return CONST.filter(function (c) { return c.id === id; })[0] || null; }
  function paragraphs(text) {
    return String(text).split(/\n{2,}/).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
  }
  function prettify(key) {
    var s = key.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function fmtDist(d) {
    if (d == null || d === '') return null;
    if (typeof d === 'number') return d.toLocaleString('it-IT') + ' anni luce';
    return String(d);
  }
  function starName(id) {
    return prettify(String(id || '').replace(/_/g, ' '));
  }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  /* --------------------------------------------------------------- dati */
  var DATA = { stelle: null, hotspots: null, testi: null, fonti: [] };

  function loadAll() {
    var jobs = [
      Promise.all([getJSON('data/stelle.json'), fetchConcat(STELLE_PERSEO_PARTS)]).then(function (ss) {
        var merged = {};
        [ss[0], ss[