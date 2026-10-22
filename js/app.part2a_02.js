
  function renderFooter() {
    var el = $('#site-footer');
    if (!el) return;
    var credits = CONST.map(function (c) {
      var f = fonteOf(c), url = fonteUrl(f);
      var titolo = f && f.titolo_tavola ? f.titolo_tavola : (c.tavola + ' \u2013 ' + c.latino);
      var lic = f && f.licenza ? f.licenza : 'Pubblico dominio';
      var prov = f && (f.provenienza_scansione || f.istituzione_origine) ? f.provenienza_scansione || f.istituzione_ori