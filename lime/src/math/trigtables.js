goog.provide('lime.math.TrigTable');

lime.math.TrigTable.init = function () {

    var len = lime.math.TrigTable.segments_;

    var sine = lime.math.TrigTable.sin_;
    var cosine = lime.math.TrigTable.cos_;

    var twoPie = 2 * Math.PI;
    var increment = twoPie / len;
    var curvalue = 0;

    for (var i = 0; i < len; ++i) {

        sine[i]       = Math.sin(curvalue);
        cosine[i]     = Math.cos(curvalue);

        curvalue += increment;
    }
};

lime.math.TrigTable.segments_ = 4000;

lime.math.TrigTable.sin_ = [];
lime.math.TrigTable.cos_ = [];

lime.math.TrigTable.twoPie_ = 2 * Math.PI;
lime.math.TrigTable.radToDeg = 360 / lime.math.TrigTable.twoPie_;


lime.math.TrigTable.getSine = function (deg) {

    //var index = lime.math.TrigTable.getIndex(deg);

    // --- DUPLICATION for speed, these functions get call A LOT!
    while (deg < 0) {
        deg += 360;
    }

    while (deg > lime.math.TrigTable.segments_) {
        deg -= 360;
    }

    var segments = lime.math.TrigTable.segments_;
    var factor = segments / 360 ;

    var index = parseInt(Math.floor(deg * factor), 10);
    // --- END DUPLICATION

    return lime.math.TrigTable.sin_[index];
};

lime.math.TrigTable.getSineFromRadians = function (rad) {
    var deg = lime.math.TrigTable.radToDeg * rad;
    return lime.math.TrigTable.getSine(deg);
};

lime.math.TrigTable.getCosine = function (deg) {

    // --- DUPLICATION for speed, these functions get call A LOT!
    while (deg < 0) {
        deg += 360;
    }

    while (deg > lime.math.TrigTable.segments_) {
        deg -= 360;
    }

    var segments = lime.math.TrigTable.segments_;
    var factor = segments / 360 ;

    var index = parseInt(Math.floor(deg * factor), 10);
    // --- END DUPLICATION

    return lime.math.TrigTable.cos_[index];
};

lime.math.TrigTable.getCosineFromRadians = function (rad) {
    var deg = lime.math.TrigTable.radToDeg * rad;
    return lime.math.TrigTable.getCosine(deg);
};

lime.math.TrigTable.init();