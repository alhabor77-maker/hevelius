irino">passo 0,1</button>' +
      '<button type="button" class="btn" id="ed-rminus" aria-label="Raggio minore">r \u2212</button>' +
      '<button type="button" class="btn" id="ed-rplus" aria-label="Raggio maggiore">r +</button>' +
      '</div></details>' +
      '<div class="ed-fallback" id="ed-fallback" hidden><p>Copia non riuscita in automatico: tieni premuto sul testo, scegli \u201cSeleziona tutto\u201d e poi \u201cCopia\u201d.</p>' +
      '<textarea id="ed-ta" readonly rows="5" aria-label="Testo JSON da copiare"></textarea></div>' +
      '<details class="ed-details"><summary id="ed-count">Punti salvati: 0</summary><ul id="ed-list" class="ed-list"></ul></details>' +
      '</div>';
    var toolbar = $('.toolbar');
    if (toolbar) toolbar.insertAdjacentHTML('beforebegin', html);
    plate.insertAdjacentHTML('beforeend', '<div class="ed-layer" id="ed-layer"><div id="ed-dots"></div><div class="ed-ring" id="ed-ring" hidden></div><div class="ed-cross" id="ed-cross" hidden></div></div>');
    plate.classList.add('ed-plate');

    /* tap sulla tavola = posiziona il mirino (click non parte se il dito ha trascinato per scorrere) */
    plate.addEventListener('click', function (e) {
      var rc = plate.getBoundingClientRect();
      if (!rc.width || !rc.height) re