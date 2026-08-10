// Incolla qui sotto il tuo public token: https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';
mapboxgl.accessToken = MAPBOX_TOKEN;

const nycView = { center: [-74.006, 40.742], zoom: 11.2 };
const map1 = new mapboxgl.Map({
  container: 'mapbox-container-1',
  style: 'mapbox://styles/mapbox/light-v11',
  ...nycView
});
map1.addControl(new mapboxgl.NavigationControl(), 'top-right');
map1.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

[
  ['Times Square', -73.9855, 40.7580],
  ['Central Park', -73.9654, 40.7829],
  ['Brooklyn Bridge', -73.9969, 40.7061]
].forEach(([name, lng, lat]) => {
  new mapboxgl.Marker({ color: '#d12c2c' })
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(name))
    .addTo(map1);
});

document.querySelector('#zoomIn').addEventListener('click', () => map1.zoomIn());
document.querySelector('#zoomOut').addEventListener('click', () => map1.zoomOut());
document.querySelector('#resetMap1').addEventListener('click', () => map1.flyTo(nycView));
