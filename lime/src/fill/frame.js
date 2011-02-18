goog.provide('lime.fill.Frame');

goog.require('lime.fill.Fill');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.cssom');
goog.require('goog.dom.classes');

/**
 * Image fill.
 * @param {string|Image|lime.Sprite} img Image.
 * @param {goog.math.Rect} rect Crop frame.
 * @constructor
 * @extends lime.fill.Image
 */
lime.fill.Frame = function(img,rect) {
    lime.fill.Image.call(this,img);
    
    if(goog.isNumber(rect)){
        rect = new goog.math.Rect(arguments[1],arguments[2],arguments[3],arguments[4]);
    }
    
    this.rect_ = rect;
    
    var r = this.rect_,key = [this.url_,r.width,r.height,r.left,r.top].join('_');
    if(goog.isDef(this.dataCache_[key])){
        this.data_ = this.dataCache_[key];
        if(!this.data_.processed){
            goog.events.listen(this.data_.initializer,'processed',function(){
                this.dispatchEvent(new goog.events.Event('processed'));
            },false,this);
        }
    }
    else {
        this.data_ = {};
        this.data_.processed = false;
        this.data_.initializer = this;
        this.data_.classname = this.getNextCssClass_();
   
        
        if(this.USE_CSS_CANVAS){
            this.ctx = document.getCSSCanvasContext('2d', this.data_.classname, r.width, r.height);
        }
        else {
            //todo: FF4 has support for element backgrounds. probably faster than this png url.
            this.ctx = this.makeCanvas(r);
        }
    
        if(this.isLoaded()){
            this.makeFrameData_();
        }
        else {
            goog.events.listen(this,goog.events.EventType.LOAD,this.makeFrameData_,false,this);
        }
    }
};
goog.inherits(lime.fill.Frame,lime.fill.Image);

/**
 * Common name for Frame objects
 * @type {string}
 * @const
 */
lime.fill.Frame.prototype.id = 'frame';

/**
 * @private
 */
lime.fill.Frame.prototype.dataCache_ = {};

/**
 * @type {boolean}
 */
lime.fill.Frame.prototype.USE_CSS_CANVAS = goog.isFunction(document.getCSSCanvasContext);

/**
 * @inheritDoc
 */
lime.fill.Frame.prototype.initForSprite = function(sprite){
    
    var size = sprite.getSize();
    if(size.width==0 && size.height==0){
        sprite.setSize(this.rect_.width,this.rect_.height);
    }
    
    lime.fill.Image.prototype.initForSprite.call(this,sprite);
    
    //switch to canvas if no support
};

lime.fill.Frame.prototype.isProcessed = function(){
    return this.data_ && this.data_.processed;
};

(function(){

var pfx='cvsbg_'+Math.round(Math.random()*1000)+'_',index=0,styleSheet;

/**
 * @private
 */
lime.fill.Frame.prototype.getNextCssClass_ = function(){
    index++;
    return pfx+index;
}

/**
 * @private
 */
lime.fill.Frame.prototype.makeFrameData_ = function(){
    this.writeToCanvas(this.ctx);
    
    if(!this.USE_CSS_CANVAS){

    var rule = '.'+this.data_.classname+'{background-image:url('+this.cvs.toDataURL("image/png")+') !important}';
    if(!styleSheet){
        goog.style.installStyles(rule);
       styleSheet = document.styleSheets[document.styleSheets.length-1];
    }
    else {
        // why doesn't addCssRule work in IE9???
       if(goog.userAgent.IE) styleSheet.cssText+=rule;
       else goog.cssom.addCssRule(styleSheet,rule);
    }
    
    }
    
    this.data_.processed = true;
    this.dispatchEvent(new goog.events.Event('processed'));
};

})();

/**
 * @inheritDoc
 */
lime.fill.Frame.prototype.getImageElement = function(){
    if(!this.frameImgCache_){
        if(!this.cvs){
            var ctx = this.makeCanvas(this.rect_);;
            this.writeToCanvas(ctx);
        }
        this.frameImgCache_ = this.cvs;
    }
    return this.frameImgCache_;
};

lime.fill.Frame.prototype.makeCanvas = function(r){
    this.cvs = document.createElement('canvas');
    var ctx = this.cvs.getContext('2d');
    this.cvs.width = r.width;
    this.cvs.height = r.height;
    return ctx;
};

lime.fill.Frame.prototype.writeToCanvas = function(ctx){
    var r = this.rect_, w = r.width, h = r.height, l = r.left, t = r.top;

    if(l<0){
        w+=l;
        l=0;
    }
    if(t<0){
        h+=t;
        t=0;
    }

    if(w+l>this.image_.width) w= this.image_.width-l;
    if(h+t>this.image_.height) h= this.image_.height-t;

    ctx.drawImage(this.image_,l,t,w,h,0,0,w,h);
};

/** @inheritDoc */
lime.fill.Frame.prototype.setDOMStyle = function(domEl,shape) {
    if(this.USE_CSS_CANVAS){
        domEl.style['background'] = '-webkit-canvas('+this.data_.classname+')';
    }    
    else if(this.data_.classname!=shape.cvs_background_class_){
        goog.dom.classes.add(domEl,this.data_.classname);
        domEl.style['background'] = '';
        if(shape.cvs_background_class_)
        goog.dom.classes.remove(domEl,shape.cvs_background_class_);
        shape.cvs_background_class_ = this.data_.classname;
    }
    
    this.setDOMBackgroundProp_(domEl,shape);
};

