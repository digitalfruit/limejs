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

    lime.style.setBorderRadius(el, [this.radius_*this.getQuality(), this.radius_*this.getQuality()]);

};

/**
 * @inheritDoc
 * @this {lime.RoundedRect}
 */
lime.Renderer.CANVAS.ROUNDEDRECT.draw = function(context) {
    //http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html

    var size = this.getSize(),
        fill = this.getFill(),
        frame = this.getFrame(),
        radius = this.getRadius(),
        x = frame.left,
        y = frame.top,
        width = frame.right - frame.left,
        height = frame.bottom - frame.top;

    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height,
        x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();

    context.clip();

    lime.Renderer.CANVAS.SPRITE.draw.call(this, context);
    
    if(this.stroke_){
        context.lineWidth*=2;
        context.stroke();
    }
    
    context.restore();
};
