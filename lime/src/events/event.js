goog.provide('lime.events.Event');

/**
 * Dfkit Event object
 * @param {lime.events.EventDispatcher} dispatcher Dispatcher.
 * @constructor
 */
lime.events.Event = function(dispatcher) {
    this.dispatcher_ = dispatcher;

    this.identifier = 0;
};

/**
 * Swallow an event. This means that next event from the same
 * interaction will be sent directly to handler without any search
 * @param {string|Array.<string>} type Event types to swallow.
 * @param {function(lime.events.Event)} handler Function to call on event.
 */
lime.events.Event.prototype.swallow = function(type, handler, opt_deny_shared) {
    type = goog.isArray(type) ? type : [type];
    for(var i=0;i<type.length;i++)
    this.dispatcher_.swallow(this, type[i], handler);

    if(opt_deny_shared){
        this.event.stopPropagation();
    }
};

/**
 * Release all swllowed handlers.
 * @param {s}
 */
lime.events.Event.prototype.release = function(opt_type) {
    var limit_type = goog.isDef(opt_type);
    var type = goog.isArray(opt_type) ? opt_type : [opt_type];
    var s = this.dispatcher_.swallows[this.identifier];
    if(!s) return;
    
    var e = this;
    var s2 = goog.array.filter(s,function(swallow){
        if(!goog.isDef(e.targetObject) || (swallow[0]==e.targetObject && (!limit_type || goog.array.contains(type,swallow[1])))){
           goog.events.unlisten(swallow[0], swallow[1], swallow[2]);
           return false;
        }
        return true;
    });
    
    if(s2.length){
        this.dispatcher_.swallows[this.identifier] = s2;
    }
    else {
        delete this.dispatcher_.swallows[this.identifier];
    }
};

/**
 * Start dragging sequence from current event
 * @param {boolean} snapToCenter Drag from center or not.
 * @param {goog.math.Box} box Limited area where dragging is possible.
 */
lime.events.Event.prototype.startDrag = function(snapToCenter, box, opt_targetObject) {

    var obj = opt_targetObject || this.targetObject;

    var x = 0,
        y = 0;

    if (!snapToCenter) {
        var centerpos = obj.localToScreen(new goog.math.Coordinate(0,0));
        x = this.screenPosition.x-centerpos.x;
        y = this.screenPosition.y-centerpos.y;
    }
    
    var curposition = obj.getPosition().clone();

    this.swallow(['touchmove', 'mousemove'], function(e) {
        var pos = e.screenPosition.clone();
        
        pos.x -= x;
        pos.y -= y;
        pos = obj.getParent().screenToLocal(pos);

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

        obj.setPosition(pos);

    });

};

lime.events.Event.prototype.clone = function(){
    var e = new lime.events.Event(this.dispatcher_);
    goog.object.extend(e, this);
    return e;
}