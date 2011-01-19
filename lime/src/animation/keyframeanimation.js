goog.provide('lime.animation.KeyframeAnimation');


goog.require('lime.Sprite');
goog.require('lime.animation.Animation');
goog.require('goog.events');

/**
 * Keyframe Animation object.
 * Keyframe Animation contains images that are changed on targets.
 * Similar to GIF effect.
 * @constructor
 * @extends lime.animation.Animation
 */
lime.animation.KeyframeAnimation = function() {
    lime.animation.Animation.call(this);

    /**
     * Array of frame images
     * @type {Array.<Image>}
     * @private
     */
    this.frames_ = [];

    /**
     * Number of frame images loaded
     * @type {Number}
     * @private
     */
    this.numFramesLoaded_ = 0;

    /**
     * Have all the frames been loaded?
     * @type {Boolean}
     * @private
     */
    this.framesLoaded_ = false;

    /**
     * Animation is using Background Canvas
     * to make the changes. Faster if there are many targets
     * but only supported on Webkit.
     * @type {Boolean}
     * @private
     */
    this.usesBackgroundCanvas_ = false;

    /**
     * Current frame index of the playhead
     * @type {Number}
     * @private
     */
    this.currentFrame_ = 0;

    /**
     * Delay in seconds between frames
     * @type {Number}
     * @public
     */
    this.delay = 1 / 15;
};
goog.inherits(lime.animation.KeyframeAnimation, lime.animation.Animation);

/**
 * Set array of frames to be used in the animation
 * @param {Array.<string>} frames Paths to frame images.
 */
lime.animation.KeyframeAnimation.prototype.setFrames = function(frames) {
    this.frames_ = [];
    this.numFramesLoaded_ = 0;
    this.currentFrame_ = -1;

    for (var i = 0; i < frames.length; i++) {
        this.addFrame(frames[i]);
    }
};

/**
 * Add frame to the current animation
 * @param {string} frame Path to frame image.
 */
lime.animation.KeyframeAnimation.prototype.addFrame = function(frame) {
    this.framesLoaded_ = false;
    var img = new Image;

    goog.events.listen(img, goog.events.EventType.LOAD,
                this.frameLoadedHandler_, false, this);

    img.src = frame;
    this.frames_.push(img);
};

/**
 * Handler to be called on every loaded frame image
 * @private
 */
lime.animation.KeyframeAnimation.prototype.frameLoadedHandler_ = function() {
    this.numFramesLoaded_++;
    if (this.numFramesLoaded_ >= this.frames_.length) {
        this.framesLoaded_ = true;
    }
};



/**
 * @inheritDoc
 */
lime.animation.KeyframeAnimation.prototype.play = function() {

   this.lastChangeTime_ = 0;

   lime.animation.Animation.prototype.play.call(this);
};

/**
 * @inheritDoc
 */
lime.animation.KeyframeAnimation.prototype.step_ = function(dt) {
    if (!this.framesLoaded_) return;
    var delay_msec = Math.round(this.delay * 1000);

    this.lastChangeTime_ += dt;
    if (this.lastChangeTime_ > delay_msec) {
        var nextFrame = this.currentFrame_ + 1;
        if (nextFrame >= this.frames_.length) nextFrame = 0;
        nextImage = this.frames_[nextFrame];

        var i = this.targets.length;
        if (i > 0) {

            // Todo: make CSS Canvas optional
            if (!this.usesBackgroundCanvas_ &&
                    goog.isFunction(document.getCSSCanvasContext)) {

                this.bgSprite = new lime.Sprite;
                this.bgSprite.setRenderMode(lime.RenderMode.CSS_CANVAS);
                this.bgSprite.setQuality(this.targets[0].getQuality());
                this.usesBackgroundCanvas_ = true;

            }

            if (this.usesBackgroundCanvas_) {
                this.bgSprite.setFill(nextImage);
                while (--i >= 0) {
                    this.targets[i].setRenderMode(
                        lime.RenderMode.BACKGROUND_CANVAS);
                    this.targets[i].setFill(this.bgSprite);
                }
            }
            else {
                while (--i >= 0) {
                    this.targets[i].setFill(nextImage);
                }
            }
        }

        this.currentFrame_ = nextFrame;

        this.lastChangeTime_ -= delay_msec;
        this.lastChangeTime_ %= delay_msec;
    }

};
