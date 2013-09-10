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
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.ROTATION,
            this.angle_,
            this.duration_, this.getEasing()
        );
        target.setDirty(lime.Dirty.POSITION);
    }
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

/**
 * @inheritDoc
 * @see lime.animation.Animation#clearTransition
 */
lime.animation.RotateTo.prototype.clearTransition = function(target) {
    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.ROTATION);
        target.setDirty(lime.Dirty.POSITION);
    }
};
