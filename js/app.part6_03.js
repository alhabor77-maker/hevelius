turn;
      edSetPoint((e.clientX - rc.left) / rc.width * 100, (e.clientY - rc.top) / rc.height * 100);
    });
    $('#ed-select').addEventListener('change', function () { edSelect(this.value); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-nudge]'), function (b) {
      b.addEventListener('click', function () {
        if (!ed.cur) { edMsg('Prima tocca la tavola per posizionare il mirino.', true); return; }
        var d = b.getAttribute('data-nudge').split(',');
        edSetPoint(ed.cur.x + (+d[0]) * ed.step, ed.cur.y + (+d[1]) * ed.step);
      });
    });
    $('#ed-step').addEventListener('click', function () {
      ed.step = ed.step === 0.1 ? 0.5 : 0.1;
      this.textContent = 'passo ' + String(ed.step).replace('.', ',');
    });
    $('#ed-rminus').addEventListener('click', function () { ed.r = Math.max(0.3, ed1(ed.r - 0.1)); edRefresh(); });
    $('#ed-rplus').addEventListener('click', function () { ed.r = Math.min(5, ed1(ed.r + 0.1)); edRefresh(); });
    $('#ed-save').addEventListener('click', function () {
      if (!ed.sel) { edMsg('Scegli prima una stella dal menu.', true); return; }
      if (!ed.cur) { edMsg('Tocca la tavola per posizionare il mirino, poi salva.', true); return; }
      var o = edLoad(), l = Array.isArray(