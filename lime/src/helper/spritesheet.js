goog.provide('lime.SpriteSheet');

goog.require('lime.fill.Frame');
goog.require('lime.parser.ZWOPTEX');

/**
 * [Sprite Sheets]{@link http://www.limejs.com/2011/02/21/introducing-sprite-sheets} allows you to gather your image 
 * assets to the same image file and define frames that contains the needed keyframe animations, 
 * [multiple formats]{@link http://www.limejs.com/2011/02/27/new-formats-for-spritesheets} are supported.
 *
 * @param {string|Image|lime.Sprite} image The url, image or sprite, to use.
 * @param {object} metadata The metadata needed by the parser.
 * @param {lime.parser.JSON|lime.parser.TMX|lime.parser.ZWOPTEX|lime.parser.ZWOPTEX2} parser The parser that should be 
 * used instead of ZWOPTEX.
 * @constructor
 */
lime.SpriteSheet = function(image, metadata, parser){
    this.image_ = new lime.fill.Image(image);
    
    if(!goog.isDef(parser) && goog.DEBUG && goog.global['console'] && goog.global['console']['warn']){
        goog.global['console']['warn']('DEPRECATED: SpriteSheet 3rd parser parameter is now required.');
    }
    
    var p = parser || lime.parser.ZWOPTEX,
        data = metadata.data ? metadata.data() : metadata;
    
    this.metadata_ = p(data);
};

/**
 * Return the frame from the sprite sheet that has the given name.
 * @param {string} name The name of the frame.
 */
lime.SpriteSheet.prototype.getFrame = function(name){
    var m = this.metadata_[name];
    if(!m){
        throw("Frame "+name+" not found in the spritesheet");
    }
    return new lime.fill.Frame(this.image_.image_, m[0], m[1], m[2], m[3]);
};

/**
 * Returns true if the sprite sheet contains a frame with the given name.
 * @param {string} name The name to check if the sprite sheete contains.
 */
lime.SpriteSheet.prototype.hasFrame = function(name){
    return goog.isDef(this.metadata_[name]);
};
