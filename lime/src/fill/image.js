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
    
    /*if ((img instanceof lime.Sprite)) {
        sprite.setRenderMode( lime.RenderMode.BACKGROUND_CANVAS );
        this.image_ = img;
        goog.events.listenOnce(this.image_.eventTarget, 'update',
            this.updateHandler_, false, this);
    }
    else */
    
    if (goog.isString(img)) {
        this.url_ = img;
        if(lime.fill.Image.loadedImages_[this.url_]){
            this.image_ = lime.fill.Image.loadedImages_[this.url_];
        }
        else {
            this.image_ = new Image();
            this.image_.src = img;
        }
    }
    else {
        this.url_ = img.src;
        if(lime.fill.Image.loadedImages_[this.url_]){
            this.image_ = lime.fill.Image.loadedImages_[this.url_];
        }
        else {
            this.image_ = img;
        }
        
    }
    
    if (!this.isLoaded()){
        this.addLoadHandler_();
    }
    
    lime.fill.Image.loadedImages_[this.url_] = this.image_;
    

};
goog.inherits(lime.fill.Image, lime.fill.Fill);

/**
 * Already loaded image cache to reuse all img objects.
 * @private
 */
lime.fill.Image.loadedImages_ = [];

/**
 * Common name for Image objects
 * @type {string}
 * @const
 */
lime.fill.Image.prototype.id = 'image';

/**
 * @inheritDoc
 */
lime.fill.Image.prototype.initForSprite = function(sprite){
    var size = sprite.getSize(),that = this;
    if(!size.width && !size.height){
        if(!this.isLoaded()){
        
        goog.events.listen(this,goog.events.EventType.LOAD,function(){
            var size = this.getSize();
            if(!size.width && !size.height){
                this.setSize(that.image_.width,that.image_.height);
            }
        },false,sprite);
        
        }
        else {
        
        sprite.setSize(this.image_.width,this.image_.height);
            
        }
    }
};

/**
 * @private
 */
lime.fill.Image.prototype.addLoadHandler_ = function(){
    goog.events.listen(this.image_, goog.events.EventType.LOAD,
        this.imageLoadedHandler_, false, this);
}

/**
 * Update sprite dimensions after image has been loaded
 * @param {event} e Event.
 * @private
 */
lime.fill.Image.prototype.imageLoadedHandler_ = function(e) {
    this.dispatchEvent(e);
};

/**
 * Return core DOM Image element for the fill.
 * @return {DOMElement} Image element.
 */
lime.fill.Image.prototype.getImageElement = function(){
    return this.image_;
};

/**
 * Return true if image object has been loaded from network.
 * @return {boolean} If image has been loaded.
 */
lime.fill.Image.prototype.isLoaded = function(){
    return this.image_ && this.image_.width && this.image_.height;
}

/**
 * Set the drawing size for the fill. Size can also be passed in 
 * with two numbers.
 * @param {goog.math.Size} size Image fill size.
 * @param {boolean=} opt_perc If size is relative factor from original.
 * @return {lime.fill.Image} object itself.
 */
lime.fill.Image.prototype.setSize = function(size,opt_perc){
    if(goog.isNumber(size)){
        size = new goog.math.Size(arguments[0],arguments[1]);
        opt_perc = arguments[2] || false;
    }
    this.size_ = size;
    this.size_perc_ = opt_perc;
    return this;
}

/**
 * Set the offset that defines the drawing start position. Default is top-left(0,0).
 * @param {goog.math.Coordinate} offset Image fill offset.
 * @param {boolean=} opt_perc If offset is relative factor from size.
 * @return {lime.fill.Image} object itself.
 */
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

