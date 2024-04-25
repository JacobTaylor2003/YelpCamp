mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: coords,
      zoom: 12
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