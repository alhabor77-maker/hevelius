1]].forEach(function (src) {
          if (src && typeof src === 'object') {
            Object.keys(src).forEach(function (k) { merged[k] = src[k]; });
          }
        });
        return merged;
      }),
      getJSON('data/hotspots.json'),
      Promise.all(TESTI_PARTS.map(getJSONText)).then(function (ts) {
        var merged = {};
        ts.forEach(function (t) {
          if (t && typeof t === 'object') { Object.keys(t).forEach(function (k) { merged[k] = t[k]; }); }
        });
        return [merged];
      }),
      Promise.all(FONTI_PARTS.map(getJSONText)).then(function (fs_) {
        return fs_.map(function (t) { try { return JSON.parse(t); } catch (e) { return null; } });
      })
    ];
    return Promise.all(jobs).then(function (r) {
      DATA.stelle = r[0];
      DATA.hotspots = r[1];
      var testi = {}, anyTesti = false;
      r[2].forEach(function (t) {
        if (t && typeof t === 'object') { anyTesti = true; Object.keys(t).forEach(function (k) { testi[k] = t[k]; }); }
      });
      DATA.testi = anyTesti ? testi : null;
      r[3].forEach(function (f) {
        if (f && Array.isArray(f.immagini)) DATA.fonti = DATA.fonti.concat(f.immagini);
      });
    });
  }

  function starsOf(cid) { return (DATA.stelle && DATA.stelle[cid]) || []; }
  var PLEIADI_SCHEDA = {
    id: 'pleiadi', nome: 'Pleiadi (M45)', bayer: 'Ammasso aperto \u00b7 Messier 45',
    magnitudine: '1,6 (complessiva)', distanza_al: 440,
