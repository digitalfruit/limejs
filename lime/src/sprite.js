goog.provide('lime.Renderer.CANVAS.SPRITE');
goog.provide('lime.Renderer.DOM.SPRITE');
goog.provide('lime.Sprite');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.math.Size');
goog.require('lime');
goog.require('lime.Node');
goog.require('lime.fill.Color');
goog.require('lime.fill.Fill');
goog.require('lime.fill.Image');

/**
 * Rectangural textured object
 * @constructor
 * @extends lime.Node
 */
lime.Sprite = function() {

    lime.Node.call(this);

    /**
     * Fill object used while drawing
     * @type {lime.Fill}
     * @private
     */
    this.fill_ = null;


    this.stroke_ = null;


};
goog.inherits(lime.Sprite, lime.Node);

/**
 * Common name for sprite objects
 * @type {string}
 * @const
 */
lime.Sprite.prototype.id = 'sprite';

/** @inheritDoc */
lime.Sprite.prototype.supportedRenderers = [
    lime.Renderer.DOM.makeSubRenderer(lime.Renderer.DOM.SPRITE),
    lime.Renderer.CANVAS.makeSubRenderer(lime.Renderer.CANVAS.SPRITE)
];

/**
 * Gets fill parameters
 * @return {lime.fill.Fill} Fill object.
 */
lime.Sprite.prototype.getFill = function() {
    return this.fill_;
};

/**
 * Sets fill parameters
 * @param {mixed} fill Fill.
 * @return {lime.Sprite} object itself.
 */
lime.Sprite.prototype.setFill = function(fill) {
    this.fill_ = lime.fill.parse(goog.array.toArray(arguments));
    this.fill_.initForSprite(this);
    return  this.setDirty(lime.Dirty.CONTENT);
};

/**
 * @private
 */
// todo: move this function to canvas background rendermode
lime.Sprite.prototype.getCanvasContextName_ = (function() {
    var contextID_ = 0;
    return function() {

        if (!goog.isDef(this.canvasContextName_)) {
            this.canvasContextName_ = 'limedc' + (lime.Sprite.contextID_++);
        }
        return this.canvasContextName_;
    };
})();


/**
 * @inheritDoc
 * @this {lime.Sprite}
 */
lime.Renderer.DOM.SPRITE.draw = function(el) {
    if (!goog.isNull(this.fill_)) {
        this.fill_.setDOMStyle(el, this);
    }
};

/**
 * @inheritDoc
 * @this {lime.Sprite}
 */
lime.Renderer.CANVAS.SPRITE.draw = function(context) {
    //todo: remove domElement, add getContext
    var size = this.getSize(), fill = this.fill_;

    if (!fill) return;
console.log('draw');
    var width = size.width;
    var height = size.height;

    var frame = this.getFrame();


    if (fill.id == 'image' || fill.id=='frame') {
        /*
        
        */
        fill.setCanvasStyle(context, this);
    }
    else {
        fill.setCanvasStyle(context, this);

        context.fillRect(frame.left,frame.top,
            width, height);
    }

};

