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

    this.target_ = lime.animation.ColorTo.Target.FILL;

    var color = lime.fill.parse(goog.array.toArray(arguments));

    if (color instanceof lime.fill.Color) {
        this.rgba_ = color.getRgba();
    }
};
goog.inherits(lime.animation.ColorTo, lime.animation.Animation);

/** @inheritDoc */
lime.animation.ColorTo.prototype.scope = 'color';

/**
 * Element component to apply the animation
 * @enum {string}
 */
lime.animation.ColorTo.Target = {
    FILL: 'fill',
    STROKE: 'stroke',
    FONT: 'font'
};

/**
 * Set the component to apply the animation
 * @param {lime.animation.ColorTo.Target} component type.
 * @return {lime.animation.ColorTo} object itself.
 */
lime.animation.ColorTo.prototype.setTargetComponent = function(target) {
    this.target_ = target;
    return this;
};

/**
 * Return the animation target component
 * @return {lime.animation.ColorTo.Target} component type.
 */
lime.animation.ColorTo.prototype.getTargetComponent = function() {
    return this.target_;
};

/** @inheritDoc */
lime.animation.ColorTo.prototype.makeTargetProp = function(target) {
    var fill, oldrgb;

    switch (this.target_) {
        case lime.animation.ColorTo.Target.FILL:
            fill = target.getFill(),
            oldrgb = fill instanceof lime.fill.Color ? fill.getRgba() : [255, 255, 255, 0];
            break;
        case lime.animation.ColorTo.Target.STROKE:
            fill = target.getStroke().getColor();
            oldrgb = fill instanceof lime.fill.Color ? fill.getRgba() : [255, 255, 255, 0];
            break;
        case lime.animation.ColorTo.Target.FONT:
            oldrgb = goog.color.hexToRgb(target.getFontColor());
            break;
    }

    return {start: oldrgb,
         delta: [this.rgba_[0] - oldrgb[0], this.rgba_[1] - oldrgb[1],
            this.rgba_[2] - oldrgb[2], this.rgba_[3] - oldrgb[3]]};
};

/** @inheritDoc */
lime.animation.ColorTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;

    var prop = this.getTargetProp(target),
        red = Math.round(prop.start[0] + prop.delta[0] * t),
        green = Math.round(prop.start[1] + prop.delta[1] * t),
        blue = Math.round(prop.start[2] + prop.delta[2] * t),
        alpha;

    if ('start' in prop) {
        switch (this.target_) {
            case lime.animation.ColorTo.Target.FILL:
                alpha = prop.start[3] + prop.delta[3] * t;
                target.setFill(red, green, blue, alpha);
                break;
            case lime.animation.ColorTo.Target.STROKE:
                alpha = prop.start[3] + prop.delta[3] * t;
                target.setStroke(target.getStroke().setColor(red, green, blue, alpha));
                break;
            case lime.animation.ColorTo.Target.FONT:
                target.setFontColor(goog.color.rgbToHex(red, green, blue));
                break;
        }
    }
};
