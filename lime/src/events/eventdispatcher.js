goog.provide('lime.events.EventDispatcher');

goog.require('lime.events.Event');

/**
 * EventDispatcher object. Deals with event handlers
 * @param {lime.Director} director Director object.
 * @constructor
 */
lime.events.EventDispatcher = function(director) {
    this.director = director;
    this.handlers = {};
    this.swallows = {};

};

/**
 * Register the event listener for node
 * @param {lime.Node} node Node that responds to events.
 * @param {string} eventType type of event to listen.
 */
lime.events.EventDispatcher.prototype.register = function(node, eventType) {
    if (!goog.isDef(this.handlers[eventType])) {
        this.handlers[eventType] = [node];
        //base element switch here because safari fires touchend on
        //dom tree changes otherwise
        goog.events.listen(eventType.substring(0, 5) == 'touch' && node!=this.director ?
            document : (eventType.substring(0, 3) == 'key' ?
            window : this.director.domElement.parentNode), eventType,
            this, false, this);
    }
    else {
        if (!goog.array.contains(this.handlers[eventType], node)) {
            this.handlers[eventType].push(node);
            this.handlers[eventType].sort(lime.Node.compareNode);
        }
    }
};

/**
 * Release the event listener for node
 * @param {lime.Node} node Node that responds to events.
 * @param {string} eventType type of event to release.
 */
lime.events.EventDispatcher.prototype.release = function(node, eventType) {
    if (goog.isDef(this.handlers[eventType])) {
         goog.array.remove(this.handlers[eventType], node);
         if (!this.handlers[eventType].length) {
             goog.events.unlisten(this.director.domElement.parentNode,
                 eventType, this, false, this);
            delete this.handlers[eventType];
         }
    }
};

/**
 * Update order of handler nodes. Called on tree changes.
 * @param {lime.Node} node Node that has changed.
 */
lime.events.EventDispatcher.prototype.updateDispatchOrder = function(node){
    for(var eventType in this.handlers){
        var handlers = this.handlers[eventType];
        if(goog.array.contains(handlers,node)){
            handlers.sort(lime.Node.compareNode);
        }
    }
}

/**
 * Setup swallow rule for an event. Swallow means that next events from
 * same interaction will go straight to the handler
 * @param {lime.events.Event} e Event.
 * @param {string} type Event type.
 * @param {function(lime.events.Event)} handler Function to call.
 */
lime.events.EventDispatcher.prototype.swallow = function(e, type, handler) {
   /*
   // don't remember why this check was needed
   if (e.type != 'mousedown' && e.type != 'touchstart' &&
        e.type != 'touchmove' && e.type != 'keydown') return;*/
    var id = e.identifier;
    if (!goog.isDef(this.swallows[id])) {
        this.swallows[id] = [];
    }
    this.swallows[id].push([e.targetObject, type, handler]);
    //console.log('listen');
    goog.events.listen(e.targetObject, type, goog.nullFunction);
};

/**
 * Handle DOM event
 * @param {Event} e Event.
 */
lime.events.EventDispatcher.prototype.handleEvent = function(e) {

    if (!goog.isDef(this.handlers[e.type])) return;

    var handlers = this.handlers[e.type].slice(), didhandle = false;

    var touchIndex = 0, doBreak = 0;

    while (!doBreak) {

    var ee = new lime.events.Event(this);
    ee.type = e.type;
    ee.event = e;

    if (e.type.substring(0, 5) == 'touch') {
        var touch = e.getBrowserEvent().changedTouches[touchIndex];
        ee.screenPosition = new goog.math.Coordinate(touch.pageX, touch.pageY);
        ee.identifier = touch.identifier;
        touchIndex++;

        if (touchIndex >= e.getBrowserEvent().changedTouches.length) {
            doBreak = 1;
        }
    }
    else {
        ee.screenPosition = new goog.math.Coordinate(
            e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
            e.clientY + document.body.scrollTop + document.documentElement.scrollTop
        );
        doBreak = 1;
    }

    if (goog.isDef(this.swallows[ee.identifier])) {
        var s = this.swallows[ee.identifier];

        for (var i = 0; i < s.length; i++) {
            if (s[i][1] == e.type || (goog.isArray(s[i][1]) &&
                    goog.array.contains(s[i][1], e.type))) {

                var handler = s[i][0];
                ee.targetObject = handler;
                ee.position = handler.screenToLocal(ee.screenPosition);
                s[i][2].call(handler, ee);
                didhandle = true;
            }
        }
        //handler.dispatchEvent(ee);

        if (e.type == 'touchend' || e.type == 'touchcancel' ||
            e.type == 'mouseup' || e.type == 'keyup') {
            delete ee.targetObject;
            ee.release();
        }
    }
    else {
        for (var i = 0; i < handlers.length; i++) {

            var handler = handlers[i];

            if (this.director.getCurrentScene() != handler.getScene() &&
                handler != this.director) continue;

            if (handler.getHidden() || !handler.inTree_) continue;

            ee.targetObject = handler;

            if (handler.hitTest(ee) || e.type.substring(0, 3) == 'key') {

                ee.targetObject = handler;
                handler.dispatchEvent(ee);
                didhandle = true;

                if (ee.event.propagationStopped_) break;
            }

        }

    }

    }

    if (didhandle)
    e.preventDefault();

};
