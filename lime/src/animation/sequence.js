goog.provide('lime.animation.Sequence');


goog.require('goog.math.Coordinate');
goog.require('lime.Sprite');
goog.require('lime.animation.Animation');

/**
 * Sequence of animations that are run after each other.
 * Also accepts more than two animations
 * @param {...(lime.animation.Animation|!Array.<lime.animation.Animation>)} one First animation.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Sequence = function(one) {

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

/**
 * @inheritDoc
 * @see lime.animation.Animation#initTarget
 */
lime.animation.Sequence.prototype.initTarget = function(target) {
    lime.animation.Animation.prototype.initTarget.call(this, target);

    this.setDuration(this.actions[0].duration_ + this.actions[1].duration_);
    this.split_ = this.actions[0].duration_ / this.duration_;
    this.last_ = -1;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#stop
 */
lime.animation.Sequence.prototype.stop = function() {
    if (this.last_ && this.last_ != -1) {
        this.actions[this.last_].stop(this.targets);
    }
    lime.animation.Animation.prototype.stop.apply(this, arguments);
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#updateAll
 */
lime.animation.Sequence.prototype.updateAll = function(t,targets) {
    if (this.status_ == 0) return t;

    var i = targets.length;
    while (--i >= 0) {
        this.getTargetProp(targets[i]);
    }

    var found = 0,
        new_t = 0;

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

    if (this.last_ == -1 && found == 1) {
        this.actions[0].status_ = 1;
        //this.actions[0].initTarget(target);
        this.actions[0].updateAll(1, targets);
        this.actions[0].stop();
    }

    if (this.last_ != found) {
        if (this.last_ != -1) {
            this.actions[this.last_].updateAll(1, targets);
            this.actions[this.last_].stop();
        }
        this.actions[found].status_ = 1;
        //this.actions[found].initTarget(target);
    }

    this.actions[found].updateAll(new_t, targets);
    this.last_ = found;

    return t;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#reverse
 */
lime.animation.Sequence.prototype.reverse = function() {
    return new lime.animation.Sequence(this.actions[1].reverse(),
        this.actions[0].reverse());
};
