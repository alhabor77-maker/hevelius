(function(){
  var lastY = window.scrollY, header = document.getElementById('site-header');
  if (!header) return;
  if (document.body.classList.contains('edit-mode')) return;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if (y > lastY && y > 120) header.classList.add('header-hidden');
    else header.classList.remove('header-hidden');
    lastY = y;
  }, {passive: true});
})();
