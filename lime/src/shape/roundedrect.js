goog.provide('lime.Renderer.CANVAS.ROUNDEDRECT');
goog.provide('lime.Renderer.DOM.ROUNDEDRECT');
goog.provide('lime.RoundedRect');


goog.require('lime.Renderer.CANVAS.SPRITE');
goog.require('lime.Renderer.DOM.SPRITE');
goog.require('lime.Sprite');
goog.require('lime.style');

/**
 * Rounded rectangle
 * @constructor
 * @extends lime.Sprite
 */
lime.RoundedRect = function() {
    lime.Sprite.call(this);

    this.setRadius(5);
};
goog.inherits(lime.RoundedRect, lime.Sprite);

/**
 * Common name for RoundedRect objects
 * @type {string}
 */
lime.RoundedRect.prototype.id = 'roundedrect';

/** @inheritDoc */
lime.RoundedRect.prototype.supportedRenderers = [
    lime.Renderer.DOM.SPRITE.makeSubRenderer(lime.Renderer.DOM.ROUNDEDRECT),
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.ROUNDEDRECT)
];

/**
 * Return corner radius
 * @return {number} Radius.
 */
lime.RoundedRect.prototype.getRadius = function() {
    return this.radius_;
};

/**
 * Return true if radius is in percentage units
 * @return {boolean} Unit is percentage?
 */
lime.RoundedRect.prototype.getUnitPercentage = function() {
    return this.unitPercentage_;
};

/**
 * Sets the corner radius for object
 * @param {number} value Radius.
 * @param {boolean=} opt_percentage use percentage units.
 */
lime.RoundedRect.prototype.setRadius = function(value, opt_percentage) {
    this.unitPercentage_ = opt_percentage || false;
    this.radius_ = value;
    return this;
};

/**
 * @inheritDoc
 * @this {lime.RoundedRect}
 */
lime.Renderer.DOM.ROUNDEDRECT.draw = function(el) {
    var size = this.getSize();

    lime.Renderer.DOM.SPRITE.draw.call(this, el);

    lime.style.setBorderRadius(el, [this.radius_, this.radius_]);

};

/**
 * Draw the shape path in canvas
 * @private
 */
lime.RoundedRect.prototype.makeCanvasPath_ = function(context, x, y, width, height, radius) {
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.restore();
};

/**
 * @inheritDoc
 * @this {lime.RoundedRect}
 */
lime.Renderer.CANVAS.ROUNDEDRECT.draw = function(context) {
    //http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
    var fill = this.getFill(),
        stroke = this.getStroke(),
        frame = this.getFrame(),
        radius = this.getRadius(),
        x = frame.left,
        y = frame.top,
        width = frame.right - frame.left,
        height = frame.bottom - frame.top;

    if (fill !== null) {
        this.makeCanvasPath_(context, x, y, width, height, radius);
        fill.setCanvasStyle(context, this);

        if (!(fill instanceof lime.fill.Image)) {
            context.fill();
        }
    }

    if (stroke !== null) {
        this.makeCanvasPath_(context, x + stroke.width_ / 2, y + stroke.width_ / 2, width - stroke.width_, height - stroke.width_, radius - stroke.width_ / 2);
        stroke.setCanvasStyle(context, this);
        context.stroke();
    }
};
