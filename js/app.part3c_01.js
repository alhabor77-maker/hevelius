        var has = !!hotspotOf(c.id, s.id);
        return '<li><button type="button" data-star="' + esc(s.id) + '"' + (has ? '' : ' class="nospot" title="Non segnata sulla tavola"') + '>' + esc(s.nome) + '</button></li>';
      }).join('');
    }).join('') + '</ul>';
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () {
        if (isEdit()) { edSelect(b.getAttribute('data-star')); return; }
        openStar(c.id, b.getAttribute('data-star'));
      });
    });
  }

  function wireToolbar(c) {
    var plate = $('#plate'), vp = $('#viewport');
    function setZoom(z) {
      var old = state.zoom;
      state.zoom = Math.min(4, Math.max(1, z));
      var cx = (vp.scrollLeft + vp.clientWidth / 2) / (plate.offsetWidth || 1);
      var cy = (vp.scrollTop + vp.clientHeight / 2) / (plate.offsetHeight || 1);
      plate.style.width = (state.zoom * 100) + '%';
      if (old !== state.zoom) {
        vp.scrollLeft = cx * plate.offsetWidth - vp.clientWidth / 2;
        vp.scrollTop = cy * plate.offsetHeight - vp.clientHeight / 2;
      }
    }
    $('#zoom-in').addEventListener('click', function () { setZoom(state.zoom + 0.5); });
    $('#zoom-out').addEventListener('click', function () { setZoom(state.zoom - 0.5); });
 