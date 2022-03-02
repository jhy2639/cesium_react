(function (window, $) {
    "use strict";

    window.sis3dMap = function (sis2dMap, props) {
        this._init(sis2dMap, props);
    };

    sis3dMap.prototype = {
        map: null,

        _init: function (sis2dMap, props) {
            if (!sis2dMap) {
                alert("2D 지도가 생성되지 않았습니다.");
                return false;
            }
            this._setInitConfig(sis2dMap, props); // 초기설정
        },

        // 초기 설정
        _setInitConfig: function (sis2dMap, props) {
            // 속성값 설정
            this.extendProps(props);

            // 지도 생성
            this._create3dMap(sis2dMap);
        },

        // 속성값 설정
        extendProps: function (props) {
            this.props = $.extend({}, this.props, props);
        },

        _create3dMap: function (sis2dMap) {
            this.map = new olcs.OLCesium({
                map: sis2dMap.map
            })
        },
    };

})(window, jQuery);