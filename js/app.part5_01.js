   * Attiva solo con ?edit=1 (es. constellation.html?c=toro&edit=1).
   * Serve a trovare le coordinate degli hotspot toccando la tavola:
   *   - menu con tutte le stelle (\u2713 = ha gi\u00e0 un hotspot o un punto salvato)
   *   - tap sulla tavola = mirino (x_pct, y_pct con 1 decimale) + lente d'ingrandimento
   *   - "Salva punto" aggiunge alla lista locale (localStorage), "Copia tutto" copia il JSON
   *     {"toro":[{"star_id":"aldebaran","x_pct":45.1,"y_pct":56.2,"r_pct":1.2}]}
   * Non modifica mai i file del sito: il JSON copiato va incollato in data/hotspots.json.
   */
  var ED_KEY = 'hevelius_puntamento_v1';
  var ed = { c: null, stars: [], sel: null, cur: null, r: 1.2, step: 0.1, mem: null };

  function edLoad() {
    try {
      var s = window.localStorage.getItem(ED_KEY);
      if (s) { var o = JSON.parse(s); if (o && typeof o === 'object' && !Array.isArray(o)) return o; }
    } catch (e) { /* localStorage non disponibile: si usa la memoria */ }
    return ed.mem || {};
  }
  function edStore(o) {
    ed.mem = o;
    try { window.localStorage.setItem(ED_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
  }
  function edList(cid) { var o = edLoad(); return Array.isArray(o[cid]) ? o[cid] : []; }
  function edSaved(cid, sid) { return edList(cid).filter(function (p) { return p.star_id === s