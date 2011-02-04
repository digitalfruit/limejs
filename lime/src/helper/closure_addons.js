goog.provide('goog.math.Box.size');
goog.provide('goog.math.Size.scaleVec2');


goog.require('goog.math.Box');
goog.require('goog.math.Size');

/**
 * Return size of the box
 * @return {goog.math.Size} Size of the box.
 */
goog.math.Box.prototype.size = function() {
    return new goog.math.Size(this.right - this.left, this.bottom - this.top);
};


/**
 * Scales the size with by 2 dimensional vector
 * @param {goog.math.Vec2} v Vector to scale.
 * @return {goog.math.Size} This size object after scaling.
 */
goog.math.Size.prototype.scaleVec2 = function(v) {
    this.width *= v.x;
    this.height *= v.y;
    return this;
};
