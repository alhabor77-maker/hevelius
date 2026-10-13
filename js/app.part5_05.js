 = cross.hidden = !ed.cur;
      if (ed.cur) {
        cross.style.left = ring.style.left = ed.cur.x + '%';
        cross.style.top = ring.style.top = ed.cur.y + '%';
        ring.style.width = (ed.r * 2) + '%';
      }
    }
    var co = $('#ed-coords'), st = $('#ed-status');
    if (co) co.innerHTML = ed.cur
      ? 'x <b>' + edFmt(ed.cur.x) + '</b> \u00b7 y <b>' + edFmt(ed.cur.y) + '</b> \u00b7 r <b>' + edFmt(ed.r) + '</b>'
      : 'x \u2013 \u00b7 y \u2013 \u00b7 r <b>' + edFmt(ed.r) + '</b>';
    if (st) {
      var s = ed.sel ? edSaved(c.id, ed.sel) : null, h = ed.sel ? hotspotOf(c.id, ed.sel) : null, t;
      if (!ed.cur) t = 'Tocca la tavola per posizionare il mirino.';
      else if (s && ed1(s.x_pct) === ed.cur.x && ed1(s.y_pct) === ed.cur.y && ed1(s.r_pct) === ed.r) t = 'Punto salvato nella lista.';
      else if (!s && h && ed1(+h.x_pct) === ed.cur.x && ed1(+h.y_pct) === ed.cur.y) t = 'Posizione attuale del sito (non modificata).';
      else t = 'Da salvare: premi \u201cSalva punto\u201d.';
      st.textContent = t;
    }
    var dots = $('#ed-dots');
    if (dots) dots.innerHTML = edList(c.id).map(function (p) {
      return '<span class="ed-dot" style="left:' + (+p.x_pct) + '%;top:' + (+p.y_pct) + '%" data-n="' + esc(edName(p.star_id)) + '"></span>';
    }).join('');
    var ul = $('#ed-list