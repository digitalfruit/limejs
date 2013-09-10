goog.provide('lime.animation.Spawn');

goog.require('lime.animation.Animation');
goog.require('lime.animation.Delay');
goog.require('lime.animation.Sequence');

/**
 * Animations that are run parallel with each other.
 * Also accepts more than two animations
 * @param {...(lime.animation.Animation|!Array.<lime.animation.Animation>)} one First animation.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.Spawn = function(one) {

    lime.animation.Animation.call(this);

    var act = goog.array.toArray(arguments);
    if (goog.isArray(one)) act = one;

    if (act.length > 2) {

        this.one = act.shift();
        this.two = new lime.animation.Spawn(act);
    }
    else {
        this.one = act[0];
        this.two = act[1];
    }
    var d1 = this.one.duration_;
    var d2 = this.two.duration_;

    this.setDuration(Math.max(d1, d2));

    var delay = new lime.animation.Delay;

    if (d1 > d2) {
        this.two = new lime.animation.Sequence(this.two,
            delay.setDuration(d1 - d2));
    }
    else if (d1 < d2) {
        this.one = new lime.animation.Sequence(this.one,
            delay.setDuration(d2 - d1));
    }

};
goog.inherits(lime.animation.Spawn, lime.animation.Animation);

/**
 * @inheritDoc
 * @see lime.animation.Animation#initTarget
 */
lime.animation.Spawn.prototype.initTarget = function(target) {
    lime.animation.Animation.prototype.initTarget.call(this, target);

    this.one.status_ = 1;
    this.two.status_ = 1;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#updateAll
 */
lime.animation.Spawn.prototype.updateAll = function(t, targets) {
    if (this.status_ == 0) return undefined;
    var i = targets.length;
    while (--i >= 0) {
        this.getTargetProp(targets[i]);
    }
    this.one.updateAll(t, targets);
    this.two.updateAll(t, targets);
    
    return t;
};

/**
 * @inheritDoc
 * @see lime.animation.Animation#reverse
 */
lime.animation.Spawn.prototype.reverse = function() {
    return new lime.animation.Spawn(this.one.reverse(), this.two.reverse());
};
