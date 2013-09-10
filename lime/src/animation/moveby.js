goog.provide('lime.animation.MoveBy');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Move elemenet by offset
 * Also accepts two numbers (x and y)
 * @example
 * var moveleft = new lime.animation.MoveBy(100,0);
 * sprite.runAction(moveleft);
 * @constructor
 * @param {(goog.math.Coordinate|number)} delta Offset to move.
 * @param {number=} opt_y Optionaly use x,y
 * @extends lime.animation.Animation
 */
lime.animation.MoveBy = function(delta, opt_y) {
    lime.animation.Animation.call(this);

    if (arguments.length == 2) {
        this.delta_ = new goog.math.Coordinate(arguments[0], arguments[1]);
    } else {
        this.delta_ = /** @type {!goog.math.Coordinate} */ (delta);
    }


};
goog.inherits(lime.animation.MoveBy, lime.animation.Animation);

/** @inheritDoc */
lime.animation.MoveBy.prototype.scope = 'move';

/**
 * Helper function that sets tha animation duration
 * based on the size of the delta. 1 unit means 100px/sec.
 * @param {number} speed Speed value.
 * @return {lime.animation.MoveBy} Object itself.
 */
lime.animation.MoveBy.prototype.setSpeed = function(speed) {
    this.speed_ = speed;
    this.calcDurationFromSpeed_();
    return this;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.MoveBy.prototype.makeTargetProp = function(target) {
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.POSITION,
            goog.math.Coordinate.sum(target.getPosition(), this.delta_),
            this.duration_, this.getEasing());
        target.setDirty(lime.Dirty.POSITION);
    }
    return {startpos: target.getPosition()};
};

/**
 * Calculate animations duration based on its speed.
 * @private
 */
lime.animation.MoveBy.prototype.calcDurationFromSpeed_ = function(){
    if(!this.speed_) return;
    
    this.setDuration(this.speed_ * goog.math.Coordinate.distance(
        this.delta_, new goog.math.Coordinate(0, 0)) / 100);
            
    this.speedCalcDone_ = 1;
}

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.MoveBy.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setPosition(
        prop.startpos.x + this.delta_.x * t,
        prop.startpos.y + this.delta_.y * t
    );

};

/**
 * Clear previously set transition values.
 * @param {lime.Node} target Target node.
 */
lime.animation.MoveBy.prototype.clearTransition = function(target) {

    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.POSITION);
        target.setDirty(lime.Dirty.POSITION);
    }


};

/**
 * @inheritDoc
 * @see lime.animation.Animation#reverse
 */
lime.animation.MoveBy.prototype.reverse = function() {
    var d = this.delta_.clone();
    d.x *= -1;
    d.y *= -1;

    return new lime.animation.MoveBy(d).cloneParam(this);
};
