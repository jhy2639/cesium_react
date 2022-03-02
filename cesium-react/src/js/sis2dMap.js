(function (window, $) {
    "use strict";

    window.sis2dMap = function (mapId, props) {
        this.mapId = mapId;
        this._init(mapId, props);
    };

    sis2dMap.prototype = {
        mapId: "",
        map2d: null,
        view: null,

        props: {
            crsCode: "EPSG:5181",
            geoserverCrsCode: "EPSG:5186",
            maxZoom: 19,
            minZoom: 0,
            zoom: 6,
            resolution: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
            // extent : [14107401.797716115, 4168822.5248261387, 14145180.944550237, 4200277.126940449],
            center: [14117752.785029236, 4185572.024391857] //지도 센터 좌표
        },

        /**
         * 지도 생성
         * @param mapId
         * @param props
         * @returns {boolean}
         * @private
         */
        _init: function (mapId, props) {
            if (!mapId) {
                alert("지도ID를 지정하여 주세요");
                return false;
            }
            this._setInitConfig(props); // 초기설정
        },

        /**
         * 지도 초기 설정
         * @param props
         * @private
         */
        _setInitConfig: function (props) {
            this.extendProps(props); // 속성값 설정
            this._setProj4(); // 좌표계 설정
            this._create2dMap(); // 지도 생성
            if(this.props.baseMap) {
                this._addBaseMap();
            }
        },

        /**
         * 속성값 설정
         * @param props
         */
        extendProps: function (props) {
            this.props = $.extend({}, this.props, props);
        },

        /**
         * 좌표계 설정
         * @private
         */
        _setProj4: function () {
            proj4.defs(
                "EPSG:5181",
                // "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"
                "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
            );
            proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

            ol.proj.proj4.register(proj4);
        },

        setCenter: function (coord, coordEpsg, zoom) {
            if (!zoom) zoom = 10;
            this.view.setCenter(ol.proj.transform(coord, coordEpsg, this.props.crsCode));
            this.view.setZoom(zoom);
        },

        _create2dMap: function () {
            this.map2d = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                target: this.mapId,
                view: new ol.View({
                    center: ol.proj.transform([25, 20], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 3
                }),
                controls: ol.control.defaults({
                    attribution: false,
                    collapsible: false,
                    zoom: true
                }).extend([
                    new ol.control.ZoomSlider(),
                    new ol.control.ScaleLine({
                        units: "metric",
                        bar: true,
                        minWidth: 140,
                    })]),
                interactions: ol.interaction.defaults({
                    dragPan: false,
                    doubleClickZoom: false,
                    mouseWheelZoom: false
                }).extend([new ol.interaction.DragPan({
                    kinetic: false
                }), new ol.interaction.MouseWheelZoom({
                    duration: 0
                })])
            });

            this.view = this.map2d.getView();

            this.map2d.getViewport().addEventListener("contextmenu", function(e) {
                e.preventDefault();
            });
        },

        _addBaseMap: function() {
            this._addDaum(true);
        },

        _addDaum: function(visible) {
            var config = this.getBaseMap("daum");

            var resolutions = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];
            var extent = config.extent;
            var origin = config.origin;
            var projection = new ol.proj.Projection({
                code: config.projection,
                extent: extent,
                units: 'm'
            });

            // define tile layer
            this.daumMap = new ol.layer.Tile({
                id: 'Daum',
                title: 'Daum Street Map',
                visible: visible,
                type: 'base',
                source: new ol.source.XYZ({
                    projection: projection,
                    tileSize: 256,
                    minZoom: 0,
                    maxZoom: resolutions.length - 1,
                    tileGrid: new ol.tilegrid.TileGrid({
                        origin: origin,
                        resolutions: resolutions
                    }),
                    tileUrlFunction: function (tileCoord, pixelRatio, projection) {
                        if (tileCoord == null) return undefined;
                        if (tileCoord[0] >= 14) return undefined;
                        var s = Math.floor(Math.random() * 4); // 0 ~ 3
                        var z = resolutions.length - tileCoord[0];
                        var x = tileCoord[1];
                        var y = tileCoord[2] + 1;

                        return "http://map" + s + ".daumcdn.net/map_2d/1810uis/L" + z + "/" + -y + "/" + x + ".png";
                    }
                })
            });

            this.map2d.addLayer(this.daumMap);
        },

        getBaseMap: function (id) {
            var baseMap;

            if (id.toLowerCase() == "vworld") {
                baseMap = {
                    id: "VWorld",
                    name: "VWorld",
                    korName: "브이월드",
                    projection: "EPSG:3857",
                    tileSize: 256,
                    center: [14121043.79, 4185661.96],
                    extent: [14098021.61, 4170799.78, 14140057.41, 4199108.25],
//					resolutions : [38.218514142588134, 19.109257071294067, 9.554628535647034, 4.777314267823517, 2.3886571339117584, 1.1943285669558792, 0.5971642834779396, 0.2985821417389698, 0.1492910708694849, 0.0746455354347425],
                    resolutions: [2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758],
//					resolutions : [ 38.21851414258813, 76.43702828517625, 152.8740565703525, 305.748113140705, 611.49622628141, 1222.99245256282, 2445.98490512564 ],
                };
            } else if (id.toLowerCase() == "daum") {
                baseMap = {
                    id: "Daum",
                    name: "Daum",
                    korName: "다음",
                    projection: "EPSG:5181",
                    tileSize: 256,
                    center: [228739.43298, 519133.99660], //철원
                    // center: [186469.67, 184868.86],
                    origin: [-30000, -60000],
                    extent: [-30000 - Math.pow(2, 19) * 4, -60000, -30000 + Math.pow(2, 19) * 5, -60000 + Math.pow(2, 19) * 5],
                    resolutions: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125],
                };
            } else if (id.toLowerCase() == "google") {
                baseMap = {
                    id: "Google",
                    name: "Google",
                    korName: "구글",
                    projection: "EPSG:3857",
                };
            } else if (id.toLowerCase() == "naver") {
                baseMap = {
                    id: "Naver",
                    name: "Naver",
                    korName: "네이버",
                    projection: "EPSG:5179",
                    tileSize: 256,
                    center: [940937.89, 1685177.30],
                    extent: [90112, 1192896, 1990673, 2765760],
                    resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25]
                };
            }

            return baseMap;
        },
    };

})(window, jQuery);