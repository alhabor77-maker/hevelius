], ss[3], ss[4], ss[5], ss[6], ss[7], ss[8], ss[9], ss[10], ss[11], ss[12], ss[13], ss[14], ss[15], ss[16], ss[17], ss[18], ss[19]].forEach(function (src) {
          if (src && typeof src === 'object') {
            Object.keys(src).forEach(function (k) { merged[k] = src[k]; });
          }
        });
        return merged;
      }),
      fetchConcat(['data/hotspots_01.json', 'data/hotspots_02.json']),
      fetchMulti(TESTI_PARTS),
      fetchMulti(FONTI_PARTS)
    ];
    return Promise.all(jobs).then(function (r) {
      DATA.stelle = r[0];
      DATA.hotspots = r[1];
      DATA.testi = (r[2] && typeof r[2] === 'object' && Object.keys(r[2]).length) ? r[2] : null;
      if (r[3] && Array.isArray(r[3].immagini)) DATA.fonti = DATA.fonti.concat(r[3].immagini);
    });
  }

  function starsOf(cid) {
      var v = (DATA.stelle && DATA.stelle[cid]) || [];
      if (Array.isArray(v)) return v;
      if (v && typeof v === 'object') {
        return Object.keys(v).map(function (k) { return v[k]; });
      }
      return [];
    }
  var PLEIADI_SCHEDA = {
    id: 'pleiadi', nome: 'Pleiadi (M45)', bayer: 'Ammasso aperto \u00b7 Messier 45',
    magnitudine: '1,6 (complessiva)', distanza_al: 440,
