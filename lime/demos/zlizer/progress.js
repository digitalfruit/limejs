goog.provide('zlizer.Progress');

goog.require('lime.RoundedRect');
goog.require('lime.animation.ColorTo');
goog.require('lime.animation.Resize');
goog.require('lime.fill.LinearGradient');

zlizer.Progress = function() {
    lime.RoundedRect.call(this);

    var WIDTH = 320,
        HEIGHT = 40,
        RADIUS = 20,
        BORDER = 8;

    this.setSize(WIDTH, HEIGHT);
    this.setRadius(RADIUS);
    this.setAnchorPoint(0, .5);
    this.setFill(new lime.fill.LinearGradient().addColorStop(0, 0x29, 0x54, 0x15, .5).addColorStop(1, 0x29, 0x54, 0x15, .1));

    this.movable = new lime.Layer().setPosition(125, 0);
    this.appendChild(this.movable);

    HEIGHT -= 2 * BORDER;
    RADIUS = 12;

    var inner = new lime.RoundedRect().setRadius(RADIUS).setSize(50, HEIGHT).setFill(255, 255, 255, 0).
        setAnchorPoint(0, .5).setPosition(8, 0);
    this.movable.appendChild(inner);

    //inner.setFill('#5ced00');

    this.width = WIDTH;
    this.inner = inner;


    var inner = new lime.RoundedRect().setRadius(RADIUS).setSize(50, HEIGHT).setFill('#Ff9900').
        setAnchorPoint(0, .5).setPosition(8, 0);
    this.movable.appendChild(inner);

    inner.setFill(new lime.fill.LinearGradient().addColorStop(0, 255, 255, 255, 0.4).addColorStop(.49, 255, 255, 255, 0).
        addColorStop(.5, 0, 0, 0, 0.1).addColorStop(1, 255, 255, 255, 0.3));

    this.width = WIDTH;
    this.inner2 = inner;

};
goog.inherits(zlizer.Progress, lime.RoundedRect);


zlizer.Progress.prototype.setProgress = function(value) {
    var hue_green = 0.27;
    var hue_red = 0.01;
    var color = goog.color.hsvToRgb(360 * ((hue_green - hue_red) * value + hue_red), 1, 245);
    this.progress_ = value;
    this.movable.runAction(new lime.animation.MoveTo(250 * value, 0).setDuration(3));
    this.inner.runAction(new lime.animation.ColorTo(color[0], color[1], color[2]).setDuration(3));
    return this;
};

zlizer.Progress.prototype.getProgress = function() {
    return this.progress_;
};
