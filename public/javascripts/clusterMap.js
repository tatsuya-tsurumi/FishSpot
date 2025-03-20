mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'cluster-map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [139.692, 37.889],
        zoom: 4.5
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const language = new MapboxLanguage();
        map.addControl(language);

    map.on('load', () => {
        map.addSource('spots', {
            type: 'geojson',
            data: {
              features: spots
            },
            cluster: true,
            clusterMaxZoom: 14, 
            clusterRadius: 50 
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'spots',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    10, '#fca311',
                    20, '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20, 10,
                    30, 20,
                    40
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'spots',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
          }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'spots',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('spots').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        map.on('click', 'unclustered-point', (e) => {
          const {popupMarkup} = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            if (['mercator', 'equirectangular'].includes(map.getProjection().name)) {
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupMarkup)
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
    });
