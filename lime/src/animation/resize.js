goog.provide('lime.animation.Resize');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');
goog.require('goog.math.Vec2');

/**
 * Resize element
 * @param {goog.math.Size} size
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Resize = function(scale) {
    lime.animation.Animation.call(this);

    if (arguments.length == 1 && goog.isNumber(scale)) {
        this.size_ = new goog.math.Size(scale, scale);
    }
    else if (arguments.length == 2) {
        this.size_ = new goog.math.Size(arguments[0], arguments[1]);
    }
    else this.size_ = size;


};
goog.inherits(lime.animation.Resize, lime.animation.Animation);

lime.animation.Resize.prototype.scope = 'size';

lime.animation.Resize.prototype.makeTargetProp = function(target) {
    var size = target.getSize(),
        delta = new goog.math.Vec2(this.size_.width - size.width,
                                  this.size_.height - size.height);

    return {startSize: size,
            delta: delta};
};

lime.animation.Resize.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setSize(
        prop.startSize.width + prop.delta.x * t,
        prop.startSize.height + prop.delta.y * t
    );
};
