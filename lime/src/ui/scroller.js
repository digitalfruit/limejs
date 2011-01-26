goog.provide('lime.ui.Scroller');

goog.require('lime.Sprite');
goog.require('lime.animation.MoveTo');


lime.ui.Scroller = function(){
    
    goog.base(this);
    
    //need default size for autoresize
    this.setSize(100,100);
       
    this.clipper = new lime.Sprite().setFill('#c00').setSize(100,100).setAutoResize(lime.AutoResize.ALL);
	this.appendChild(this.clipper);
	this.setMask(this.clipper);
    
	this.moving_ = new lime.Layer();
	lime.Node.prototype.appendChild.call(this,this.moving_);
    
	goog.events.listen(this,['mousedown','touchstart'],this.downHandler_,false,this);
	
	
  	this.setDirection(lime.ui.Scroller.Direction.HORIZONTAL);

}
goog.inherits(lime.ui.Scroller, lime.Sprite);

/**
 * Offset that can be dragged over the edge
 * @const
 * @type {number}
 */
lime.ui.Scroller.OFFSET = 250;

/**
 * Factor to slow down if over the edge
 * @const
 * @type {number}
 */
lime.ui.Scroller.OFFSET_LAG = .4;

/**
 * How fast to slow down
 * @const
 * @type {number}
 */
lime.ui.Scroller.FRICTION = .95;

/**
 * Direction of the scroller.
 * @enum {number}
 */
lime.ui.Scroller.Direction = {
  HORIZONTAL : 0,
  VERTICAL : 1  
};

lime.ui.Scroller.prototype.getDirection = function(){
    return this.direction_;
}

lime.ui.Scroller.prototype.setDirection = function(direction){
    this.direction_ = direction;
    return this;
};

/** @inheritDoc */
lime.ui.Scroller.prototype.setAnchorPoint = function(){
    if(this.clipper){
        this.clipper.setAnchorPoint.apply(this.clipper,arguments);
    }
    return lime.Node.prototype.setAnchorPoint.apply(this,arguments);
}

/** @inheritDoc */

lime.ui.Scroller.prototype.appendChild = function(){
    if(this.moving_) return this.moving_.appendChild.apply(this.moving_,arguments);
    return lime.Node.prototype.appendChild.apply(this,arguments);
}

/** @inheritDoc */
lime.ui.Scroller.prototype.removeChild = function(){
    //if(this.moving_) return this.moving_.removeChild.apply(this.moving_,arguments);
    return lime.Node.prototype.removeChild.apply(this,arguments);
}

lime.ui.Scroller.prototype.measureLimits = function(){
    
    var measure = this.moving_.measureContents();
    if(this.getDirection()==lime.ui.Scroller.Direction.HORIZONTAL){
        this.downy=this.moving_.getPosition().y;
        var max = this.getSize().width;
    
        this.LOW = -measure.left;
        this.HIGH =Math.min(max-measure.right,-measure.left);
        var diff = (measure.right-measure.left)-max;
    }
    else {
        this.downx=this.moving_.getPosition().x;
        max = this.getSize().height;
        
        this.LOW = -measure.top;
        this.HIGH =Math.min(max-measure.bottom,-measure.top);
        diff = (measure.bottom-measure.top)-max;
    }    
    
    if(diff>0){
        this.LOW-=diff;
        this.HIGH+=diff;
    }
}

lime.ui.Scroller.prototype.scrollTo = function(offset,opt_duration){
    var pos = this.moving_.getPosition().clone();
    var duration = opt_duration || 0;
    
    this.measureLimits();
    
    if(offset<0) offset = 0;
    
    if(this.getDirection()==lime.ui.Scroller.Direction.HORIZONTAL){
        pos.x = this.HIGH - offset;
        if(pos.x<this.LOW) pos.x = this.LOW;
    }
    else {
        pos.y = this.HIGH - offset;
        if(pos.y<this.LOW) pos.y = this.LOW;
    }
    
    if(duration){
        this.moving_.runAction(new lime.animation.MoveTo(pos.x,pos.y).setDuration(duration)
            .setEasing(lime.animation.getEasingFunction(.19,.6,.35,.97)).enableOptimizations());
    }
    else this.moving_.setPosition(pos);
}

