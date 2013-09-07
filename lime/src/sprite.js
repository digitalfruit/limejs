goog.provide('lime.Renderer.CANVAS.SPRITE');
goog.provide('lime.Renderer.DOM.SPRITE');
goog.provide('lime.Sprite');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.math.Size');
goog.require('lime');
goog.require('lime.Node');
goog.require('lime.fill.Color');
goog.require('lime.fill.Stroke');
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
     * @type {lime.fill.Fill}
     * @private
     */
    this.fill_ = null;


    this.stroke_ = null;


};
goog.inherits(lime.Sprite, lime.Node);

/**
 * Common name for sprite objects
 * @type {string}
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
 * @param {*} fill Fill.
 * @param {number=} opt_g Optionaly use r,g,b,a as parameter.
 * @param {number=} opt_b Optionaly use r,g,b,a as parameter.
 * @param {number=} opt_a Optionaly use r,g,b,a as parameter.
 * @return {lime.Sprite} object itself.
 */
lime.Sprite.prototype.setFill = function(fill, opt_g, opt_b, opt_a) {
    this.fill_ = lime.fill.parse(goog.array.toArray(arguments));
    this.fill_.initForSprite(this);
    this.setDirty(lime.Dirty.CONTENT);
    return this;
};

/**
 * Return Stroke object if one is set
 * @return {lime.fill.Stroke} Stroke object.
 */
lime.Sprite.prototype.getStroke = function(){
    return this.stroke_;
};

/**
 * Sets stroke parameters.
 * @param {*} stroke Stroke object or width and (mixed type) Color.
 * @return {lime.Sprite} object itself.
 */
lime.Sprite.prototype.setStroke = function(stroke){
    if(stroke && !(stroke instanceof lime.fill.Stroke)){
        stroke = new lime.fill.Stroke(goog.array.toArray(arguments));
    }
    this.stroke_ = stroke;
    this.setDirty(lime.Dirty.CONTENT);
    return this;
};

/**
 * @private
 */
// todo: move this function to canvas background rendermode
lime.Sprite.prototype.getCanvasContextName_ = (function() {
    var contextID_ = 0;
    return function() {

        if (!goog.isDef(this.canvasContextName_)) {
            this.canvasContextName_ = 'limedc' + (contextID_++);
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
    if (!goog.isNull(this.stroke_)) {
        this.stroke_.setDOMStyle(el, this);
        this.hadStroke_ = true;
    } else if (this.hadStroke_) {
        goog.style.setStyle(el, 'border-width', 0);
        this.hadStroke_ = false;
    }
};

/**
 * @inheritDoc
 * @this {lime.Sprite}
 */
lime.Renderer.CANVAS.SPRITE.draw = function(context) {
    var size = this.getSize(), fill = this.fill_, stroke = this.stroke_;

    if (!fill && !stroke) return;
    
    var frame = this.getFrame();
    
    
    if(fill){
        fill.setCanvasStyle(context, this);
    
        if(fill.id != 'image' && fill.id!='frame'){
            context.fillRect(frame.left,frame.top,
                size.width, size.height);
        }
    }
    
    
    if(stroke){
        stroke.setCanvasStyle(context,this);
        
        if(this.id=='sprite' || this.id=='label'){
        var lw = stroke.width_/2;
        context.strokeRect(frame.left+lw,frame.top+lw,
            size.width-2*lw, size.height-2*lw);
        }
    }

};

