goog.provide('lime.fill.Stroke');

goog.require('lime.fill.Fill');

/**
* Stroke 
* @constructor
* @extends lime.fill.Fill
*/
lime.fill.Stroke = function(width,color) {
    lime.fill.Fill.call(this);

    var param = goog.isArray(width)?width:goog.array.toArray(arguments);

    this.width_ = param[0];
    
    param.shift();
    
    this.color_ = new lime.fill.Color('#000');console.log(param);
    this.color_.setColor.apply(this.color_,param);

};
goog.inherits(lime.fill.Stroke, lime.fill.Fill);

/**
 * Common name for stroke objects
 * @type {string}
 * @const
 */
lime.fill.Stroke.prototype.id = 'stroke';

/** @inheritDoc */
lime.fill.Stroke.prototype.setDOMStyle = function(domEl) {console.log( this.width_+'px solid '+this.color_.str);
    domEl.style['border'] = this.width_+'px solid '+this.color_.str;
};

/** @inheritDoc */
lime.fill.Stroke.prototype.setCanvasStyle = function(context) {
    context.fillStyle = this.str;
};

/**
 * Clone the color
 * @return {lime.fill.Color} New cloned color.
 */
lime.fill.Stroke.prototype.clone = function() {
    var c = new lime.fill.Stroke();
    return c;
};
