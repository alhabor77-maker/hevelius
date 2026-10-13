arget;
      if (!t || !t.getAttribute) return;
      var sid = t.getAttribute('data-star');
      if (!sid) return;
      if (t.classList.contains('ed-del')) {
        var o = edLoad();
        o[c.id] = edList(c.id).filter(function (p) { return p.star_id !== sid; });
        if (!o[c.id].length) delete o[c.id];
        edStore(o);
        if (ed.sel === sid) edSelect(sid, true); else edRefresh();
        edMsg('Rimosso: ' + edName(sid) + '.');
      } else if (t.classList.contains('ed-pick')) {
        edSelect(sid);
      }
    });

    /* stella iniziale: ?s=..., altrimenti la prima senza punto, altrimenti la prima */
    var want = qs('s');
    var first = ed.stars.filter(function (s) { return s.id === want; })[0] ||
      ed.stars.filter(function (s) { return !edHas(c.id, s.id); })[0] || ed.stars[0];
    edSelect(first.id, true);
    if (window.ResizeObserver) new ResizeObserver(edLens).observe($('#ed-lens'));
  }

  /* ---------------------------------------------------------------- init */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    if (page === 'home') pageHome();
    else if (page === 'constellation') pageConstellation();
    else if (page === 'star') pageStar();
  });
})();
