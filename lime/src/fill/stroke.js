goog.provide('lime.fill.Stroke');

goog.require('lime.fill.Fill');

/**
* Stroke 
* @param {number} width Stroke width.
* @param {*} color Stroke color.
* @constructor
* @extends lime.fill.Fill
*/
lime.fill.Stroke = function(width,color) {
    lime.fill.Fill.call(this);

    var param = goog.isArray(width)?width:goog.array.toArray(arguments);
    
    this.width_ = param[0] || 1;
    
    param.shift();
    
    this.setColor.apply(this,param);
    
};
goog.inherits(lime.fill.Stroke, lime.fill.Fill);

/**
 * Common name for stroke objects
 * @type {string}
 * @const
 */
lime.fill.Stroke.prototype.id = 'stroke';

/** @inheritDoc */
lime.fill.Stroke.prototype.setDOMStyle = function(domEl) {
    domEl.style['border'] = this.width_+'px solid '+this.color_.str;
};

/** @inheritDoc */
lime.fill.Stroke.prototype.setCanvasStyle = function(context) {
    context.strokeStyle = this.color_.str;
    context.lineWidth = this.width_;
};

/**
 * Return stroke width.
 * @return {number} Stroke width.
 */
lime.fill.Stroke.prototype.getWidth = function(){
    return this.width_;
};

/**
 * Set new stroke width.
 * @param {number} width New value.
 * @return {number} Stroke object itself.
 */
lime.fill.Stroke.prototype.setWidth = function(width){
    this.width_ = width;
    return this;
};

/**
 * Return current stroke color.
 * @return {lime.fill.Color} Color.
 */
lime.fill.Stroke.prototype.getColor = function(){
    return this.color_;
};

/**
 * Set new color for the stroke.
 * @param {*} color New color.
 * @return {lime.fill.Stroke} Stroke object itself.
 */
lime.fill.Stroke.prototype.setColor = function(color){
    var params = goog.array.toArray(arguments);
    
    if(params[0] instanceof lime.fill.Color){
        this.color_ = params[0];
    }
    else {
        this.color_ = new lime.fill.Color('#000');
        if(params.length)
        this.color_.setColor.apply(this.color_,params);
    }
    return this;
};

/**
 * Clone the color
 * @return {lime.fill.Color} New cloned color.
 */
lime.fill.Stroke.prototype.clone = function() {
    var c = new lime.fill.Stroke();
    c.width_ = this.width_;
    c.color_ = this.color_;
    return c;
};
