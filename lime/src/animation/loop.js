goog.provide('lime.animation.Loop');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Loop animation again after it has finished
 * @param {lime.animation.Animation} action
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Loop = function(action) {

    lime.animation.Animation.call(this);

    this.action_ = action;
    goog.events.listen(action, lime.animation.Event.STOP, lime.animation.Loop.handleAuctionEnd_, false, this);

    this.setLimit(0);

    this.timesRun_ = 0;

    this.setDuration(action.duration_);

};
goog.inherits(lime.animation.Loop, lime.animation.Animation);

lime.animation.Loop.prototype.initTarget = function(target) {
    lime.animation.Animation.prototype.initTarget.call(this, target);

    this.setDuration(this.action_.duration_);
};

lime.animation.Loop.prototype.getLimit = function() {
    return this.limit_;
};

lime.animation.Loop.prototype.setLimit = function(value) {
    this.limit_ = value;
    this.timesRun_ = 0;
    return this;
};

/**
 * Start playing the animation
 */
lime.animation.Loop.prototype.play = function() {
    this.action_.play();
    this.dispatchEvent({type: lime.animation.Event.START});
};

/**
 * Stop playing the animtion
 */
lime.animation.Loop.prototype.stop = function() {
    this.action_.stop();

    this.dispatchEvent({type: lime.animation.Event.STOP});

};

lime.animation.Loop.handleAuctionEnd_ = function() {
    this.timesRun_++;
    if (!this.limit_ || this.timesRun_ < this.limit_) {
        this.action_.play();
    }
};

lime.animation.Loop.prototype.addTarget = function(target) {
    this.action_.addTarget(target);
};

/**
 * Remove target node from animation
 * @param {lime.Node} target Node to be removed.
 */
lime.animation.Loop.prototype.removeTarget = function(target) {
    this.action_.removeTarget(target);
};
