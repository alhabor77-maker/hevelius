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
  function fetchMulti(paths) {
    return Promise.all(paths.map(getJSONText)).then(function (ts) {
      var txt = ts.join(''), n = txt.length, i = 0, out = {};
      function skip() { while (i < n && ' \n\r\t'.indexOf(txt.charAt(i)) >= 0) i++; }
      function endOfValue(start) {
        var depth = 0, j = start, instr = false, esc = false;
        while (j < n) {
          var ch = txt.charAt(j);
          if (instr) {
            if (esc) esc = false;
            else if (ch === '\\') esc = true;
            else if (ch === '"') instr = false;
          } else if (ch === '"') instr = true;
          else if (ch === '{' || ch === '[') depth++;
          else if (ch === '}' || ch === ']') {
            depth--;
            if (depth === 0) return j + 1;
          }
          j++;
        }
        return n;
      }
      skip();
      while (i < n) {
        var end = endOfValue(i);
        var val = null;
        try { val = JSON.parse(txt.slice(i, end)); } catch (e) { val = null; }
        if (val && typeof val === 'object') {
          Object.keys(val).forEach(function (k) {
            if (k === 'immagini' && Array.isArray(val[k]) && Array.isArray(out[k])) {
              out[k] = out[k].concat(val[k]);
            } else {
              out[k] = val[k];
            }
          });
        }
        i = end;
        skip();
        if (i < n && txt.charAt(i) === ',') { i++; skip(); }
      }
      return out;
    });
  }
  function partList(base, n) {
    var a = [], i;
    for (i = 1; i <= n; i++) a.push(base.replace('%d', i));
    return a;
  }
  var STELLE_PERSEO_PARTS = [];
  for (var _sp = 1; _sp <= 10; _sp++) { STELLE_PERSEO_PARTS.push('data/stelle_perseo.part' + _sp + '_01.json'); STELLE_PERSEO_PARTS.push('data/stelle_perseo.part' + _sp + '_02.json'); }

  /* ------------------------------------------------------------------ config */
  var CONST = [
    { id: 'orione', nome: 'Orione', latino: 'Orion', tavola: 'Tavola QQ', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/1920px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg/960px-Orion_constellation_-_Prodromus_astronomiae_1690_%285590584%29.jpg', w: 1920, h: 1514,
