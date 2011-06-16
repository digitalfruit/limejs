goog.provide('lime.transitions.Transition');

/**
 * Animation for switching active scenes
 * @param {lime.Scene} outgoing Outgoing scene.
 * @param {lime.Scene} incoming Incoming scene.
 * @constructor
 * @extends goog.events.EventTarget
 */
lime.transitions.Transition = function(outgoing, incoming) {
    goog.events.EventTarget.call(this);

    this.duration_ = 1.0; //sec

    this.outgoing_ = outgoing;
    this.incoming_ = incoming;

    this.finished_ = false;
};
goog.inherits(lime.transitions.Transition,goog.events.EventTarget);

/**
 * Returns the animation duration in seconds.
 * @return {number} duration.
 */
lime.transitions.Transition.prototype.getDuration = function() {
    return this.duration_;
};

/**
 * Set the duration of the transition.
 * @param {number} value New duration.
 * @return {lime.transitions.Transition} object itself.
 */
lime.transitions.Transition.prototype.setDuration = function(value) {
    this.duration_ = value;
    return this;
};

/**
 * Set finish callback for transition. This function will be called
 * after the transition has finished. DEPRECATED! Use event listeners instead.
 * @deprecated
 * @param {function()} value Callback.
 * @return {lime.transitions.Transition} object itself.
 */
lime.transitions.Transition.prototype.setFinishCallback = function(value) {
    if(goog.DEBUG && console && console.warn){
        console.warn('Transition.prototype.setFinishCallback() is deprecated. Use event listeners.');
    }
    return this;
};

/**
 * Start the transition animation.
 */
lime.transitions.Transition.prototype.start = function() {

    this.incoming_.setPosition(new goog.math.Coordinate(0, 0));
    this.incoming_.setHidden(false);
    this.finish();
};

/**
 * Complete the transition animation
 */
lime.transitions.Transition.prototype.finish = function() {
    this.dispatchEvent(new goog.events.Event('end'));
    this.finished_ = true;
};
