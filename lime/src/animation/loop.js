goog.provide('lime.animation.Loop');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Loop animation again after it has finished
 * @constructor
 * @param {lime.animation.Animation} action Animation to loop.
 * @extends lime.animation.Animation
 */
lime.animation.Loop = function(action) {

    lime.animation.Animation.call(this);

    this.action_ = action;
    goog.events.listen(action, lime.animation.Event.STOP,
        this.handleActionEnd_, false, this);

    this.setLimit(0);

    this.timesRun_ = 0;
    
    this.playing_ = 0;

    this.setDuration(action.duration_);

};
goog.inherits(lime.animation.Loop, lime.animation.Animation);

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.Loop.prototype.initTarget = function(target) {
    lime.animation.Animation.prototype.initTarget.call(this, target);

    this.setDuration(this.action_.duration_);
};

/**
 * Return the run limit value for animation. 0 means no limit.
 * @return {number} Limit.
 */
lime.animation.Loop.prototype.getLimit = function() {
    return this.limit_;
};

/**
 * Set new run limit for animation. 0 means no limit/infinity.
 * @param {number} value New limit value.
 * @return {lime.animation.Loop} object itself.
 */
lime.animation.Loop.prototype.setLimit = function(value) {
    this.limit_ = value;
    this.timesRun_ = 0;
    return this;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#play
 */
lime.animation.Loop.prototype.play = function() {
    this.action_.play();
    this.playing_ = 1;
    this.dispatchEvent({type: lime.animation.Event.START});
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#stop
 */
lime.animation.Loop.prototype.stop = function() {
    this.playing_ = 0;
    this.action_.stop();
    this.dispatchEvent({type: lime.animation.Event.STOP});

};

/**
 * Handle action end. Start new action or stop if limit reached.
 * @private
 */
lime.animation.Loop.prototype.handleActionEnd_ = function() {
    this.timesRun_++;
    if (this.playing_ && (!this.limit_ || this.timesRun_ < this.limit_)) {
        this.action_.play();
    } else {
        this.stop(); // Make sure event gets dispatched when finished
    }
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#addTarget
 */
lime.animation.Loop.prototype.addTarget = function(target) {
    this.action_.addTarget(target);
    return this;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#removeTarget
 */
lime.animation.Loop.prototype.removeTarget = function(target) {
    this.action_.removeTarget(target);
    return this;
};
