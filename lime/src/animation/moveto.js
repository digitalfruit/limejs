goog.provide('lime.animation.MoveTo');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Move element to specific position
 * Also accepts two numbers (x and y)
 * @constructor
 * @param {(goog.math.Coordinate|number)} position New position value.
 * @param {number=} opt_y Optionaly use x,y
 * @extends lime.animation.Animation
 */
lime.animation.MoveTo = function(position, opt_y) {
    lime.animation.Animation.call(this);

    if (arguments.length == 2) {
        this.position_ = new goog.math.Coordinate(arguments[0], arguments[1]);
    }
    else this.position_ = position;

};
goog.inherits(lime.animation.MoveTo, lime.animation.Animation);

/**
 * @inheritDoc
 */
lime.animation.MoveTo.prototype.scope = 'move';

/**
 * Helper function that sets tha animation duration
 * based on the size of the delta. 1 unit means 100px/sec.
 * Calculation is based on first target node.
 * @param {number} speed Speed value.
 * @return {lime.animation.MoveTo} Object itself.
 */
lime.animation.MoveTo.prototype.setSpeed = function(speed) {
    this.speed_ = speed;
    delete this.speedCalcDone_;
    return this;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#makeTargetProp
 */
lime.animation.MoveTo.prototype.makeTargetProp = function(target) {
    var start = target.getPosition();
    var delta = new goog.math.Coordinate(
        this.position_.x - start.x,
        this.position_.y - start.y);
        
    if (this.useTransitions()) {
        target.addTransition(lime.Transition.POSITION,
            this.position_,
            this.duration_, this.getEasing());
        target.setDirty(lime.Dirty.POSITION);
    }

    return {startpos: start, delta: delta};
};


/**
 * Calculate animations duration based on its speed.
 * @private
 */
lime.animation.MoveTo.prototype.calcDurationFromSpeed_ = function(){
    if(!this.speed_ || !this.targets.length) return;
    
    var start = this.targets[0].getPosition();
    var delta = new goog.math.Coordinate(
        this.position_.x - start.x,
        this.position_.y - start.y);
    
    this.setDuration(this.speed_ * goog.math.Coordinate.distance(
            delta, new goog.math.Coordinate(0, 0)) / 100);
    this.speedCalcDone_ = 1;
}

/**
 * @inheritDoc
 * @see lime.animation.Animation#update
 */
lime.animation.MoveTo.prototype.update = function(t, target) {
    if (this.status_ == 0) return;
    var prop = this.getTargetProp(target);

    target.setPosition(
        prop.startpos.x + prop.delta.x * t,
        prop.startpos.y + prop.delta.y * t
    );
};

/**
 * Clear transistion when animation is stoped.
 * @see lime.animation.Animation#clearTransition
 * @param {lime.Node} target The target to clear transistion for.
 */
lime.animation.MoveTo.prototype.clearTransition = function(target) {

    if (this.useTransitions()) {
        target.clearTransition(lime.Transition.POSITION);
        target.setDirty(lime.Dirty.POSITION);
    }

};

