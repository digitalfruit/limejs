goog.provide('lime.animation.FadeTo');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Animation for changing elements opacity value
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.FadeTo = function(opacity) {
    lime.animation.Animation.call(this);

    this.opacity_ = opacity;

};
goog.inherits(lime.animation.FadeTo, lime.animation.Animation);

lime.animation.FadeTo.prototype.scope = 'fade';

lime.animation.FadeTo.prototype.makeTargetProp = function(target) {
    var op = target.getOpacity();
    if (this.useTransitions() && target.domElement) {
        lime.style.setTransition(target.domElement, 'opacity', this.duration_, this.getEasing());
        goog.style.setOpacity(target.domElement, this.opacity_);
        target.transition_opactity_ = true;
    }
    return {startOpacity: op, delta: this.opacity_ - op };
};

lime.animation.FadeTo.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setOpacity(prop.startOpacity + prop.delta * t);

};

lime.animation.FadeTo.prototype.clearTransition = function(target){
    if (target.transition_opactity_) {
        delete target.transition_opactity_;
        lime.style.clearTransition(target.domElement, 'opacity');
    }
}

lime.animation.FadeTo.prototype.reverse = function() {
    return (new lime.animation.FadeTo(this.opacity_)).setDuration(this.getDuration());
};
