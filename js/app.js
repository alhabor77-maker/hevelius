/* Hevelius - loader di app.js
 * Il codice dell'applicazione e' diviso in piu' parti (js/app.part1.js, js/app.part2.js, ...)
 * che, concatenate nell'ordine, formano il sorgente completo. Il loader le carica in modo
 * sincrono e le esegue come un unico script, cosi' le pagine HTML restano invariate.
 */
(function () {
  var parts = ["js/app.part1.js", "js/app.part2.js", "js/app.part3.js", "js/app.part4.js", "js/app.part5.js", "js/app.part6.js"];
  var code = '';
  for (var i = 0; i < parts.length; i++) {
    var x = new XMLHttpRequest();
    x.open('GET', parts[i], false);
    x.send();
    if (x.status !== 200 && x.status !== 0) { throw new Error('Impossibile caricare ' + parts[i]); }
    code += x.responseText;
  }
  var s = document.createElement('script');
  s.text = code;
  document.head.appendChild(s);
})();
