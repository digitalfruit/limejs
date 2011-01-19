goog.provide('lime.animation.Sequence');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');
goog.require('goog.math.Coordinate');

/**
 * Sequence of animations that are run after each other.
 * Also accepts more than two animations
 * @param {lime.animation.Animation} one
 * @param {lime.animation.Animation} two
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Sequence = function(one,two) {

    lime.animation.Animation.call(this);

    var act = goog.array.toArray(arguments);
    if (goog.isArray(one)) act = one;

    if (act.length > 2) {

        var first = act.shift();
        this.actions = [first, new lime.animation.Sequence(act)];

    }
    else {
        this.actions = act;
    }


    this.setDuration(this.actions[0].duration_ + this.actions[1].duration_);

};
goog.inherits(lime.animation.Sequence, lime.animation.Animation);

lime.animation.Sequence.prototype.initTarget = function(target) {
    lime.animation.Animation.prototype.initTarget.call(this, target);

    this.setDuration(this.actions[0].duration_ + this.actions[1].duration_);
    this.split_ = this.actions[0].duration_ / this.duration_;
    this.last_ = -1;
};

lime.animation.Sequence.prototype.update = function(t,target) {
    if (this.status_ == 0) return;

    var prop = this.getTargetProp(target);

    var found = 0,
        new_t = 0,
        uid = goog.getUid(target);

    if (t >= this.split_) {
        found = 1;
        if (this.split_ == 1) new_t = 1;
        else new_t = (t - this.split_) / (1 - this.split_);
    }
    else {
        found = 0;
        if (this.split_ != 0) new_t = t / this.split_;
        else new_t = 1;
    }

    if (this.last_ == -1 && found == 1)	{
        this.actions[0].initTarget(target);
        this.actions[0].update(1, target);
        this.actions[0].stop();
    }

    if (this.last_ != found) {
    	if (this.last_ != -1) {
    	    this.actions[this.last_].update(1, target);
    	    this.actions[this.last_].stop();
    	}
    	this.actions[found].initTarget(target);
    }

    this.actions[found].update(new_t, target);
    this.last_ = found;

};

lime.animation.Sequence.prototype.reverse = function() {
    return (new lime.animation.Sequence(this.actions[1].reverse(), this.actions[0].reverse()));
};
