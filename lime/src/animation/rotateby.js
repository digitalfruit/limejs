goog.provide('lime.animation.RotateBy');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');
goog.require('goog.math.Vec2');

/**
 * Rotate by given angle in degrees
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.RotateBy = function(angle) {
    lime.animation.Animation.call(this);

    this.angle_ = angle;

};
goog.inherits(lime.animation.RotateBy, lime.animation.Animation);

lime.animation.RotateBy.prototype.scope = 'rotate';

lime.animation.RotateBy.prototype.makeTargetProp = function(target) {
    return {startRot: target.getRotation() };
};

lime.animation.RotateBy.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);
    target.setRotation(prop.startRot + this.angle_ * t);
};

lime.animation.RotateBy.prototype.reverse = function() {
    return (new lime.animation.ScaleBy(-this.angle_)).setDuration(this.getDuration());
};
