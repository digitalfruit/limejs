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
    
    this.rect_ = rect;
    
    var r = this.rect_,key = [this.url_,r.width,r.height,r.left,r.top].join('_');
    if(goog.isDef(this.dataCache_[key])){
        this.data_ = this.dataCache_[key];
    }
    else {
        this.data_ = this.getNextCssClass_();
    
        this.cvs = document.createElement('canvas'),r = this.rect_;

        this.ctx = this.cvs.getContext('2d');
        this.cvs.width = r.width;
        this.cvs.height = r.height;

    
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
    var r = this.rect_;
    
    this.ctx.drawImage(this.image_,r.left,r.top,r.width,r.height,0,0,r.width,r.height);

    var rule = '.'+this.data_+'{background-image:url('+this.cvs.toDataURL("image/png")+') !important}';
    
    if(!styleSheet){
        goog.style.installStyles(rule)
    }
    else {
        goog.cssom.addCssRule(styleSheet,rule);
    }
}
})();

/** @inheritDoc */
lime.fill.Frame.prototype.setDOMStyle = function(domEl,shape) {
    if(this.data_!=shape.cvs_background_class_){
        if(shape.cvs_background_class_)
        goog.dom.classes.remove(domEl.cvs_background_class_);
        domEl.style['background-image'] = 'none';
        goog.dom.classes.add(domEl,this.data_);
        this.cvs_background_class = this.data_;
    }
    
    this.setDOMBackgroundProp_(domEl,shape);
};

