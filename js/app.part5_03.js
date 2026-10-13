; }
      done(ok, true);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { $('#ed-fallback').hidden = true; done(true, false); }, fallback);
    } else fallback();
  }

  function edMsg(t, bad) {
    var m = $('#ed-msg');
    if (!m) return;
    m.textContent = t; m.classList.toggle('bad', !!bad);
  }

  function edPayload() {
    var o = edLoad(), out = {};
    Object.keys(o).forEach(function (cid) {
      if (!Array.isArray(o[cid]) || !o[cid].length) return;
      out[cid] = o[cid].map(function (p) {
        return { star_id: p.star_id, x_pct: p.x_pct, y_pct: p.y_pct, r_pct: p.r_pct };
      });
    });
    return out;
  }

  function edSelect(sid, noScroll) {
    var c = ed.c;
    if (!c || !sid) return;
    ed.sel = sid;
    var s = edSaved(c.id, sid), h = hotspotOf(c.id, sid), src = s || h;
    if (src && isFinite(+src.x_pct) && isFinite(+src.y_pct)) {
      ed.cur = { x: ed1(+src.x_pct), y: ed1(+src.y_pct) };
      ed.r = ed1(+src.r_pct || 1.2);
    } else {
      ed.cur = null; ed.r = 1.2;
    }
    edRefresh();
    if (ed.cur && !noScroll) scrollToHotspot(c.id, { x_pct: ed.cur.x, y_pct: ed.cur.y });
  }

  function edSetPoint(x, y) {
    if (!isFinite(x) || !isFinite(y)) return;
    ed.cur = { x: ed1(Math.min(100, Mat