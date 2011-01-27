goog.provide('lime.animation.MoveTo');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');
goog.require('goog.math.Coordinate');

/**
 * Move element to specific position
 * Also accepts two numbers (x and y)
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.MoveTo = function(position) {
    lime.animation.Animation.call(this);

    if (arguments.length == 2) {
        this.position_ = new goog.math.Coordinate(arguments[0], arguments[1]);
    }
    else this.position_ = position;

};
goog.inherits(lime.animation.MoveTo, lime.animation.Animation);

lime.animation.MoveTo.prototype.scope = 'move';

lime.animation.MoveTo.prototype.setSpeed = function(speed) {
    this.speed_ = speed;
    return this;
};

lime.animation.MoveTo.prototype.makeTargetProp = function(target) {
    var start = target.getPosition();
    var delta = new goog.math.Coordinate(
        this.position_.x - start.x,
        this.position_.y - start.y);
    if (this.speed_) {
        this.setDuration(this.speed_ * goog.math.Coordinate.distance(delta, new goog.math.Coordinate(0, 0)) / 100);
    }
    if(this.useTransitions()){
        target.addTransition(lime.Transition.POSITION,
            this.position_,
            this.duration_,this.getEasing());
        target.setDirty(lime.Dirty.POSITION);
    }

    return {startpos: start, delta: delta};
};

lime.animation.MoveTo.prototype.update = function(t,target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setPosition(
        prop.startpos.x + prop.delta.x * t,
        prop.startpos.y + prop.delta.y * t
    );
};

lime.animation.MoveTo.prototype.clearTransition = function(target){

    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.POSITION);
        target.setDirty(lime.Dirty.POSITION);
    }
    
}

lime.animation.MoveTo.prototype.reverse = function() {
    return (new lime.animation.MoveTo(this.position_)).setDuration(this.getDuration());
};
