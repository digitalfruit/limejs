goog.provide('lime.animation.Resize');


goog.require('goog.math.Vec2');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Resize element
 * @constructor
 * @param {goog.math.Size|number} size New element size.
 * @param {number=} opt_height Optionaly use width,height as parameter
 * @extends lime.animation.Animation
 */
lime.animation.Resize = function(size, opt_height) {
    lime.animation.Animation.call(this);

    if (arguments.length == 2) {
        this.size_ = new goog.math.Size(arguments[0], arguments[1]);
    }
    else this.size_ = size;


};
goog.inherits(lime.animation.Resize, lime.animation.Animation);

/**
 * @inheritDoc
 */
lime.animation.Resize.prototype.scope = 'size';

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.Resize.prototype.makeTargetProp = function(target) {
    var size = target.getSize(),
        delta = new goog.math.Vec2(this.size_.width - size.width,
                                  this.size_.height - size.height);

    return {startSize: size,
            delta: delta};
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.Resize.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setSize(
        prop.startSize.width + prop.delta.x * t,
        prop.startSize.height + prop.delta.y * t
    );
};
