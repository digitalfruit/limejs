goog.provide('lime.transitions.Transition');
goog.require('goog.debug.Logger');

/**
 * Animation for switching active scenes
 * @param {lime.Scene=} outgoing Outgoing scene.
 * @param {lime.Scene=} incoming Incoming scene.
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
 * @protected
 * @type {goog.debug.Logger} logger.
 */
lime.transitions.Transition.prototype.logger =
    goog.debug.Logger.getLogger('lime.transitions.Transition');


/**
 *
 * @param {lime.Scene} outgoing
 * @param {lime.Scene} incoming
 * @param {boolean=} opt_a
 */
lime.transitions.Transition.prototype.init = function(outgoing, incoming, opt_a) {
  this.outgoing_ = outgoing;
  this.incoming_ = incoming;
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
