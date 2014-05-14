goog.provide('lime.animation.RotateTo');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Rotate to given angle in degrees
 * @constructor
 * @param {number} angle Target rotation value.
 * @extends lime.animation.Animation
 */
lime.animation.RotateTo = function(angle) {
    lime.animation.Animation.call(this);

    this.angle_ = angle;

};
goog.inherits(lime.animation.RotateTo, lime.animation.Animation);

/**
 * @inheritDoc
 */
lime.animation.RotateTo.prototype.scope = 'rotate';

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.RotateTo.prototype.makeTargetProp = function(target) {
    var rot = target.getRotation();

    return {startRot: rot, delta: this.angle_ - rot };
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.RotateTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);
    target.setRotation(prop.startRot + prop.delta * t);
};
