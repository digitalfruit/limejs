goog.provide('lime.events.Event');

goog.require('lime.events.Drag');

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
 * @param {boolean=} opt_deny_shared Deny further actions for same event.
 */
lime.events.Event.prototype.swallow = function(type, handler, opt_deny_shared) {
    type = goog.isArray(type) ? type : [type];
    for (var i = 0; i < type.length; i++)
    this.dispatcher_.swallow(this, type[i], handler);

    if (opt_deny_shared) {
        this.event.stopPropagation();
    }
};

/**
 * Release all swllowed handlers.
 * @param {(string|Array.<string>)=} opt_type Event types to release.
 */
lime.events.Event.prototype.release = function(opt_type) {
    var limit_type = goog.isDef(opt_type);
    var type = goog.isArray(opt_type) ? opt_type : [opt_type];
    var s = this.dispatcher_.swallows[this.identifier];
    if (!s) return;

    var e = this;
    var s2 = goog.array.filter(s, function(swallow) {
        if (!goog.isDef(e.targetObject) || (swallow[0] == e.targetObject &&
            (!limit_type || goog.array.contains(type, swallow[1])))) {
           goog.events.unlisten(swallow[0], swallow[1], swallow[2]);
           return false;
        }
        return true;
    });

    if (s2.length) {
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
 * @param {lime.Node=} opt_targetObject Different target object to drag.
 * @return {lime.events.Drag} New Drag object.
 */
lime.events.Event.prototype.startDrag = function(snapToCenter, box,
        opt_targetObject) {
    return new lime.events.Drag(this, snapToCenter, box, opt_targetObject);
};

/**
 * Retunr new event with same parameters
 * @return {lime.events.Event} event.
 */
lime.events.Event.prototype.clone = function() {
    var e = new lime.events.Event(this.dispatcher_);
    goog.object.extend(e, this);
    return e;
};
