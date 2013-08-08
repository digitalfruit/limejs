goog.provide('ydn.game.Button');

goog.require('lime.GlossyButton');

/**
 * Glossy button. Rounded button with some predefined style.
 * Use lime.Button for lower level control.
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends {lime.GlossyButton}
 */
ydn.game.Button = function(txt) {
    goog.base(this, txt);

    this.borderWidth = 4;
    this.setColor('#000');
};
goog.inherits(ydn.game.Button, lime.GlossyButton);

/**
 * Make state for a button.
 * @return {lime.RoundedRect} state.
 */
ydn.game.Button.prototype.makeState_ = function() {
    var state = new lime.RoundedRect().setFill('#fff').setRadius(15);
    state.inner = new lime.RoundedRect().setRadius(15);
    state.label = new lime.Label('').setAlign('center').setFontColor('#eef').setFontSize(35).setSize(250, 35);

    state.appendChild(state.inner);
    state.inner.appendChild(state.label);
    return state;
};

/**
 * @inheritDoc
 */
ydn.game.Button.prototype.setColor = function(color) {
    var clr = lime.fill.parse(color);
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        var c = s == this.downstate ? clr.clone().addBrightness(.1) : clr;
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
