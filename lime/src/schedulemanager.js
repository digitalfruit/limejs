goog.provide('lime.scheduleManager');

goog.require('lime');
goog.require('goog.array');


/**
 * Unified timer provider class
 * Don't create instances of this class. Used the shared instance.
 * @this lime.scheduleManager
 * @constructor
 */
lime.scheduleManager = new (function() {

    /**
     * Array of registered functions
     * @type {Array.<lime.scheduleManager.Task>}
     * @private
     */
    this.taskStack_ = [];

    /**
     * ScheduleManager is active
     * @type {Boolean}
     * @private
     */
    this.active_ = false;

    /**
     * Internal setInterval id
     * @type {number}
     * @private
     */
    this.intervalID_ = 0;

    /**
     * Maximum update rate in ms.
     * @type {number}
     * @private
     */
    this.displayRate_ = 1000 / 30;

    /**
     * Timer last fire timestamp
     * @type {number}
     * @private
     */
    this.lastRunTime_ = 0;

})();

/**
 * Scheduled task
 * @param {number} maxdelta Timer wait value after iteration.
 * @param {number} opt_limit Number of calls.
 * @constructor
 */
lime.scheduleManager.Task = function(maxdelta, opt_limit) {
    this.delta = this.maxdelta = maxdelta;
    this.limit = goog.isDef(opt_limit) ? opt_limit : -1;
    this.functionStack_ = [];
};

/**
 * Handle iteration
 * @param {number} dt Delta time since last iteration.
 * @private
 */
lime.scheduleManager.Task.prototype.step_ = function(dt) {
    if (!this.functionStack_.length) return;
    if (this.delta > dt) {
        this.delta -= dt;
    }
    else {
        var delta = this.maxdelta + dt - this.delta;
        this.delta = this.maxdelta - (dt - this.delta);
        if (this.delta < 0) this.delta = 0;
        var f;
        var i = this.functionStack_.length;
        while (--i >= 0) {
            f = this.functionStack_[i];
            if (f && f[0] && goog.isFunction(f[1]))
            (f[1]).call(f[2], delta);
        }
        if (this.limit != -1) {
            this.limit--;
            if (this.limit == 0) {
                lime.scheduleManager.unschedule(f[1], f[2]);
            }
        }
    }
};

lime.scheduleManager.taskStack_.push(new lime.scheduleManager.Task(0));

/**
 * Returns maximum fire rate in ms. If you need FPS then use 1000/x
 * @this {lime.scheduleManager}
 * @return {number} Display rate.
 */
lime.scheduleManager.getDisplayRate = function() {
    //todo: bad name
    return this.displayRate_;
};

/**
 * Sets maximum fire rate for the scheduler in ms.
 * If you have FPS then send 1000/x
 * @this {lime.scheduleManager}
 * @param {number} value New display rate.
 */
lime.scheduleManager.setDisplayRate = function(value) {
     this.displayRate_ = value;
     if (this.active_) {
         this.disable_();
         this.activate_();
     }
};

/**
 * Schedule a function. Passed function will be called on every frame
 * with delta time from last run time
 * @this {lime.ScheduleManager}
 * @param {function(number)} f Function to be called.
 * @param {object} context The context used when calling function.
 * @param {lime.scheduleManager.Task} opt_task Task object.
 */
lime.scheduleManager.schedule = function(f, context, opt_task) {
    var task = goog.isDef(opt_task) ? opt_task : this.taskStack_[0];
    goog.array.insert(task.functionStack_, [1, f, context]);
    goog.array.insert(this.taskStack_, task);
    if (!this.active_) {
        this.activate_();
    }
};

/**
 * Unschedule a function. For functions that have be previously scheduled
 * @this {lime.ScheduleManager}
 * @param {function(number)} f Function to be unscheduled.
 * @param {object} context Context used when scheduling.
 */
lime.scheduleManager.unschedule = function(f, context) {
    var j = this.taskStack_.length;
    while (--j >= 0) {
        var functionStack_ = this.taskStack_[j].functionStack_,
            fi, i = functionStack_.length;
        while (--i >= 0) {
            fi = functionStack_[i];
            if (fi[1] == f && fi[2] == context) {
                goog.array.remove(functionStack_, fi);

            }
        }
        if (functionStack_.length == 0 && j != 0) {
           goog.array.remove(this.taskStack_, functionStack_);
        }
    }
    // if no more functions: stop timers
    if (this.taskStack_.length == 1 &&
            this.taskStack_[0].functionStack_.length == 0) {
        this.disable_();
    }
};

/**
 * Start the internal timer functions
 * @this {lime.scheduleManager}
 * @private
 */
lime.scheduleManager.activate_ = function() {
    if (this.active_) return;
    // Todo: Firefox 4beta has a neat API window.mozRequestAnimationFrame()
    // This could possibly do better job in this case (but will ruin mockClock)
    // http://weblogs.mozillazine.org/roc/archives/2010/08/mozrequestanima.html

    this.lastRunTime_ = (new Date()).getTime();
    this.intervalID_ = setInterval(goog.bind(this.step_, this),
        this.getDisplayRate());
    this.active_ = true;
};

/**
 * Stop interval timer functions
 * @this {lime.scheduleManager}
 * @private
 */
lime.scheduleManager.disable_ = function() {
    if (!this.active_) return;

    clearInterval(this.intervalID_);
    this.active_ = false;
};

/**
 * Main step function that delegates to other objects waiting
 * @this {lime.scheduleManager}
 * @private
 */
lime.scheduleManager.step_ = function() {
    var t;
    var curTime = goog.now();
    var delta = curTime - this.lastRunTime_;
    if (delta < 0) delta = 1;
    var i = this.taskStack_.length;
    while (--i >= 0) {
        this.taskStack_[i].step_(delta);
    }
    this.lastRunTime_ = curTime;
};

/**
 * Change director's activity. Used for pausing updates when director is paused
 * @this {lime.scheduleManager}
 * @param {lime.Director} director Director.
 * @param {boolean} value Active or inactive?
 */
lime.scheduleManager.changeDirectorActivity = function(director, value) {
    var t, j = this.taskStack_.length;
    while (--j >= 0) {

    var t = this.taskStack_[j], f, context, d, i = t.functionStack_.length;
    while (--i >= 0) {
        f = t.functionStack_[i];
        context = f[2];
        if (goog.isFunction(context.getDirector)) {
            d = context.getDirector();
            if (d == director) {
                f[0] = value;
            }
        }
    }
    }
};

/**
 * Set up function to be called once after a delay
 * @param {function(number)} f Function to be called.
 * @param {object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 */
lime.scheduleManager.callAfter = function(f, context, delay) {
    lime.scheduleManager.scheduleWithDelay(f, context, delay, 1);
};

/**
 * Set up function to be called repeatedly after a delay
 * @param {function(number)} f Function to be called.
 * @param {object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 * @param {number} opt_limit Number of times to call.
 * @this {lime.scheduleManager}
 */
lime.scheduleManager.scheduleWithDelay = function(f, context,
        delay, opt_limit) {
    var task = new lime.scheduleManager.Task(delay, opt_limit);
    this.schedule(f, context, task);
};
