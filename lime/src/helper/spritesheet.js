goog.provide('lime.SpriteSheet');

goog.require('lime.fill.Frame');
goog.require('lime.parser.ZWOPTEX');

lime.SpriteSheet = function(image,metadata,opt_parser){
    this.image_ = new lime.fill.Image(image);
    
    var parser = opt_parser || lime.parser.ZWOPTEX;
    
    this.metadata_ = parser(metadata.data());
}

lime.SpriteSheet.prototype.getFrame = function(name){
    return new lime.fill.Frame(this.image_.image_,this.metadata_[name]);
}