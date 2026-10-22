(function(){
  var header = document.getElementById('site-header');
  if (!header) return;

  /* Guard pagina home: il menu non si nasconde MAI in home (griglia + ricerca).
     Indipendente e affidabile: legge l'attributo statico del markup
     (body[data-page]), non classi aggiunte a runtime dal JS dell'app. */
  if (document.body.getAttribute('data-page') === 'home') {
    header.classList.remove('header-hidden');
    return; /* nessun listener di scroll in home */
  }

  /* Guard modalità puntamento (?edit=1): l'app non aggiunge mai .edit-mode al body,
     quindi il vecchio controllo sulla classe non scattava mai; il controllo sull'URL
     è affidabile. Mantenuto anche il check della classe per retrocompatibilità. */
  if (location.search.indexOf('edit=1') !== -1 ||
      document.body.classList.contains('edit-mode')) return;

  var lastY = window.scrollY;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (y > lastY && y > 120) header.classList.add('header-hidden');
    else header.classList.remove('header-hidden');
    lastY = y;
  }, {passive: true});
})();