lime.ui.Scroller.prototype.downHandler_ = function(e){
    e.position = this.localToNode(e.position,this.moving_);
  	this.downx = e.position.x;
    this.downy = e.position.y;
    
    this.v = 0;
    this.ismove = 1;
    
    if(this.getDirection()==lime.ui.Scroller.Direction.HORIZONTAL){
        this.oldvalue = this.posvalue = this.moving_.getPosition().x;
    }
    else {
        this.oldvalue = this.posvalue = this.moving_.getPosition().y;
    }
    
    this.measureLimits();
    
    lime.animation.actionManager.stopAll(this.moving_);
    //this.moving_.setPosition(p);
    
    lime.scheduleManager.schedule(this.captureVelocity_,this);

    e.swallow(['touchmove', 'mousemove'], this.moveHandler_);

    e.swallow(['touchend','mouseup','touchend'], this.upHandler_);

}

lime.ui.Scroller.prototype.captureVelocity_ = function(){
    if(this.ismove){
        this.v = (this.posvalue-this.oldvalue)*1.05;
        this.oldvalue = this.posvalue;
    }
    this.v*=lime.ui.Scroller.FRICTION;
}

lime.ui.Scroller.prototype.moveHandler_ = function(e) {
    var pos = e.position.clone(),dir = this.getDirection(),activeval;
    
    if(dir==lime.ui.Scroller.Direction.HORIZONTAL){
        pos.x -= this.downx;
        pos.y = this.downy;
        activeval = pos.x;
    }
    else {
        pos.x = this.downx;
        pos.y -= this.downy;
        activeval = pos.y;
    }
    

    if(activeval<this.LOW){
        var diff = this.LOW-activeval;
        
        if(diff>lime.ui.Scroller.OFFSET) diff=lime.ui.Scroller.OFFSET;
        activeval = this.LOW-diff*lime.ui.Scroller.OFFSET_LAG;
    }
    if(activeval>this.HIGH) {
        diff = activeval-this.HIGH;
        
        if(diff>lime.ui.Scroller.OFFSET) diff=lime.ui.Scroller.OFFSET;
        activeval = this.HIGH+diff*lime.ui.Scroller.OFFSET_LAG;
    }
    
    this.posvalue = activeval;
    
    if(dir==lime.ui.Scroller.Direction.HORIZONTAL){
        pos.x = activeval;
    }
    else {
        pos.y = activeval;
    }
    
    this.moving_.setPosition(pos);
    
    this.event = e.clone();
    
}
  
lime.ui.Scroller.prototype.upHandler_ = function(e){
    var pos = e.position.clone(),dir = this.getDirection(),activeval;
    
    if(dir==lime.ui.Scroller.Direction.HORIZONTAL){
        pos.x -= this.downx;
        pos.y = this.downy;
        activeval = pos.x;
    }
    else {
        pos.x = this.downx;
        pos.y -= this.downy;
        activeval = pos.y;
    }

    lime.scheduleManager.unschedule(this.captureVelocity_,this);
    var k = Math.log(0.5/Math.abs(this.v))/Math.log(lime.ui.Scroller.FRICTION),
        duration = k/30,
        endpos = (Math.abs(this.v)*(Math.pow(lime.ui.Scroller.FRICTION,k)-1))/(lime.ui.Scroller.FRICTION-1)*(this.v>0?1:-1);
        
    activeval+=endpos;
    this.ismove = 0;
    
    if(this.v!=0){

        var diff = endpos;

        if(activeval<this.LOW){
            diff = this.LOW-(activeval-endpos);
            activeval = this.LOW;
        }
        if(activeval>this.HIGH) {
            diff = this.HIGH-(activeval-endpos);
            activeval = this.HIGH;
        }
        //console.log(diff,endpos);
        duration*=(diff/endpos);
    
    }
    
    if(this.oldvalue<this.LOW){
        activeval = this.LOW;
        duration=.3;
    }
    if(this.oldvalue>this.HIGH) {
        activeval = this.HIGH;
        duration=.3;
    }
    
    if(dir==lime.ui.Scroller.Direction.HORIZONTAL){
        pos.x = activeval;
    }
    else {
        pos.y = activeval;
    }
    
    if(Math.abs(duration)<10){
         this.moving_.runAction(new lime.animation.MoveTo(pos.x,pos.y).setDuration(duration)
            .setEasing(lime.animation.getEasingFunction(.19,.6,.35,.97)).enableOptimizations());
    }

    
}