goog.provide('lime.Renderer.CANVAS.SPRITE');
goog.provide('lime.Renderer.DOM.SPRITE');
goog.provide('lime.Renderer.WEBGL.SPRITE');
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
    lime.Renderer.CANVAS.makeSubRenderer(lime.Renderer.CANVAS.SPRITE),
    lime.Renderer.WEBGL.makeSubRenderer(lime.Renderer.WEBGL.SPRITE)
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

lime.Renderer.WEBGL.SPRITE.draw = function(glc){
    var size = this.getSize(), fill = this.fill_;

    if (!fill) return;
    var width = size.width;
    var height = size.height;

    var frame = this.getFrame(), V3 = lime.webgl.V3;
    
    var tl = glc.tl.set([frame.left, frame.top, 0]).multiply(glc.transform),
        bl = glc.bl.set([frame.left, frame.bottom, 0]).multiply(glc.transform),
        tr = glc.tr.set([frame.right, frame.top, 0]).multiply(glc.transform),
        br = glc.br.set([frame.right, frame.bottom, 0]).multiply(glc.transform);
    var color = [5,0,0,.1];
    
    if(this.fill_ instanceof lime.fill.Color){
        var MULT=0.003921568;
        color = this.fill_.getRgba();
        color[0]*=MULT,color[1]*=MULT,color[2]*=MULT;
    }color[3]=.2;
    
    glc.buffer.assureEmptyPositions(6);
    
    var vct = glc.buffer.vct,es = glc.buffer.elementSize;
    var index = glc.buffer.length*es;
  //  console.log(index,vct,glc.buffer.elementSize);
  
    vct.set(tl.elements,index);
    vct.set(bl.elements,es+index);
    vct.set(br.elements,2*es+index);
    vct.set(tl.elements,3*es+index);
    vct.set(br.elements,4*es+index);
    vct.set(tr.elements,5*es+index);
    
    
    vct.set(color,index+3);
    vct.set(color,es+index+3);
    vct.set(color,2*es+index+3);
    vct.set(color,3*es+index+3);
    vct.set(color,4*es+index+3);
    vct.set(color,5*es+index+3);
    
    glc.buffer.length+=6;
}

