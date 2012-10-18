goog.provide('lime.animation.Animation');
goog.provide('lime.animation.Easing');
goog.provide('lime.animation.actionManager');
goog.provide('lime.animation.Event');


goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.fx.easing');
goog.require('lime.scheduleManager');


/**
 * General object for running animations on nodes
 * @constructor
 * @extends goog.events.EventTarget
 */
lime.animation.Animation = function() {
    goog.events.EventTarget.call(this);

    /**
     * Array of active target nodes
     * @type {Array.<lime.Node>}
     * @protected
     */
    this.targets = [];
    this.initTargets_ = [];

    this.targetProp_ = {};

    /**
     * Animation is playing?
     * @type {boolean}
     * @private
     */
    this.isPlaying_ = false;

    this.duration_ = 1.0;

    this.ease = lime.animation.Easing.EASEINOUT;

    this.status_ = 0;

};
goog.inherits(lime.animation.Animation, goog.events.EventTarget);

/**
 * @type {string}
 */
lime.animation.Animation.prototype.scope = '';

/** @typedef {Array.<number|function(number):number>} */
lime.animation.EasingFunction;


/**
 * Animation event types
 * @enum {string}
 */
lime.animation.Event = {
  START: 'start',
  STOP: 'stop'
};

/**
 * Return duration of the animation in seconds
 * @return {number} Animation duration.
 */
lime.animation.Animation.prototype.getDuration = function() {
    return this.duration_;
};

/**
 * Set the duration of the animation in seconds
 * @param {number} value New duration.
 * @return {lime.animation.Animation} object itself.
 */
 lime.animation.Animation.prototype.setDuration = function(value) {
     this.duration_ = value;
     return this;
 };

/**
 * Set easing function for current animation
 * @param {lime.animation.EasingFunction} ease Easing function.
 * @return {lime.animation.Animation} object itself.
 */
lime.animation.Animation.prototype.setEasing = function(ease) {
    this.ease = ease;
    return this;
};

/**
 * Return current easing function
 * @return {lime.animation.EasingFunction} Easing function.
 */
lime.animation.Animation.prototype.getEasing = function() {
    return this.ease;
};

/**
 * Add target node to animation
 * @param {lime.Node} target Target node.
 * @return {lime.animation.Animation} object itself.
 */
lime.animation.Animation.prototype.addTarget = function(target) {
    goog.array.insert(this.targets, target);
    return this;
};

/**
 * Remove target node from animation
 * @param {lime.Node} target Node to be removed.
 * @return {lime.animation.Animation} object itself.
 */
lime.animation.Animation.prototype.removeTarget = function(target) {
    goog.array.remove(this.targets, target);
    goog.array.remove(this.initTargets_, target);
    return this;
};

/**
 * Start playing the animation
 */
lime.animation.Animation.prototype.play = function() {
    this.playTime_ = 0;
    this.status_ = 1;
    this.firstFrame_ = 1;
    lime.scheduleManager.schedule(this.step_, this);
    this.dispatchEvent({type: lime.animation.Event.START});
};

/**
 * Stop playing the animstion
 */
lime.animation.Animation.prototype.stop = function() {
    if (this.status_ != 0) {
        var targets = this.initTargets_;
        if (this.useTransitions() && this.clearTransition) {
            var i = targets.length;
            while (--i >= 0) {
                this.clearTransition(targets[i]);
            }
        }
        this.initTargets_ = [];
        this.targetProp_ = {};
        this.status_ = 0;
        lime.scheduleManager.unschedule(this.step_, this);
        this.dispatchEvent({type: lime.animation.Event.STOP});
    }
};

/**
 * Make property object for target that hold animation helper values.
 * @param {lime.Node} target Target node.
 * @return {Object} Properties object.
 */
lime.animation.Animation.prototype.makeTargetProp = function(target) {
    return {};
};

/**
 * Get properties object for target.
 * @param {lime.Node} target Target node.
 * @return {Object} Properties object.
 */
lime.animation.Animation.prototype.getTargetProp = function(target) {
    var uid = goog.getUid(target);
    if (!goog.isDef(this.targetProp_[uid])) {
        this.initTarget(target);
        this.targetProp_[uid] = this.makeTargetProp(target);
    }
    return this.targetProp_[uid];
};

