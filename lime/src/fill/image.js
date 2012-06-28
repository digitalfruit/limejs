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
    
    if(img && goog.isFunction(img.data)){
        img = img.data();
    }
    
    if (goog.isString(img)) {
        this.url_ = img;
        if(this.url_.length>50)
            this.url_ = this.url_.substr(-50);
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
        if(this.url_.length>50)
            this.url_ = this.url_.substr(-50);
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
lime.fill.Image.loadedImages_ = {};

/**
 * Common name for Image objects
 * @type {string}
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
    
    if(!this.isLoaded()){
        goog.events.listen(this,goog.events.EventType.LOAD,function(){
            sprite.setDirty(lime.Dirty.CONTENT);
        },false,this);
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
 * @param {Event} e Event.
 * @private
 */
lime.fill.Image.prototype.imageLoadedHandler_ = function(e) {
    this.dispatchEvent(e);
};

/**
 * Return core DOM Image element for the fill.
 * @return {HTMLImageElement} Image element.
 */
lime.fill.Image.prototype.getImageElement = function(){
    return this.image_;
};

/**
 * Return true if image object has been loaded from network.
 * @return {boolean} If image has been loaded.
 */
lime.fill.Image.prototype.isLoaded = function(){
    return !!(this.image_ && this.image_.width && this.image_.height);
}

/**
 * Set the drawing size for the fill. Size can also be passed in 
 * with two numbers.
 * @param {(goog.math.Size|number)} size Image fill size.
 * @param {(boolean|number)=} opt_perc If size is relative factor from original.
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

lime.fill.Image.prototype.getPixelSizeAndOffset = function(shape){
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
    return [size,offset];
}


/**
 * Common functionality so it could be reused on Frame
 * @protected
 */
lime.fill.Image.prototype.setDOMBackgroundProp_ = function(domEl,shape){
    var so = this.getPixelSizeAndOffset(shape),size=so[0],offset=so[1],q = shape.getRelativeQuality();
    domEl.style[lime.style.getCSSproperty('BackgroundSize')] = size.width*q+'px '+size.height*q+'px';
    var stroke =  shape.stroke_?shape.stroke_.width_:0;
    domEl.style['backgroundPosition'] = (offset.x*q-stroke)+'px '+(offset.y*q-stroke)+'px';
    //domEl.style['backgroundRepeat'] = 'no-repeat';
    if (this.qualityRenderer)
    domEl.style['imageRendering'] = 'optimizeQuality';
}

/** @inheritDoc */
lime.fill.Image.prototype.setDOMStyle = function(domEl,shape) {
    domEl.style['background'] = 'url(' + this.image_.src + ')';
    this.setDOMBackgroundProp_(domEl,shape);
};

lime.fill.Image.prototype.setCanvasStyle = function(context,shape) {
    var size = shape.getSize(),frame = shape.getFrame();
    if (!size.width || !size.height) return;
    try {
        var img = this.getImageElement();
        var so = this.getPixelSizeAndOffset(shape),s=so[0],offset=so[1];
        /* todo: No idea if drawimage() with loops is faster or if the
           pattern object needs to be cached. Needs to be tested! */
        var ptrn = context.createPattern(img,'repeat');
        var aspx = s.width/img.width, aspy =s.height/img.height; 
        context.save();
        context.translate(frame.left+offset.x,frame.top+offset.y);
        context.scale(aspx,aspy);
        context.fillStyle = ptrn;
        context.fillRect(-offset.x/aspx,-offset.y/aspy,size.width/aspx, size.height/aspy);
        context.restore();
    }catch(e){}
};
