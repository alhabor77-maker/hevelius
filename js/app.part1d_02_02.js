var SECTIONS = [
    ['descrizione_astronomica', 'La costellazione nel cielo'],
    ['mito', 'Storia e mito'],
    ['pleiadi', 'Le Pleiadi'],
    ['curiosita_culturali', 'Nella cultura popolare'],
    ['hevelius', 'La tavola di Hevelius']
  ];
  var SKIP_KEYS = { titolo: 1, nome: 1, id: 1 };

  /* ------------------------------------------------------------------ util */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  /* Modalità puntamento: attiva solo con ?edit=1 (vedi sezione in fondo) */
  function isEdit() { return qs('edit') === '1'; }
  function editQ() { return isEdit() ? '&edit=1' : ''; }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
