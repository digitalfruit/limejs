goog.provide('lime.fill.Frame');

goog.require('lime.fill.Fill');
goog.require('goog.math.Rect');

/**
 * Image fill.
 * @param {string|Image|lime.Sprite} img Image.
 * @param {goog.math.Rect} rect Crop frame.
 * @constructor
 * @extends lime.fill.Image
 */
lime.fill.Frame = function(img,rect) {
    goog.base(this,img);
    
    this.rect_ = rect;
};

/**
 * Common name for Frame objects
 * @type {string}
 * @const
 */
lime.fill.Frame.prototype.id = 'frame';

/**
 * @inheritDoc
 */
lime.fill.Frame.prototype.initForSprite = function(sprite){
    lime.fill.Image.prototype.initForSprite.call(this,sprite);
    
    //switch to canvas if no support
};

/** @inheritDoc */
lime.fill.Frame.prototype.setDOMStyle = function(domEl,shape) {
};

