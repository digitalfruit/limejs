goog.provide('rb.Button');

goog.require('lime.GlossyButton');

/**
 * Custom button style for this game. Just a different style
 * for lime.GlossyButton
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends lime.Button
 */
rb.Button = function(txt) {
    lime.GlossyButton.call(this, txt);

    this.updateState(this.upstate_);
    this.updateState(this.downstate_);

    this.borderWidth = 4;
    this.setColor('#000');
};
goog.inherits(rb.Button, lime.GlossyButton);

/**
 * @inheritDoc
 */
rb.Button.prototype.updateState = function(s) {
    s.rect.setFill('#fff').setRadius(10);
    s.inner.setRadius(10);
    s.label.setAlign('center').
        setFontFamily('"Trebuchet MS"').setFontColor('#eef').setFontSize(28);
};

/**
 * @inheritDoc
 */
rb.Button.prototype.setColor = function(clr) {
    clr = lime.fill.parse(clr);
    goog.array.forEach([this.upstate_, this.downstate_], function(s) {
        var c = s == this.downstate_ ? clr.clone().addBrightness(.1) : clr;
        //s.setFill(c);
        var c2 = c.clone().addBrightness(.3);
        var grad = new lime.fill.LinearGradient().setDirection(0, 0, 0, 1);
        grad.addColorStop(0, c2);
        grad.addColorStop(.45, c);
        grad.addColorStop(.55, c);
        grad.addColorStop(1, c2);
        s.inner.setFill(grad);
    },this);
    return this;
};
