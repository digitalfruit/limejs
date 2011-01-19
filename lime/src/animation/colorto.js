goog.provide('lime.animation.ColorTo');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Animation for changing element's fillcolor value
 * @param {mixed...} args Color definition.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.ColorTo = function(args) {
    lime.animation.Animation.call(this);

    this.rgb_ = null;

    var color = lime.fill.parse(arguments);
    
    if (color instanceof lime.fill.Color) {
        this.rgb_ = color.getRgb();
    }
};
goog.inherits(lime.animation.ColorTo, lime.animation.Animation);

/** @inheritDoc */
lime.animation.ColorTo.prototype.scope = 'color';

/** @inheritDoc */
lime.animation.ColorTo.prototype.makeTargetProp = function(target) {
    var fill = target.getFill();
    return (fill instanceof lime.fill.Color) ?
        {start: [fill.r, fill.g, fill.b],
         delta: [this.rgb_[0] - fill.r, this.rgb_[1] - fill.g,
            this.rgb_[2] - fill.b]} :
        {};
};

/** @inheritDoc */
lime.animation.ColorTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;

    var prop = this.getTargetProp(target);
    if ('start' in prop) {
        target.setFill(
            Math.round(prop.start[0] + prop.delta[0] * t),
            Math.round(prop.start[1] + prop.delta[1] * t),
            Math.round(prop.start[2] + prop.delta[2] * t)
        );
    }
};
