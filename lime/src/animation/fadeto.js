goog.provide('lime.animation.FadeTo');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Animation for changing elements opacity value
 * @constructor
 * @param {number} opacity New opacity value.
 * @extends lime.animation.Animation
 */
lime.animation.FadeTo = function(opacity) {
    lime.animation.Animation.call(this);

    this.opacity_ = opacity;

};
goog.inherits(lime.animation.FadeTo, lime.animation.Animation);

/**
 * @inheritDoc
 */
lime.animation.FadeTo.prototype.scope = 'fade';

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.FadeTo.prototype.makeTargetProp = function(target) {
    var op = target.getOpacity();
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.OPACITY,
            this.opacity_,
            this.duration_, this.getEasing());

        target.setDirty(lime.Dirty.ALPHA);
    }
    return {startOpacity: op, delta: this.opacity_ - op };
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.FadeTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setOpacity(prop.startOpacity + prop.delta * t);

};

/**
 * Clear transistion when animation is stoped.
 * @param {lime.Node} target The target to clear transistion for.
 */
lime.animation.FadeTo.prototype.clearTransition = function(target) {
    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.OPACITY);
        target.setDirty(lime.Dirty.ALPHA);
    }
};

