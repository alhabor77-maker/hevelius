/* Hevelius – Firmamentum Sobiescianum · app.js
 * Nessun build step. Funziona con `python3 -m http.server` dalla cartella del sito.
 *
 * File dati (tutti relativi a ./data/):
 *   stelle.json + stelle_perseo.json  { costellazione_id: [ {id, nome, bayer, origine_nome, magnitudine, spettro, distanza_al, curiosita, fonte_url} ] }
 *                                     caricati insieme e uniti: 6+6 = 12 costellazioni (perseo, andromeda, cassiopea, cefeo, balena, pegaso)
 *   hotspots.json                { costellazione_id: [ {star_id, x_pct, y_pct, r_pct, [label], [group]} ] }
 *                                x_pct/y_pct = centro in % di larghezza/altezza immagine; r_pct = raggio in % della LARGHEZZA.
 *   testi_orione_canemin.json    { orione:{titolo, descrizione_astronomica, mito, hevelius, ...}, cane_minore:{...} }
 *   testi_toro_scorpione.json    { toro:{..., pleiadi}, scorpione:{...} }
 *   testi_perseo_gruppo.json     { perseo, andromeda, cassiopea, cefeo, balena, pegaso } (5 sezioni ciascuno)
 *   fonti_*.json                 { immagini:[ {file, costellazione, titolo_tavola, licenza, url_fonte_pagina|pagina_commons, ...} ] }
 *                                (incluso fonti_perseo_gruppo.json per le 6 nuove costellazioni)
 * I file mancanti non bloccano il sito: la parte corrispondente mostra un avviso.
 */
(function () {
  'use strict';
  /* fet