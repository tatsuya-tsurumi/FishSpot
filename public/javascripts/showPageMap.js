mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', 
  style: 'mapbox://styles/mapbox/streets-v12', 
  center: spot.geometry.coordinates, 
  zoom: 9, 
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker({rotation: 45 })
        .setLngLat(spot.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({offset: 25})
          .setHTML(`<h4>${spot.title}</h4><p>${spot.location}</p>`)
        )
        .addTo(map);

        const language = new MapboxLanguage();
        map.addControl(language);
