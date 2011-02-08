goog.provide('lime.CanvasContext');
goog.provide('lime.Renderer.CANVAS.CANVASCONTEXT');


goog.require('goog.array');
goog.require('goog.math.Coordinate');
goog.require('lime.Renderer.CANVAS.SPRITE');
goog.require('lime.Sprite');

/**
 * Custom Canvas context
 * @constructor
 * @extends lime.Sprite
 */
lime.CanvasContext = function() {
    lime.Sprite.call(this);

};
goog.inherits(lime.CanvasContext, lime.Sprite);

/**
 * Common name for custom canvas context objects
 * @type {string}
 * @const
 */
lime.CanvasContext.prototype.id = 'canvas';

/** @inheritDoc */
lime.CanvasContext.prototype.supportedRenderers = [
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.CANVASCONTEXT)
];

lime.CanvasContext.prototype.draw = goog.nullFunction;


/**
 * @inheritDoc
 * @this {lime.Polygon}
 */
lime.Renderer.CANVAS.CANVASCONTEXT.draw = function(context) {

    lime.Renderer.CANVAS.SPRITE.draw.call(this, context);
    
    this.draw(context);

};
