goog.provide('lime.events.Drag');

goog.require('goog.events.EventTarget');
goog.require('lime.animation.MoveTo');

lime.events.Drag = function(event,opt_snapToCenter,opt_bounds,opt_targetObject){
    goog.base(this);

    this.target = opt_targetObject || event.targetObject;
    
    this.dropTargets_ = [];
    this.dropIndex_ = -1;

    this.x = 0;
    this.y = 0;

    if (!opt_snapToCenter) {
        var centerpos = this.target.localToScreen(new goog.math.Coordinate(0,0));
        this.x = event.screenPosition.x-centerpos.x;
        this.y = event.screenPosition.y-centerpos.y;
    }
    
    event.swallow(['touchmove', 'mousemove'],goog.bind(this.moveHandler_,this));
    event.swallow(['touchend', 'touchcancel', 'mouseup'],goog.bind(this.releaseHandler_,this));
    
    this.setBounds(opt_bounds || null);
    
    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.START));

}
goog.inherits(lime.events.Drag,goog.events.EventTarget);

lime.events.Drag.Event = {
    START   : 'start',
    END     : 'end',
    MOVE    : 'move',
    CHANGE  : 'change',
    DROP    : 'drop',
    CANCEL  : 'cancel'
};

lime.events.Drag.prototype.disposeInternal = function() {
    goog.base(this,'disposeInternal');
    this.event_ = null;
    this.target = null;
    this.dropTargets_ = null;
};

lime.events.Drag.prototype.getBounds = function(){
    return this.bounds_;
}

lime.events.Drag.prototype.setBounds = function(bounds){
    this.bounds_ = bounds;
}

lime.events.Drag.prototype.moveHandler_ = function(e){
    var pos = e.screenPosition.clone();
    
    pos.x -= this.x;
    pos.y -= this.y;
    pos = this.target.getParent().screenToLocal(pos);
    
    var box = this.getBounds();

    if (goog.isDefAndNotNull(box)) {
        //todo: this can be optimized

        /*
        //thinking again testing with bounding box may be actually wrong
        var s = obj.size_, a = obj.anchorPoint_,p = this.position_;
        var rr = new goog.math.Rect(
                    p.x-s.width*a.x,
                    p.y-s.height*a.y ,
                    size.width, size.height
                );


        if(rr.left<box.left) rr.left=box.left;
        if(rr.top<box.top) rr.top=box.top;

        if(rr.left+s.width>box.right) bb.left=box.right-s.width;
        if(rr.top+s.height>box.bottom) bb.top=box.bottom-s.height;

        pos.x = rr.left+s.width*a.x;
        pos.y = rr.top+s.height*a.y;
        */

        //point version
        if (pos.x < box.left) pos.x = box.left;
        else if (pos.x > box.right) pos.x = box.right;

        if (pos.y < box.top) pos.y = box.top;
        else if (pos.y > box.bottom) pos.y = box.bottom;


    }
    
    
    this.target.setPosition(pos);
    
    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.MOVE));
    
    var sel = -1;
    var currect = goog.math.Rect.createFromBox(this.target.getFrame());
    var results = [];
    for(var i=0;i<this.dropTargets_.length;i++){
        var loc = this.dropTargets_[i];
        var dropFrame = loc.getFrame();
        var tl = loc.localToNode(new goog.math.Coordinate(dropFrame.left,dropFrame.top),this.target);
        var br = loc.localToNode(new goog.math.Coordinate(dropFrame.right,dropFrame.bottom),this.target);
        var droprect = goog.math.Rect.createFromBox(new goog.math.Box(tl.y,br.x,br.y,tl.x));
        var intersection;
        
        if(intersection = goog.math.Rect.intersection(currect,droprect)){
            results.push([intersection.width*intersection.height/(droprect.width*droprect.height),i]);
        }
    }
    
    if(results.length){
        
        results = results.sort(function(a,b){b[0]-a[0]});
        sel = results[0][1];
   }     
        
   if(sel!=this.dropIndex_){
        if(this.dropIndex_!=-1){
            if(goog.isFunction(this.dropTargets_[this.dropIndex_].hideDropHightLight)){
                this.dropTargets_[this.dropIndex_].hideDropHightLight();
            }
        }
        this.dropIndex_ = sel;
        if(this.dropIndex_!=-1){
            if(goog.isFunction(this.dropTargets_[this.dropIndex_].hideDropHightLight)){
                this.dropTargets_[this.dropIndex_].hideDropHightLight();
            }
        }
        
        var ev = new goog.events.Event(lime.events.Drag.Event.CHANGE);
        ev.activeDropTarget = this.dropIndex_ != -1 ? this.dropTargets_[this.dropIndex_] : null;
        this.dispatchEvent(ev);
        
    }
        
    

}

lime.events.Drag.prototype.releaseHandler_ = function(e){
    
    if(this.dropTargets_.length){
        
        if(this.dropIndex_!=-1){
            var ev = new goog.events.Event(lime.events.Drag.Event.DROP);
            ev.activeDropTarget = this.dropTargets_[this.dropIndex_];
            this.dispatchEvent(ev);
            if(!ev.propagationStopped_){
                var pos = ev.activeDropTarget.getParent().localToNode(ev.activeDropTarget.getPosition(),this.target.getParent());
                this.target.runAction(new lime.animation.MoveTo(pos.x,pos.y).setDuration(.5).enableOptimizations());
            }
        }
        else {
            this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.CANCEL));
        }
        
    }
    
    
    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.END));
    
    lime.scheduleManager.callAfter(this.dispose,this,100);
    
}

lime.events.Drag.prototype.addDropTarget = function(drop){
    this.dropTargets_.push(drop);
}

