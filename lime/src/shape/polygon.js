goog.provide('lime.Polygon');
goog.provide('lime.Renderer.CANVAS.POLYGON');


goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('lime.Renderer.CANVAS.SPRITE');
goog.require('lime.Sprite');

/**
 * Polygon shaped textured object
 * @param {Array.<goog.math.Coodinate>} points Polygon points.
 * @constructor
 * @extends lime.Sprite
 */
lime.Polygon = function(points) {
    lime.Sprite.call(this);

    this.setPoints.apply(this, arguments);
};
goog.inherits(lime.Polygon, lime.Sprite);

/**
 * Common name for polygon objects
 * @type {string}
 */
lime.Polygon.prototype.id = 'polygon';

/** @inheritDoc */
lime.Polygon.prototype.supportedRenderers = [
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.POLYGON)
];

/**
 * Returns array of points that define the polygon
 * @return {Array.<goog.math.Coordinate>} Array of polygon points.
 */
lime.Polygon.prototype.getPoints = function() {
    return this.points_;
};

/**
 * Sets points that define the polygon. Also accepts floats.
 * @param {Array.<goog.math.Coodinate>} points Polygon points.
 * @return {lime.Polygon} object itself.
 */
lime.Polygon.prototype.setPoints = function(points) {
    this.points_ = [];
    this.addPoints.apply(this, arguments);
    return this;
};

/**
 * Adds points to current polygon points. Also accepts floats.
 * @param {Array.<goog.math.Coodinate>} points Polygon points.
 * @return {lime.Polygon} object itself.
 */
lime.Polygon.prototype.addPoints = function(points) {
    var points = goog.array.toArray(arguments);
    if (!points.length) return;

    if (points[0] instanceof goog.math.Coordinate) {
        goog.array.forEach(points, function(p) {
           this.addPoint(p);
        },this);
    }
    else {
        for (var i = 1; i < points.length; i += 2) {
            this.addPoint(new goog.math.Coordinate(points[i - 1], points[i]));
        }
    }
    return this;
};

/**
 * Adds a point to current polygon points.
 * @param {goog.math.Coordinate} coord Point to add.
 * @return {lime.Polygon} object itself.
 */
lime.Polygon.prototype.addPoint = function(coord) {
    if (!this.points_.length) {
        this.minX = this.maxX = coord.x;
        this.minY = this.maxY = coord.y;
    }
    else {
        this.minX = Math.min(coord.x, this.minX);
        this.minY = Math.min(coord.y, this.minY);
        this.maxX = Math.max(coord.x, this.maxX);
        this.maxY = Math.max(coord.y, this.maxY);
    }

    this.points_.push(coord);
    return this;
};

/** @inheritDoc */
lime.Polygon.prototype.getSize = function() {
    return new goog.math.Size(this.maxX - this.minX, this.maxY - this.minY);
};

/** @inheritDoc */
lime.Polygon.prototype.getAnchorPoint = function() {
    var size = this.getSize();
    return new goog.math.Vec2(
        -this.minX / size.width, -this.minY / size.height);
};

/**
 * @inheritDoc
 */
lime.Polygon.prototype.hitTest = function(e) {
    var p = this.getPoints(),
        plen = p.length,
        coord = this.screenToLocal(e.screenPosition),
        inPoly = false;

    if (plen > 2) {
        var i, j, c = 0;

        for (i = 0, j = plen - 1; i < plen; j = i++) {
            if (((p[i].y > coord.y) != (p[j].y > coord.y)) &&
                (coord.x < (p[j].x - p[i].x) * (coord.y - p[i].y) /
                    (p[j].y - p[i].y) + p[i].x)) {
                    inPoly = !inPoly;
                }
        }
    }

    return inPoly;
};

/**
 * @inheritDoc
 * @this {lime.Polygon}
 */
lime.Renderer.CANVAS.POLYGON.draw = function(context) {


    var size = this.getSize(), fill = this.fill_;

    var pt = this.getPoints();
    

    if (pt.length > 2) {

       context.save();
       context.beginPath();
       context.moveTo(pt[0].x, pt[0].y);

       for (var i = 1; i < pt.length; i++) {
           context.lineTo(pt[i].x, pt[i].y);

       }

       context.closePath();
       if(fill)
       context.fillStyle = fill.str;


       context.clip();



    lime.Renderer.CANVAS.SPRITE.draw.call(this, context);
    
    if(this.stroke_){
        context.lineWidth*=2;
        context.stroke();
    }
    
    context.restore();
    }
};
