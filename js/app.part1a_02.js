ch dei file dati spezzati: unisce i pezzi in ordine e fa il parse */
  function getJSONText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }
  function fetchConcat(paths) {
    return Promise.all(paths.map(getJSONText)).then(function (ts) {
      return JSON.parse(ts.join(''));
    });
  }
  function partList(base, n) {
    var a = [], i;
    for (i = 1; i <= n; i++) a.push(base.replace('%d', i));
    return a;
  }
  var STELLE_PERSEO_PARTS = partList('data/stelle_perseo.part%d.json', 10);

  /* ------------------------------------------------------------------ config */
  var CONST = [
    { id: 'orione', nome: 'Orione', latino: 'Orion', tavola: 'Tavola QQ', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/1920px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/960px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', w: 1920, h: 1514,
