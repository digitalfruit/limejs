goog.provide('lime.events.Drag');

goog.require('goog.events.EventTarget');
goog.require('lime.animation.MoveTo');


/**
 * Object representing Drag interaction.
 * @constructor
 * @param {lime.events.Event} event Event that started dragging.
 * @param {boolean=} opt_snapToCenter If dragging relates to center position.
 * @param {goog.math.Box=} opt_bounds Drag area limit.
 * @param {lime.Node=} opt_targetObject Different target object.
 * @extends goog.events.EventTarget
 */
lime.events.Drag = function(event, opt_snapToCenter, opt_bounds,
        opt_targetObject) {

    goog.base(this);

    this.target = opt_targetObject || event.targetObject;

    /** @type {Array.<lime.Node>} */
    this.dropTargets_ = [];
    this.dropIndex_ = -1;

    this.x = 0;
    this.y = 0;

    if (!opt_snapToCenter) {
        var centerpos = this.target.localToScreen(
            new goog.math.Coordinate(0, 0));
        this.x = event.screenPosition.x - centerpos.x;
        this.y = event.screenPosition.y - centerpos.y;
    }

    event.swallow(['touchmove', 'mousemove'],
        goog.bind(this.moveHandler_, this));
    event.swallow(['touchend', 'touchcancel', 'mouseup'],
        goog.bind(this.releaseHandler_, this));

    this.setBounds(opt_bounds || null);

    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.START));

};
goog.inherits(lime.events.Drag, goog.events.EventTarget);

/**
 * Enum for dragging related events
 * @enum {string}
 */
lime.events.Drag.Event = {
    START: 'start',
    END: 'end',
    MOVE: 'move',
    CHANGE: 'change',
    DROP: 'drop',
    CANCEL: 'cancel'
};

/**
 * @inheritDoc
 */
lime.events.Drag.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    this.event_ = null;
    this.target = null;
    this.dropTargets_ = null;
};

/**
 * Return the area limit.
 * @return {goog.math.Box} Bounding box.
 */
lime.events.Drag.prototype.getBounds = function() {
    return this.bounds_;
};

/**
 * Set new limitation area.
 * @param {goog.math.Box} bounds Bounding box.
 */
lime.events.Drag.prototype.setBounds = function(bounds) {
    this.bounds_ = bounds;
};

/**
 * Handle move events.
 * @private
 * @param {lime.events.Event} e Event.
 */
lime.events.Drag.prototype.moveHandler_ = function(e) {
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
    for (var i = 0; i < this.dropTargets_.length; i++) {
        var loc = this.dropTargets_[i];
        if(goog.isFunction(loc.confirmTargetActive)){
            if(!loc.confirmTargetActive(this.target)){
                continue;
            }
        }
        var dropFrame = loc.getFrame();
        var tl = loc.localToNode(new goog.math.Coordinate(
            dropFrame.left, dropFrame.top), this.target);
        var br = loc.localToNode(new goog.math.Coordinate(
            dropFrame.right, dropFrame.bottom), this.target);
        var droprect = goog.math.Rect.createFromBox(
            new goog.math.Box(Math.min(tl.y, br.y), Math.max(tl.x, br.x), Math.max(tl.y,br.y), Math.min(br.x,tl.x)));
        var intersection = goog.math.Rect.intersection(currect, droprect);

        if (intersection) {
            results.push([intersection.width * intersection.height /
                (droprect.width * droprect.height), i]);
        }
    }

    if (results.length) {
        results = results.sort(function(a, b) {return b[0] - a[0];});
        sel = results[0][1];
   }

   if (sel != this.dropIndex_) {
        if (this.dropIndex_ != -1) {
            if (goog.isFunction(this.dropTargets_[this.dropIndex_].hideDropHighlight)) {
                this.dropTargets_[this.dropIndex_].hideDropHighlight();
            }
        }
        this.dropIndex_ = sel;
        if (this.dropIndex_ != -1) {
            if (goog.isFunction(
                this.dropTargets_[this.dropIndex_].showDropHighlight)) {
                this.dropTargets_[this.dropIndex_].showDropHighlight();
            }
        }

        var ev = new goog.events.Event(lime.events.Drag.Event.CHANGE);
        ev.activeDropTarget = this.dropIndex_ != -1 ?
            this.dropTargets_[this.dropIndex_] : null;
        this.dispatchEvent(ev);

    }



};

/**
 * Handle release events.
 * @private
 * @param {lime.events.Event} e Event.
 */
lime.events.Drag.prototype.releaseHandler_ = function(e) {

    if (this.dropIndex_ != -1) {
        var ev = new goog.events.Event(lime.events.Drag.Event.DROP);
        ev.activeDropTarget = this.dropTargets_[this.dropIndex_];
        if (goog.isFunction(ev.activeDropTarget.showDropHighlight)) {
            ev.activeDropTarget.hideDropHighlight();
        }
        this.dispatchEvent(ev);
        if (!ev.propagationStopped_) {
            var pos = ev.activeDropTarget.getParent().localToNode(
                ev.activeDropTarget.getPosition(), this.target.getParent());
            var move = new lime.animation.MoveTo(pos)
                .setDuration(.5).enableOptimizations();
            this.target.runAction(move);
            if (goog.isFunction(ev.moveEndedCallback)) {
                goog.events.listen(move, lime.animation.Event.STOP,
                    ev.moveEndedCallback, false, this.target);
            }
        }
    }
    else {
        this.dispatchEvent(new goog.events.Event(
            lime.events.Drag.Event.CANCEL));
    }

    this.dispatchEvent(new goog.events.Event(lime.events.Drag.Event.END));

    lime.scheduleManager.callAfter(this.dispose, this, 100);

};

/**
 * Add another node as drop target.
 * @param {lime.Node} drop Drop target node.
 */
lime.events.Drag.prototype.addDropTarget = function(drop) {
    this.dropTargets_.push(drop);
};

