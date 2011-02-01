goog.provide('lime.animation.ScaleTo');


goog.require('goog.math.Vec2');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Scale to a given factor
 * Also accepts one or two numbers
 * @param {goog.math.Vec2} factor
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.ScaleTo = function(scale) {
    lime.animation.Animation.call(this);

    if (arguments.length == 1 && goog.isNumber(scale)) {
        this.scale_ = new goog.math.Vec2(scale, scale);
    }
    else if (arguments.length == 2) {
        this.scale_ = new goog.math.Vec2(arguments[0], arguments[1]);
    }
    else this.scale_ = scale;


};
goog.inherits(lime.animation.ScaleTo, lime.animation.Animation);

lime.animation.ScaleTo.prototype.scope = 'scale';

lime.animation.ScaleTo.prototype.makeTargetProp = function(target) {
    var scale = target.getScale(),
        delta = new goog.math.Vec2(this.scale_.x - scale.x,
                                  this.scale_.y - scale.y);

    if (this.useTransitions()) {
        target.addTransition(lime.Transition.SCALE,
            new goog.math.Vec2(scale.x + delta.x, scale.y + delta.y),
            this.duration_, this.getEasing());
        target.setDirty(lime.Dirty.SCALE);
    }

    return {startScale: scale,
            delta: delta};
};

lime.animation.ScaleTo.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setScale(
        prop.startScale.x + prop.delta.x * t,
        prop.startScale.y + prop.delta.y * t
    );
};

lime.animation.ScaleTo.prototype.clearTransition = function(target) {
    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.SCALE);
        target.setDirty(lime.Dirty.SCALE);
    }
};

lime.animation.ScaleTo.prototype.reverse = function() {
    return (new lime.animation.ScaleTo(this.scale_)).setDuration(this.getDuration());
};
