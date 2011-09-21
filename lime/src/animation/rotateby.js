goog.provide('lime.animation.RotateBy');


goog.require('goog.math.Vec2');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Rotate by given angle in degrees
 * @constructor
 * @param {number} angle Angle to rotate.
 * @extends lime.animation.Animation
 */
lime.animation.RotateBy = function(angle) {
    lime.animation.Animation.call(this);

    this.angle_ = angle;

};
goog.inherits(lime.animation.RotateBy, lime.animation.Animation);

/**
 * @inheritDoc
 */
lime.animation.RotateBy.prototype.scope = 'rotate';

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.RotateBy.prototype.makeTargetProp = function(target) {
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.ROTATION,
            target.getRotation() + this.angle_,
            this.duration_, this.getEasing()
        );
        target.setDirty(lime.Dirty.POSITION);
    }
    return {startRot: target.getRotation() };
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.RotateBy.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);
    target.setRotation(prop.startRot + this.angle_ * t);
};

/**
 * Clear transistion when animation is stoped.
 * @param {lime.Node} target The target to clear transistion for.
 */
lime.animation.RotateBy.prototype.clearTransition = function(target) {
    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.ROTATION);
        target.setDirty(lime.Dirty.POSITION);
    }
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#reverse
 */
lime.animation.RotateBy.prototype.reverse = function() {
    return new lime.animation.RotateBy(-this.angle_).cloneParam(this);
};
