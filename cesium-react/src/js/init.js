var sis2d, sis3d;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NDBmZTU3MC04M2NiLTQ2YWItODI1Zi0yODc3NzRjODk4YzAiLCJpZCI6MjQzMzYsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciLCJnYyJdLCJpYXQiOjE1ODUwNTA4MTF9.rGy_wHw1N_t2T6Z0JywCTpg7d-e2vCMPTi-SGyi7MqE';

$(window).on("load", function () {

    proj4.defs(
        "EPSG:5181",
        // "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
        "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    );
    proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

    ol.proj.proj4.register(proj4);

    console.log(ol.proj.get('EPSG:4326'));
    console.log(ol.proj.get('EPSG:5186'));
    console.log(ol.proj.get('EPSG:3857'));

    // 4326에서 5186으로 바꿔본다
    var epsg5186 = ol.proj.transform([126.46291354573967, 34.81619580981799], 'EPSG:4326', 'EPSG:5186');
    console.log(epsg5186) // [153365.05908124562, 99597.56384341588]

    // 위에서 얻은 5186을 3857로 바꿔본다
    var epsg3857 = ol.proj.transform(epsg5186, 'EPSG:5186', 'EPSG:3857');
    console.log(epsg3857); // [14081714.876307208, 3960392.400920103]

    // 위에서 얻은 3857을 4326으로 바꿔 최초 시작값과 일치하는지 확인해본다.
    var original = ol.proj.transform(epsg3857, 'EPSG:3857', 'EPSG:4326');
    console.log(original) //  [126.49819700000002, 33.489003999999994]

    sis2d = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'map',
        view: new ol.View({
            projection: 'EPSG:5186',
            center: ol.proj.transform([126.46291354573967, 34.81619580981799], 'EPSG:4326', 'EPSG:5186'), // EPSG:3857
            zoom: 16
        })
    });

    console.log(sis2d.getView().getProjection().getCode());

    sis3d = new olcs.OLCesium({
        map: sis2d,
    });


    var scene = sis3d.getCesiumScene();
    console.log(scene.primitives);
    scene.terrainProvider = Cesium.createWorldTerrain();
    sis3d.setEnabled(true);

    var tileset = new Cesium.Cesium3DTileset({
        url: '/cesium3dList/or3d/OR3D2_ATAT_cesium.json',
        maximumScreenSpaceError: 1
    });

    console.log(tileset);

    scene.primitives.add(tileset);


    // 지도 2D/3D 변경 이벤트
    document.getElementById('chgMap').addEventListener('click', setEnabled);
});

/**
 * fn - 지도 2D/3D 변경
 * @param e
 */
var setEnabled = function (e) {
    sis3d.setEnabled(!sis3d.getEnabled());
    if (sis3d.getEnabled()) {
        e.target.innerHTML = '3D'
    } else {
        e.target.innerHTML = '2D'
    }
};