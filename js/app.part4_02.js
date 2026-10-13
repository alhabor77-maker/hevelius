en', 'false');
    Array.prototype.forEach.call(document.querySelectorAll('.hs'), function (g) {
      g.classList.toggle('active', g.getAttribute('data-star') === sid);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#chips button'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-star') === sid);
    });
    if (fromUrl && h) scrollToHotspot(cid, h);
    try { $('.close', panel).focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function scrollToHotspot(cid, h) {
    var vp = $('#viewport'), plate = $('#plate');
    if (!vp || !plate) return;
    vp.scrollLeft = (h.x_pct / 100) * plate.offsetWidth - vp.clientWidth / 2;
    vp.scrollTop = (h.y_pct / 100) * plate.offsetHeight - vp.clientHeight / 2;
  }

  function closePanel() {
    var panel = $('#panel'), scrim = $('#scrim');
    if (!panel) return;
    panel.classList.remove('open'); scrim.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    state.active = null;
    Array.prototype.forEach.call(document.querySelectorAll('.hs.active'), function (g) { g.classList.remove('active'); });
    Array.prototype.forEach.call(document.querySelectorAll('#chips .active'), function (b) { b.classList.remove('active'); });
  }

  /* ---------------------------------------------------------