goog.provide('rb.Progress');

goog.require('lime.RoundedRect');
goog.require('lime.animation.Resize');
goog.require('lime.fill.LinearGradient');

/**
 * Progressbar to show time left value
 * @constructor
 * @extends lime.RoundedRect
 */
rb.Progress = function() {
    lime.RoundedRect.call(this);

    var WIDTH = 320,
        HEIGHT = 50,
        RADIUS = 20,
        BORDER = 8;

    this.setSize(WIDTH, HEIGHT).setRadius(RADIUS).setAnchorPoint(0, .5);
    this.setFill(new lime.fill.LinearGradient().addColorStop(0, 0x15, 0x37, 0x62, .6).addColorStop(1, 0x1e, 0x57, 0x97, .4));

    WIDTH -= 2 * BORDER;
    HEIGHT -= 2 * BORDER;
    RADIUS = 12;

    // inner balue var
    var inner = new lime.RoundedRect().setRadius(RADIUS).setSize(WIDTH, HEIGHT).setFill('#F90').
        setAnchorPoint(0, .5).setPosition(8, 0);
    this.appendChild(inner);

    inner.setFill(new lime.fill.LinearGradient().addColorStop(0, '#afcdef').addColorStop(.49, '#55a1fc').
        addColorStop(.5, '#3690f4').addColorStop(1, '#8dc9ff'));

    this.width = WIDTH;
    this.inner = inner;

};
goog.inherits(rb.Progress, lime.RoundedRect);

/**
 * Set current progress value
 * @param {number} value Current progress value.
 */
rb.Progress.prototype.setProgress = function(value) {
    this.porgress_ = value;
    this.inner.runAction(new lime.animation.Resize(this.width * value, this.inner.getSize().height).setDuration(.4));
};

/**
 * Return current progress value
 * @return {number} value.
 */
rb.Progress.prototype.getProgress = function() {
    return this.progress_;
};
