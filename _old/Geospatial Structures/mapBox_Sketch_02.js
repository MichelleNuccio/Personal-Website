mapboxgl.accessToken = MAPBOX_TOKEN;
const map2 = new mapboxgl.Map({ container: 'mapbox-container-2', style: 'mapbox://styles/mapbox/light-v11', ...nycView });
map2.addControl(new mapboxgl.NavigationControl(), 'top-right');

const lineData = { type: 'FeatureCollection', features: [
  { type: 'Feature', properties: { name: 'Hudson waterfront' }, geometry: { type: 'LineString', coordinates: [[-74.019,40.700],[-74.012,40.735],[-74.010,40.772],[-73.998,40.805]] } },
  { type: 'Feature', properties: { name: 'Brooklyn Bridge crossing' }, geometry: { type: 'LineString', coordinates: [[-74.0047,40.7086],[-73.9934,40.7033]] } }
]};
const regionData = { type: 'FeatureCollection', features: [
  { type: 'Feature', properties: { name: 'Central Park' }, geometry: { type: 'Polygon', coordinates: [[[-73.9819,40.7681],[-73.9580,40.8006],[-73.9497,40.7968],[-73.9737,40.7644],[-73.9819,40.7681]]] } },
  { type: 'Feature', properties: { name: 'Times Square district' }, geometry: { type: 'Polygon', coordinates: [[[-73.989,40.755],[-73.982,40.755],[-73.982,40.761],[-73.989,40.761],[-73.989,40.755]]] } }
]};

map2.on('load', () => {
  map2.addSource('routes', { type: 'geojson', data: lineData });
  map2.addLayer({ id: 'routes', type: 'line', source: 'routes', paint: { 'line-color': '#1261a0', 'line-width': 4 } });
  map2.addSource('regions', { type: 'geojson', data: regionData });
  map2.addLayer({ id: 'regions', type: 'fill', source: 'regions', paint: { 'fill-color': '#e15241', 'fill-opacity': .45, 'fill-outline-color': '#8c241b' } });
  ['routes', 'regions'].forEach(id => map2.on('click', id, e => new mapboxgl.Popup().setLngLat(e.lngLat).setText(e.features[0].properties.name).addTo(map2)));
});

function toggleLayer(id, button, hideLabel, showLabel) {
  const visible = map2.getLayoutProperty(id, 'visibility') !== 'none';
  map2.setLayoutProperty(id, 'visibility', visible ? 'none' : 'visible');
  button.textContent = visible ? showLabel : hideLabel;
}
const linesButton = document.querySelector('#toggleLines');
const regionsButton = document.querySelector('#toggleRegions');
linesButton.addEventListener('click', () => toggleLayer('routes', linesButton, 'Hide lines', 'Show lines'));
regionsButton.addEventListener('click', () => toggleLayer('regions', regionsButton, 'Hide regions', 'Show regions'));
document.querySelector('#resetMap2').addEventListener('click', () => map2.flyTo(nycView));
