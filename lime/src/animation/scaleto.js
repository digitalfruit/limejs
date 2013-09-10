goog.provide('lime.animation.ScaleTo');


goog.require('goog.math.Vec2');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Scale to a given factor
 * Also accepts one or two numbers
 * @param {goog.math.Vec2|number} scale Target value.
 * @param {number=} opt_height Alternatively use width,height as parameter.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.ScaleTo = function(scale, opt_height) {
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

/**
 * @inheritDoc
 */
lime.animation.ScaleTo.prototype.scope = 'scale';

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
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

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.ScaleTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setScale(
        prop.startScale.x + prop.delta.x * t,
        prop.startScale.y + prop.delta.y * t
    );
};

/**
 * Clear transistion when animation is stoped.
 * @param {lime.Node} target The target to clear transistion for.
 */
lime.animation.ScaleTo.prototype.clearTransition = function(target) {
    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.SCALE);
        target.setDirty(lime.Dirty.SCALE);
    }
};

