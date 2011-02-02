goog.provide('lime.animation.Delay');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * No-op animation. Useful for making pauses on sequence animations.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Delay = function() {
    lime.animation.Animation.call(this);
};
goog.inherits(lime.animation.Delay, lime.animation.Animation);

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.Delay.prototype.update = goog.nullFunction;

/**
 * @inheritDoc
 * @see lime.animation.Animation#reverse
 */
lime.animation.Delay.prototype.reverse = function() {
    return (new lime.animation.Delay).setDuration(this.getDuration());
};
