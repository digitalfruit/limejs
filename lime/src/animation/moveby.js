goog.provide('lime.animation.MoveBy');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Move elemenet by offset
 * Also accepts two numbers (x and y)
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.MoveBy = function(delta) {
    lime.animation.Animation.call(this);

    if (arguments.length == 2) {
        this.delta_ = new goog.math.Coordinate(arguments[0], arguments[1]);
    }
    else this.delta_ = delta;


};
goog.inherits(lime.animation.MoveBy, lime.animation.Animation);

lime.animation.MoveBy.prototype.scope = 'move';

lime.animation.MoveBy.prototype.setSpeed = function(speed) {
    this.speed_ = speed;
    this.setDuration(this.speed_ * goog.math.Coordinate.distance(this.delta_, new goog.math.Coordinate(0, 0)) / 100);
    return this;
};


lime.animation.MoveBy.prototype.makeTargetProp = function(target) {
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.POSITION,
            goog.math.Coordinate.sum(target.getPosition(), this.delta_),
            this.duration_, this.getEasing());
        target.setDirty(lime.Dirty.POSITION);
    }
    return {startpos: target.getPosition()};
};

lime.animation.MoveBy.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setPosition(
        prop.startpos.x + this.delta_.x * t,
        prop.startpos.y + this.delta_.y * t
    );

};

lime.animation.MoveBy.prototype.clearTransition = function(target) {

    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.POSITION);
        target.setDirty(lime.Dirty.POSITION);
    }


};

lime.animation.MoveBy.prototype.reverse = function() {
    var d = this.delta_.clone();
    d.x *= -1;
    d.y *= -1;

    return new lime.animation.MoveBy(d).setDuration(this.getDuration());
};
