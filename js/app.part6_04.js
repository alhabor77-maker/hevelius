o[c.id]) ? o[c.id].slice() : [];
      var pt = { star_id: ed.sel, x_pct: ed.cur.x, y_pct: ed.cur.y, r_pct: ed.r };
      var i = l.map(function (p) { return p.star_id; }).indexOf(ed.sel);
      if (i >= 0) l[i] = pt; else l.push(pt);
      o[c.id] = l; edStore(o);
      edRefresh();
      edMsg('Salvato: ' + edName(ed.sel) + ' (' + edFmt(pt.x_pct) + '; ' + edFmt(pt.y_pct) + ').');
    });
    $('#ed-copy').addEventListener('click', function () {
      var p = edPayload();
      if (!Object.keys(p).length) { edMsg('Non c\u2019\u00e8 ancora nessun punto salvato da copiare.', true); return; }
      edCopy(JSON.stringify(p), function (ok, fb) {
        if (ok) edMsg('Copiato negli appunti (' + edTotal() + ' punti). Incollalo nella chat.');
        else edMsg(fb ? 'Seleziona il testo qui sotto e copialo a mano.' : 'Copia non riuscita.', !fb);
      });
    });
    $('#ed-clear').addEventListener('click', function () {
      var n = edTotal();
      if (!n) { edMsg('La lista \u00e8 gi\u00e0 vuota.'); return; }
      if (!window.confirm('Cancellare tutti i ' + n + ' punti salvati?')) return;
      edStore({}); $('#ed-fallback').hidden = true;
      edRefresh(); edMsg('Lista azzerata.');
    });
    $('#ed-list').addEventListener('click', function (e) {
      var t = e.t