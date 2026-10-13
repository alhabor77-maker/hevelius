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
      Promise.all([fetchConcat(['data/stelle_01.json', 'data/stelle_02.json', 'data/stelle_03.json', 'data/stelle_04.json', 'data/stelle_05.json', 'data/stelle_06.json', 'data/stelle_07.json', 'data/stelle_08.json', 'data/stelle_09.json', 'data/stelle_10.json', 'data/stelle_11.json', 'data/stelle_12.json', 'data/stelle_13.json', 'data/stelle_14.json', 'data/stelle_15.json', 'data/stelle_16.json']), fetchConcat(STELLE_PERSEO_PARTS)]).then(function (ss) {
        var merged = {};
        [ss[0], ss[