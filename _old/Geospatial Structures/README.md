# Geospatial Structures

Esercizio Mapbox GL JS basato sul tutorial del corso.

## Avvio

1. Crea un public access token in <https://account.mapbox.com/access-tokens/>.
2. Sostituisci `YOUR_MAPBOX_ACCESS_TOKEN` in `mapBox_Sketch_01.js`.
3. Da questa cartella avvia un server locale, per esempio `python -m http.server 8000`.
4. Apri <http://localhost:8000> nel browser.

Il server locale è necessario perché il terzo esempio carica `manhattan.geojson` tramite `fetch()`.
