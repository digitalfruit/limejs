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

lime.ui.Scroller.prototype.downHandler_ = function(e){
    e.position = this.localToNode(e.position,this.moving_);
  	this.downx = e.position.x,
    this.downy = this.moving_.getPosition().y;
    //    p = moving.getPosition().clone(),
        var measure = this.moving_.measureContents(),
        width = this.getSize().width;
            
    this.v = 0;
    this.ismove = 1;
            
    this.oldx = this.posx = this.moving_.getPosition().x;
    
    this.LOW = -measure.left;
    this.HIGH =Math.min(width-measure.right,-measure.left);
    var diff = (measure.right-measure.left)-width;
    if(diff>0){
        this.LOW-=diff;
        this.HIGH+=diff;
    }
    
    lime.animation.actionManager.stopAll(this.moving_);
    //this.moving_.setPosition(p);
    
    lime.scheduleManager.schedule(this.captureVelocity_,this);

    e.swallow(['touchmove', 'mousemove'], this.moveHandler_);

    e.swallow(['touchend','mouseup','touchend'], this.upHandler_);

}

lime.ui.Scroller.prototype.captureVelocity_ = function(){
    if(this.ismove){
        this.v = (this.posx-this.oldx)*1.05;
        this.oldx = this.posx;
    }
    this.v*=lime.ui.Scroller.FRICTION;
}

lime.ui.Scroller.prototype.moveHandler_ = function(e) {
    var pos = e.position.clone();
   // pos = this.localToNode(e.position,this.moving_);
    pos.x -= this.downx;
    pos.y = this.downy;
    
   // pos = this.moving_.localToNode(pos,this);

    if(pos.x<this.LOW){
        var diff = this.LOW-pos.x;
        
        if(diff>lime.ui.Scroller.OFFSET) diff=lime.ui.Scroller.OFFSET;
        pos.x = this.LOW-diff*lime.ui.Scroller.OFFSET_LAG;
    }
    if(pos.x>this.HIGH) {
        diff = pos.x-this.HIGH;
        
        if(diff>lime.ui.Scroller.OFFSET) diff=lime.ui.Scroller.OFFSET;
        pos.x = this.HIGH+diff*lime.ui.Scroller.OFFSET_LAG;
    }
    
    this.posx = pos.x;
    this.moving_.setPosition(pos);
}
  
lime.ui.Scroller.prototype.upHandler_ = function(e){
    var pos = e.position.clone();
    
    pos.x -= this.downx;
    pos.y = this.downy;
    
    //pos = this.moving_.localToNode(pos, this.moving_.getParent());

    lime.scheduleManager.unschedule(this.captureVelocity_,this);
    var oldx = pos.x,
        k = Math.log(0.5/Math.abs(this.v))/Math.log(lime.ui.Scroller.FRICTION),
        duration = k/30,
        endpos = (Math.abs(this.v)*(Math.pow(lime.ui.Scroller.FRICTION,k)-1))/(lime.ui.Scroller.FRICTION-1)*(this.v>0?1:-1);
        
    pos.x+=endpos;
    this.ismove = 0;
    
    if(this.v!=0){

        var diff = endpos;

        if(pos.x<this.LOW){
            diff = this.LOW-(pos.x-endpos);
            pos.x = this.LOW;
        }
        if(pos.x>this.HIGH) {
            diff = this.HIGH-(pos.x-endpos);
            pos.x = this.HIGH;
        }
        //console.log(diff,endpos);
        duration*=(diff/endpos);
    
    }
    
    if(this.oldx<this.LOW){
        pos.x = this.LOW;
        duration=.3;
    }
    if(oldx>this.HIGH) {
        pos.x = this.HIGH;
        duration=.3;
    }console.log(duration);
    
    if(Math.abs(duration)<10){
         this.moving_.runAction(new lime.animation.MoveTo(pos.x,pos.y).setDuration(duration)
            .setEasing(lime.animation.getEasingFunction(.19,.6,.35,.97)).enableOptimizations());
    }

    
}