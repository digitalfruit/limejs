goog.provide('lime.ScheduleManager');
goog.provide('lime.Task');

goog.require('goog.array');
goog.require('goog.async.AnimationDelay');
goog.require('lime');



/**
 * Scheduled task
 * @param {number} maxdelta Timer wait value after iteration.
 * @param {number=} opt_limit Number of calls.
 * @constructor
 */
lime.Task = function (maxdelta, opt_limit) {
  this.delta = this.maxdelta = maxdelta;
  this.limit = goog.isDef(opt_limit) ? opt_limit : -1;
  this.functionStack_ = [];
};


/**
 * Unified timer provider class
 * Don't create instances of this class. Used the shared instance.
 * @constructor
 * @struct
 */
lime.ScheduleManager = function () {

  /**
   * Array of registered functions
   * @type {Array.<lime.Task>}
   * @private
   */
  this.taskStack_ = [new lime.Task(0)];

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

  /**
   * @final
   * @type {goog.async.AnimationDelay}
   * @private
   */
  this.animationDelay_ = new goog.async.AnimationDelay(
      this.animationFrameHandler_, window, this);
};


/**
 * Handle iteration
 * @param {number} dt Delta time since last iteration.
 * @private
 */
lime.Task.prototype.step_ = function (dt) {
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


/**
 * Returns maximum fire rate in ms. If you need FPS then use 1000/x
 * @return {number} Display rate.
 */
lime.ScheduleManager.prototype.getDisplayRate = function () {
  //todo: bad name
  return this.displayRate_;
};

/**
 * Sets maximum fire rate for the scheduler in ms.
 * If you have FPS then send 1000/x
 * Note that if animation frame methods are used browser chooses
 * max display rate and this value has no effect.
 * @param {number} value New display rate.
 */
lime.ScheduleManager.prototype.setDisplayRate = function (value) {
  this.displayRate_ = value;
  if (this.animationDelay_.isActive()) {
    lime.scheduleManager.disable_();
    lime.scheduleManager.activate_();
  }
};

/**
 * Schedule a function. Passed function will be called on every frame
 * with delta time from last run time
 * @param {function(number)} f Function to be called.
 * @param {Object} context The context used when calling function.
 * @param {lime.Task=} opt_task Task object.
 */
lime.ScheduleManager.prototype.schedule = function (f, context, opt_task) {
  var task = goog.isDef(opt_task) ? opt_task : this.taskStack_[0];
  goog.array.insert(task.functionStack_, [1, f, context]);
  goog.array.insert(this.taskStack_, task);
  if (!this.animationDelay_.isActive()) {
    lime.scheduleManager.activate_();
  }
};

/**
 * Unschedule a function. For functions that have be previously scheduled
 * @param {function(number)} f Function to be unscheduled.
 * @param {Object} context Context used when scheduling.
 */
lime.ScheduleManager.prototype.unschedule = function (f, context) {
  var j = this.taskStack_.length;
  while (--j >= 0) {
    var task = this.taskStack_[j],
        functionStack_ = task.functionStack_,
        fi, i = functionStack_.length;
    while (--i >= 0) {
      fi = functionStack_[i];
      if (fi[1] == f && fi[2] == context) {
        goog.array.remove(functionStack_, fi);

      }
    }
    if (functionStack_.length == 0 && j != 0) {
      goog.array.remove(this.taskStack_, task);
    }
  }
  // if no more functions: stop timers
  if (this.taskStack_.length == 1 &&
      this.taskStack_[0].functionStack_.length == 0) {
    lime.scheduleManager.disable_();
  }
};


/**
 * Start the internal timer functions
 * @private
 */
lime.ScheduleManager.prototype.activate_ = function () {
  if (this.animationDelay_.isActive()) return;
  this.lastRunTime_ = goog.now();
  this.animationDelay_.start();
};


/**
 * Stop interval timer functions
 * @private
 */
lime.ScheduleManager.prototype.disable_ = function () {
  this.animationDelay_.stop();
};

/**
 * Webkit implemtation of requestAnimationFrame handler.
 * @param {number=} time
 * @private
 */
lime.ScheduleManager.prototype.animationFrameHandler_ = function (time) {
  var performance = goog.global['performance'];
  var now;
  if (performance && (now = performance['now'] || performance['webkitNow'])) {
    time = performance['timing']['navigationStart'] + now.call(performance);
  }
  else if (!time) {
    time = goog.now();
  }
  var delta = time - this.lastRunTime_;
  if (delta < 0) { // i0S6 reports relative to the device restart time. So first is negative.
    delta = 1;
  }
  lime.scheduleManager.dispatch_(delta);
  this.lastRunTime_ = time;
  this.animationDelay_.start();
};


/**
 * Mozilla < 11 implementation of requestAnimationFrame handler.
 * @private
 */
lime.ScheduleManager.prototype.beforePaintHandler_ = function (event) {
  var delta = event.timeStamp - this.lastRunTime_;
  lime.scheduleManager.dispatch_(delta);
  this.lastRunTime_ = event.timeStamp;
  goog.global['mozRequestAnimationFrame']();
}

/**
 * Timer events step function that delegates to other objects waiting
 * @private
 */
lime.ScheduleManager.prototype.stepTimer_ = function () {
  var t;
  var curTime = goog.now();
  var delta = curTime - this.lastRunTime_;
  if (delta < 0) delta = 1;
  lime.scheduleManager.dispatch_(delta);
  this.lastRunTime_ = curTime;
};


/**
 * Call all scheduled tasks
 * @param {number} delta Milliseconds since last run.
 * @private
 */
lime.ScheduleManager.prototype.dispatch_ = function (delta) {

  for (var i = 0; i < this.taskStack_.length; ++i) {
    this.taskStack_[i].step_(delta);
  }

};

/**
 * Change director's activity. Used for pausing updates when director is paused
 * @param {lime.Director} director Director.
 * @param {boolean} value Active or inactive?
 */
lime.ScheduleManager.prototype.changeDirectorActivity = function (director, value) {
  var t, context, f, d, i,
      j = this.taskStack_.length;
  while (--j >= 0) {

    t = this.taskStack_[j];
    i = t.functionStack_.length;
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
 * @param {Object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 */
lime.ScheduleManager.prototype.callAfter = function (f, context, delay) {
  this.scheduleWithDelay(f, context, delay, 1);
};

/**
 * Set up function to be called repeatedly after a delay
 * @param {function(number)} f Function to be called.
 * @param {Object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 * @param {number=} opt_limit Number of times to call.
 */
lime.ScheduleManager.prototype.scheduleWithDelay = function (f, context, delay, opt_limit) {
  var task = new lime.Task(delay, opt_limit);
  lime.scheduleManager.schedule(f, context, task);
};


/**
 * @final
 * @type {!lime.ScheduleManager}
 */
lime.scheduleManager = new lime.ScheduleManager();
