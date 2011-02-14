goog.provide('lime.fill.Image');

goog.require('lime.fill.Fill');

/**
 * Image fill.
 * @param {string|Image|lime.Sprite} img Image.
 * @constructor
 * @extends lime.fill.Fill
 */
lime.fill.Image = function(img) {
    lime.fill.Fill.call(this);

    this.image_ = img;

};
goog.inherits(lime.fill.Image, lime.fill.Fill);

/**
 * Common name for Image objects
 * @type {string}
 * @const
 */
lime.fill.Image.prototype.id = 'image';

/**
 * @inheritDoc
 */
lime.fill.Image.prototype.initForSprite = function(sprite) {

    var img = this.image_;

    this.sprite_ = sprite;

    /*if ((img instanceof lime.Sprite)) {
        sprite.setRenderMode( lime.RenderMode.BACKGROUND_CANVAS );
        this.image_ = img;
        goog.events.listenOnce(this.image_.eventTarget, 'update',
            this.updateHandler_, false, this);
    }
    else */
    if (goog.isString(img)) {
        this.image_ = new Image();
        goog.events.listen(this.image_, goog.events.EventType.LOAD,
            this.imageLoadedHandler_, false, this);
        this.image_.src = img;
    }
    else {
        this.image_ = img;
        var size = sprite.getSize();
        if (size.width == 0 && size.height == 0)
        sprite.setSize(new goog.math.Size(img.width, img.height));
        sprite.setDirty(lime.Dirty.CONTENT);
    }


};

/**
 * Update all children of background_canvas type image
 * @private
 */
lime.fill.Image.prototype.updateHandler_ = function() {
    this.sprite_.update();
};

/**
 * Update sprite dimensions after image has been loaded
 * @param {event} e Event.
 * @private
 */
lime.fill.Image.prototype.imageLoadedHandler_ = function(e) {
    var size = this.sprite_.getSize();
    if (size.width == 0 && size.height == 0)
        this.sprite_.setSize(new goog.math.Size(
            this.image_.width, this.image_.height));
};

lime.fill.Image.prototype.setSize = function(size,opt_perc){
    if(goog.isNumber(size)){
        size = new goog.math.Size(arguments[0],arguments[1]);
        opt_perc = arguments[2] || false;
    }
    this.size_ = size;
    this.size_perc_ = opt_perc;
    return this;
}

lime.fill.Image.prototype.setOffset = function(offset,opt_perc){
    if(goog.isNumber(offset)){
        offset = new goog.math.Coordinate(arguments[0],arguments[1]);
        opt_perc = arguments[2] || false;
    }
    this.offset_ = offset;
    this.offset_perc_ = opt_perc;
    return this;
}

/** @inheritDoc */
lime.fill.Image.prototype.setDOMStyle = function(domEl,shape) {
    domEl.style['background'] = 'url(' + this.image_.src + ')';
    var size = shape.getSize().clone();
    if(this.size_){
       if(this.size_perc_){
           size.width*=this.size_.width;
           size.height*=this.size_.height;
       }
       else {
           size = this.size_;
       }
    }
    domEl.style[lime.style.getCSSproperty('BackgroundSize')] = size.width+'px '+size.height+'px';
    
    var offset = new goog.math.Coordinate(0,0);
    if(this.offset_){
        if(this.offset_perc_){
            offset.x=size.width*this.offset_.x;
            offset.y=size.height*this.offset_.y;
        }
        else {
            offset = this.offset_;
        }
    }
    domEl.style['backgroundPosition'] = offset.x+'px '+offset.y+'px';
    
    //domEl.style['backgroundRepeat'] = 'no-repeat';
    if (this.qualityRenderer)
    domEl.style['imageRendering'] = 'optimizeQuality';
};