/**
 * Initalize the aniamtion for a target
 * @param {lime.Node} target Target node.
 */
lime.animation.Animation.prototype.initTarget = function(target) {
    lime.animation.actionManager.register(this, target);
    //todo: check if all this status_ mess can be removed now
    this.status_ = 1;
    goog.array.insert(this.initTargets_, target);
    if(this.speed_ && !this.speedCalcDone_ && this.calcDurationFromSpeed_){
        this.calcDurationFromSpeed_();
    }
};

/**
 * Get the director related to the animation targets.
 * @return {lime.Director} Director.
 */
lime.animation.Animation.prototype.getDirector = function() {
    return this.targets[0] ? this.targets[0].getDirector() : null;
};

/**
 * Iterate time for animation
 * @private
 * @throws {WrongParam} If easing function is not correct
 * @param {number} dt Time difference since last run.
 */
lime.animation.Animation.prototype.step_ = function(dt) {
    if(this.speed_ && !this.speedCalcDone_ && this.calcDurationFromSpeed_){
        this.calcDurationFromSpeed_();
    }
    if(this.firstFrame_){
        delete this.firstFrame_;
        dt = 1;
    }
    
    this.playTime_ += dt;
    this.dt_ = dt;
    var t = this.playTime_ / (this.duration_ * 1000);
    if (isNaN(t) || t>=1) t = 1;
    t = this.updateAll(t,this.targets); 

    if (t == 1) {
        this.stop();
    }
};

/**
 * Update all targets to new values.
 * @param {number} t Time position of animation[0-1].
 * @param {Array.<lime.Node>} targets All target nodes to update.
 * @return {number} New time position(eased value).
 */
lime.animation.Animation.prototype.updateAll = function(t,targets){
    t = /** @type {function(number):number} */ (this.getEasing()[0])(t);
   if (isNaN(t)) {
        t = 1;
    }
    
    var i = targets.length;
    while (--i >= 0) {
        this.update(t, targets[i]);
    }
    return t;
};

/**
 * Returns true if CSS transitions are used to make the animation.
 * Performes better on iOS devices.
 * @return {boolean} Transitions are being used?
 */
lime.animation.Animation.prototype.useTransitions = function() {
    return this.duration_ > 0 && lime.style.isTransitionsSupported &&
        this.optimizations_ &&
    //  goog.userAgent.MOBILE &&  // I see no boost on mac, only on iOS
        !lime.userAgent.ANDROID && // bug in 2.2 http://code.google.com/p/android/issues/detail?id=12451
        !goog.userAgent.GECKO; // still many bugs on FF4Beta Mac when hardware acceleration in ON
};

/**
 * Enable CSS3 transitions to make animation. Usually performes better
 * but is limited to single parallel transform action.
 * @param {boolean=} opt_value Enable or disable.
 * @return {lime.animation.Animation} object itself.
 */
lime.animation.Animation.prototype.enableOptimizations = function(opt_value) {
    var bool = goog.isDef(opt_value) ? opt_value : true;
    this.optimizations_ = bool;
    return this;
};

/**
 * Update targets to new values
 * @param {number} t Time position of animation[0-1].
 * @param {lime.Node} target Target node to update.
 */
lime.animation.Animation.prototype.update = goog.abstractMethod;

/**
 * Clone animation parmaters from another animation
 * @protected
 */
lime.animation.Animation.prototype.cloneParam = function(origin){
    return this.setDuration(origin.getDuration()).enableOptimizations(origin.optimizations_);
};

/**
 * Return new animation with reveresed parameters from original
 * @throws {NotSupported} No reverese animation possible.
 * @return {?lime.animation.Animation} New animation.
 */
lime.animation.Animation.prototype.reverse = function() {
    throw('Reverseform not supported for this animation');
};


/**
 * ActionManager. Doesn't let animations that modify same parameters
 * run together on same targets.
 * @constructor
 */
lime.animation.actionManager = new (function() {
    this.actions = {};
});

/**
 * Register animation in the manager.
 * @param {lime.animation.Animation} action Action.
 * @param {lime.Node} target Taget node.
 * @this {lime.animation.actionManager}
 */
