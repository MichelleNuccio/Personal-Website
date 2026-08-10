mapboxgl.accessToken = MAPBOX_TOKEN;
const map3 = new mapboxgl.Map({ container: 'mapbox-container-3', style: 'mapbox://styles/mapbox/light-v11', ...nycView });
map3.addControl(new mapboxgl.NavigationControl(), 'top-right');
const status = document.querySelector('#dataStatus');
let dataBounds;

map3.on('load', async () => {
  try {
    const response = await fetch('manhattan.geojson');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    map3.addSource('neighborhoods', { type: 'geojson', data });
    map3.addLayer({ id: 'neighborhoods-fill', type: 'fill', source: 'neighborhoods', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': .58 } });
    map3.addLayer({ id: 'neighborhoods-border', type: 'line', source: 'neighborhoods', paint: { 'line-color': '#3f2667', 'line-width': 2 } });
    map3.addLayer({ id: 'neighborhoods-label', type: 'symbol', source: 'neighborhoods', layout: { 'text-field': ['get','name'], 'text-size': 12 }, paint: { 'text-halo-color': '#fff', 'text-halo-width': 2 } });
    dataBounds = new mapboxgl.LngLatBounds();
    const extendBounds = coordinates => {
      if (typeof coordinates[0] === 'number') dataBounds.extend(coordinates);
      else coordinates.forEach(extendBounds);
    };
    data.features.forEach(feature => extendBounds(feature.geometry.coordinates));
    map3.fitBounds(dataBounds, { padding: 55 });
    map3.on('click', 'neighborhoods-fill', e => new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(`<strong>${e.features[0].properties.name}</strong>`).addTo(map3));
    status.textContent = `${data.features.length} neighborhoods loaded.`;
  } catch (error) {
    status.textContent = `Cannot load manhattan.geojson (${error.message}). Start a local web server.`;
  }
});

const filterLayers = ['neighborhoods-fill', 'neighborhoods-border', 'neighborhoods-label'];
document.querySelector('#searchFeature').addEventListener('input', event => {
  const term = event.target.value.trim().toLowerCase();
  const filter = term ? ['in', term, ['downcase', ['get', 'name']]] : null;
  filterLayers.forEach(id => map3.getLayer(id) && map3.setFilter(id, filter));
});
document.querySelector('#resetFilters').addEventListener('click', () => {
  const input = document.querySelector('#searchFeature'); input.value = ''; input.dispatchEvent(new Event('input'));
});
document.querySelector('#fitToData').addEventListener('click', () => dataBounds && map3.fitBounds(dataBounds, { padding: 55 }));
