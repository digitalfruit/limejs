goog.provide('lime.transitions.Transition');

/**
 * Animation for switching active scenes
 * @param {lime.scene} outgoing Outgoing scene.
 * @param {lime.scene} incoming Incoming scene.
 * @constructor
 */
lime.transitions.Transition = function(outgoing, incoming) {

    this.duration_ = 1.0; //sec

    this.outgoing_ = outgoing;
    this.incoming_ = incoming;

    this.finishCallback_ = goog.nullFunction;

    this.finished_ = false;
};

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
 * after the transition has finished
 * @param {function()} value Callback.
 * @return {lime.transitions.Transition} object itself.
 */
lime.transitions.Transition.prototype.setFinishCallback = function(value) {
    this.finishCallback_ = value;
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
    if (this.finished_) return;
    this.finishCallback_();
    this.finished_ = true;
};