lime.animation.actionManager.register = function(action, target) {
    //Todo: probably needs some garbage collection
    if (!action.scope.length) return;
    var id = goog.getUid(target);
    if (!goog.isDef(this.actions[id])) {
        this.actions[id] = {};
    }
    if (goog.isDef(this.actions[id][action.scope])) {
        this.actions[id][action.scope].stop();
    }
    this.actions[id][action.scope] = action;
};

/**
 * Stop all animations on target.
 * @param {lime.Node} target Target node.
 * @this {lime.animation.actionManager}
 */
lime.animation.actionManager.stopAll = function(target) {
    // todo: doesn't stop scopless action atm. (like sequence)
    var id = goog.getUid(target);
    if (goog.isDef(this.actions[id])) {
        for (var i in this.actions[id]) {
            this.actions[id][i].stop();
            delete this.actions[id][i];
        }
    }
};


(function(){
    
    // www.netzgesta.de/dev/cubic-bezier-timing-function.html
    // currently used function to determine time
    // 1:1 conversion to js from webkit source files
    // UnitBezier.h, WebCore_animation_AnimationBase.cpp
    var ax=0,bx=0,cx=0,ay=0,by=0,cy=0;
	// `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    function sampleCurveX(t) {return ((ax*t+bx)*t+cx)*t;};
    function sampleCurveY(t) {return ((ay*t+by)*t+cy)*t;};
    function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;};
	// The epsilon value to pass given that the animation is going to run over |dur| seconds. The longer the
	// animation, the more precision is needed in the timing function result to avoid ugly discontinuities.
	function solveEpsilon(duration) {return 1.0/(200.0*duration);};
    function solve(x,epsilon) {return sampleCurveY(solveCurveX(x,epsilon));};
	// Given an x value, find a parametric value it came from.
	function fabs(n) {if(n>=0) {return n;}else {return 0-n;}}; 
    function solveCurveX(x,epsilon) {var t0,t1,t2,x2,d2,i;
        // First try a few iterations of Newton's method -- normally very fast.
        for(t2=x, i=0; i<8; i++) {x2=sampleCurveX(t2)-x; if(fabs(x2)<epsilon) {return t2;} d2=sampleCurveDerivativeX(t2); if(fabs(d2)<1e-6) {break;} t2=t2-x2/d2;}
        // Fall back to the bisection method for reliability.
        t0=0.0; t1=1.0; t2=x; if(t2<t0) {return t0;} if(t2>t1) {return t1;}
        while(t0<t1) {x2=sampleCurveX(t2); if(fabs(x2-x)<epsilon) {return t2;} if(x>x2) {t0=t2;}else {t1=t2;} t2=(t1-t0)*.5+t0;}
        return t2; // Failure.
    };
    function CubicBezierAtTime(t,p1x,p1y,p2x,p2y,duration) {
		// Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
		cx=3.0*p1x; bx=3.0*(p2x-p1x)-cx; ax=1.0-cx-bx; cy=3.0*p1y; by=3.0*(p2y-p1y)-cy; ay=1.0-cy-by;
		// Convert from input time to parametric value in curve, then from that to output time.
    	return solve(t, solveEpsilon(duration));
	};
 

/**
 * Return easing function from Bezier curce points
 * @see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 * @param {number} p1x Point one X axis value.
 * @param {number} p1y Point one Y axis value.
 * @param {number} p2x Point two X axis value.
 * @param {number} p2y Point two Y axis value.
 * @return {lime.animation.EasingFunction} Easing function.
 */
lime.animation.getEasingFunction = function(p1x, p1y, p2x, p2y) {
    var that = lime.animation;
    return [function(t) {
        return CubicBezierAtTime(t,p1x,p1y,p2x,p2y,100);
    },p1x, p1y, p2x, p2y];

};

    
    
})();




/**
 * Predefined Easing functions
 * @enum {lime.animation.EasingFunction}
 */
lime.animation.Easing = {
    EASE: lime.animation.getEasingFunction(.25, .1, .25, 1),
    LINEAR: lime.animation.getEasingFunction(0, 0, 1, 1),
    EASEIN: lime.animation.getEasingFunction(.42, 0, 1, 1),
    EASEOUT: lime.animation.getEasingFunction(0, 0, .58, 1),
    EASEINOUT: lime.animation.getEasingFunction(.42, 0, .58, 1)
};



