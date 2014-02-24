goog.provide('lime.Circle');
goog.provide('lime.Renderer.CANVAS.CIRCLE');
goog.provide('lime.Renderer.DOM.CIRCLE');


goog.require('lime.Renderer.CANVAS.SPRITE');
goog.require('lime.Renderer.DOM.SPRITE');
goog.require('lime.Sprite');
goog.require('lime.style');

/**
 * Circle or ellipse shaped tectured object
 * @constructor
 * @extends lime.Sprite
 */
lime.Circle = function() {
    lime.Sprite.call(this);


};
goog.inherits(lime.Circle, lime.Sprite);

/**
 * Common name for circle objects
 * @type {string}
 */
lime.Circle.prototype.id = 'circle';

/** @inheritDoc */
lime.Circle.prototype.supportedRenderers = [
    lime.Renderer.DOM.SPRITE.makeSubRenderer(lime.Renderer.DOM.CIRCLE),
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.CIRCLE)
];

/**
 * @inheritDoc
 */
lime.Circle.prototype.hitTest = function(e) {
    var coord = this.screenToLocal(e.screenPosition);
    var s = this.size_, ap = this.anchorPoint_,
        a = s.width * .5, b = s.height * .5,
        x = coord.x - s.width * (.5 - ap.x),
        y = coord.y - s.height * (.5 - ap.y);

    if ((x * x) / (a * a) + (y * y) / (b * b) < 1) {
        e.position = coord;
        return true;
    }
    return false;
};

/**
 * @inheritDoc
 * @this {lime.Circle}
 */
lime.Renderer.DOM.CIRCLE.draw = function(el) {
    var size = this.getSize();

    lime.Renderer.DOM.SPRITE.draw.call(this, el);

    lime.style.setBorderRadius(el, size.width * .5, size.height * .5);
  //  el.style['-webkit-border-radius'] = el.style['MozBorderRadius'] =
  //      size.width*.5+'px / '+size.height*.5+'px';

};

/**
 * Draw the shape path in canvas
 * @private
 */
lime.Circle.prototype.makeCanvasPath_ = function(context, cx, cy) {
    var ap = this.getAnchorPoint();
    context.save();
    context.scale(cx, cy);
    context.translate(1 - 2 * ap.x, 1 - 2 * ap.y);
    context.beginPath();
    context.arc(0, 0, 1, 0, 2 * Math.PI, false);
    context.closePath();
    context.restore();
};

/**
 * @inheritDoc
 * @this {lime.Circle}
 */
lime.Renderer.CANVAS.CIRCLE.draw = function(context) {
    var fill = this.getFill(),
        stroke = this.getStroke(),
        frame = this.getFrame(),
        cx = (frame.right - frame.left) * .5,
        cy = (frame.bottom - frame.top) * .5;

    if (fill !== null) {
        this.makeCanvasPath_(context, cx, cy);
        fill.setCanvasStyle(context, this);

        if (!(fill instanceof lime.fill.Image)) {
            context.fill();
        }
    }

    if (stroke !== null) {
        this.makeCanvasPath_(context, cx - stroke.width_ / 2, cy - stroke.width_ / 2);
        stroke.setCanvasStyle(context, this);
        context.stroke();
    }
};
