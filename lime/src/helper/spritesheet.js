goog.provide('lime.SpriteSheet');

goog.require('lime.fill.Frame');
goog.require('lime.parser.ZWOPTEX');

/**
 * @constructor
 */
lime.SpriteSheet = function(image, metadata, p){
    this.image_ = new lime.fill.Image(image);
    
    if(!goog.isDef(p) && goog.DEBUG && goog.global['console'] && goog.global['console']['warn']){
        goog.global['console']['warn']('DEPRECATED: SpriteSheet 3rd parser parameter is now required.');
    }
    
    var parser = p || lime.parser.ZWOPTEX;
    
    this.metadata_ = parser(metadata.data());
}

lime.SpriteSheet.prototype.getFrame = function(name){
    var m = this.metadata_[name];
    return new lime.fill.Frame(this.image_.image_, m[0], m[1], m[2], m[3]);
}
