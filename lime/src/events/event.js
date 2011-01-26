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
    this.dispatcher_.swallow(this, type, handler);

    if(opt_deny_shared){
        this.event.stopPropagation();
    }
};

/**
 * Release all swllowed handlers.
 */
lime.events.Event.prototype.release = function() {
    var s = this.dispatcher_.swallows[this.identifier];
    for (var i = 0; i < s.length; i++) {
        goog.events.unlisten(s[i][0], s[i][1], s[i][2]);
    }
    delete this.dispatcher_.swallows[this.identifier];
};

/**
 * Start dragging sequence from current event
 * @param {boolean} snapToCenter Drag from center or not.
 * @param {goog.math.Box} box Limited area where dragging is possible.
 */
lime.events.Event.prototype.startDrag = function(snapToCenter, box) {

    var obj = this.targetObject;

    if (!goog.isDef(snapToCenter)) {
        snapToCenter = false;
    }

    var x = snapToCenter ? 0 : this.position.x,
        y = snapToCenter ? 0 : this.position.y;

    this.swallow(['touchmove', 'mousemove'], function(e) {
        var pos = e.position.clone();
        pos.x -= x;
        pos.y -= y;
        pos = obj.localToNode(pos, obj.getParent());

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

        this.setPosition(pos);

    });

};
