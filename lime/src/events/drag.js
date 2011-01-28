goog.provide('lime.events.Drag');

goog.require('goog.events.EventTarget');

lime.events.Drag = function(event,opt_snapToCenter,opt_bounds,opt_targetObject){
    goog.base(this);

    this.target = opt_targetObject || event.targetObject;

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
    DROP    : 'drop' 
};

lime.events.Drag.prototype.disposeInternal = function() {
    goog.base(this,'disposeInternal');
    this.event_ = null;
    this.target = null;
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
}

lime.events.Drag.prototype.releaseHandler_ = function(e){
    
    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.END));
    
}

