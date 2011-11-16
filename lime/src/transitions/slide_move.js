goog.provide('lime.transitions.MoveInDown');

goog.provide('lime.transitions.MoveInLeft');
goog.provide('lime.transitions.MoveInRight');
goog.provide('lime.transitions.MoveInUp');
goog.provide('lime.transitions.SlideIn');


goog.provide('lime.transitions.SlideInDown');
goog.provide('lime.transitions.SlideInLeft');
goog.provide('lime.transitions.SlideInRight');
goog.provide('lime.transitions.SlideInUp');


goog.require('lime.animation.MoveBy');
goog.require('lime.transitions.Transition');

/**
 * Slide-In transition.
 * @param {lime.scene} outgoing Outgoing scene.
 * @param {lime.scene} incoming Incoming scene.
 * @param {boolean=} opt_movein Use Move-In transition.
 * @constructor
 * @extends lime.transitions.Transition
 */
lime.transitions.SlideIn = function(outgoing, incoming, opt_movein) {
    goog.base(this, outgoing, incoming);

    this.mode_ = lime.transitions.SlideIn.Mode.LEFT;

    this.movein_ = opt_movein || false;

};
goog.inherits(lime.transitions.SlideIn, lime.transitions.Transition);


/**
 * Enum for different animation directions.
 * @enum {number}
 */
lime.transitions.SlideIn.Mode = {
  LEFT: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 4
};

/** @inheritDoc */
lime.transitions.SlideIn.prototype.start = function() {
    var size = this.incoming_.getSize();
    var delta = new goog.math.Coordinate(0, 0);

    switch (this.mode_) {
        case lime.transitions.SlideIn.Mode.LEFT:
            this.incoming_.setPosition(-size.width, 0);
            delta.x = size.width;
        break;

        case lime.transitions.SlideIn.Mode.UP:
            this.incoming_.setPosition(0, -size.height);
            delta.y = size.height;
        break;

        case lime.transitions.SlideIn.Mode.RIGHT:
            this.incoming_.setPosition(size.width, 0);
            delta.x = -size.width;
        break;

        case lime.transitions.SlideIn.Mode.DOWN:
            this.incoming_.setPosition(0, size.height);
            delta.y = -size.height;
        break;
    }
    this.incoming_.setHidden(false);

    var move = new lime.animation.MoveBy(delta).
            setDuration(this.getDuration());

    if (this.outgoing_ && !this.movein_) move.addTarget(this.outgoing_);

    move.addTarget(this.incoming_);

    goog.events.listen(move, lime.animation.Event.STOP,
        this.finish, false, this);

    move.play();
};

/** @inheritDoc */
lime.transitions.SlideIn.prototype.finish = function() {
    if (this.outgoing_)
        this.outgoing_.setPosition(0, 0);

    lime.transitions.Transition.prototype.finish.call(this);
};

/**
 * Set the mode for transition. Mode defines the animation direction.
 * @param {lime.transitions.SlideIn.Mode} value New mode.
 * @return {lime.transitions.SlideIn} object itself.
 */
lime.transitions.SlideIn.prototype.setMode = function(value) {
    this.mode_ = value;
    return this;
};


/**
 * @inheritDoc
 * @extends lime.transitions.SlideIn
 */
lime.transitions.SlideInLeft = lime.transitions.SlideIn;

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideIn
 */
lime.transitions.SlideInUp = function(outgoing, incoming, opt_movein) {
    goog.base(this, outgoing, incoming, opt_movein);

    this.setMode(lime.transitions.SlideIn.Mode.UP);
};
goog.inherits(lime.transitions.SlideInUp, lime.transitions.SlideIn);

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideIn
 */
lime.transitions.SlideInRight = function(outgoing, incoming, opt_movein) {
    goog.base(this, outgoing, incoming, opt_movein);

    this.setMode(lime.transitions.SlideIn.Mode.RIGHT);
};
goog.inherits(lime.transitions.SlideInRight, lime.transitions.SlideIn);

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideIn
 */
lime.transitions.SlideInDown = function(outgoing, incoming, opt_movein) {
    goog.base(this, outgoing, incoming, opt_movein);

    this.setMode(lime.transitions.SlideIn.Mode.DOWN);
};
goog.inherits(lime.transitions.SlideInDown, lime.transitions.SlideIn);




/**
 * Move-In transition. Difference form slide-in is that outgoing scene
 * does not move.
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideInLeft
 */
lime.transitions.MoveInLeft = function(outgoing, incoming) {
    goog.base(this, outgoing, incoming, true);
};
goog.inherits(lime.transitions.MoveInLeft, lime.transitions.SlideInLeft);

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideInUp
 */
lime.transitions.MoveInUp = function(outgoing, incoming) {
    goog.base(this, outgoing, incoming, true);
};
goog.inherits(lime.transitions.MoveInUp, lime.transitions.SlideInUp);

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideInRight
 */
lime.transitions.MoveInRight = function(outgoing, incoming) {
    goog.base(this, outgoing, incoming, true);
};
goog.inherits(lime.transitions.MoveInRight, lime.transitions.SlideInRight);

/**
 * @inheritDoc
 * @constructor
 * @extends lime.transitions.SlideInDown
 */
lime.transitions.MoveInDown = function(outgoing, incoming) {
    goog.base(this, outgoing, incoming, true);
};
goog.inherits(lime.transitions.MoveInDown, lime.transitions.SlideInDown);




