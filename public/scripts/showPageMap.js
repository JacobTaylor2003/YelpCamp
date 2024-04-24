mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10', // Specify the base map style
      center: coords, // Starting position [lng, lat]
      zoom: 12 // Starting zoom level
  });
  map.addControl(new mapboxgl.NavigationControl())
  new mapboxgl.Marker()
  .setLngLat(coords)
  .addTo(map)
  .setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h3>${camp.title}</h3><p>${camp.location}</p>`
    )
  )
  .setLngLat(coords)
  .addTo(map);
console.log(camp)