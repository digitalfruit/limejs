goog.provide('lime.GlossyButton');

goog.require('lime.Button');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.fill.LinearGradient');

/**
 * Glossy button. Rounded button with some predefined style.
 * Use lime.Button for lower level control.
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends lime.Button
 */
lime.GlossyButton = function(txt) {
    lime.Button.call(this, this.makeState_(txt), this.makeState_(txt));

    this.borderWidth = 2;

    this.setText(txt);
    this.setColor('#62be00');

};
goog.inherits(lime.GlossyButton, lime.Button);

/**
 * Make state for a button.
 * @protected
 * @param {string} txt Text shown on the button.
 * @return {lime.RoundedRect} state.
 */
lime.GlossyButton.prototype.makeState_ = function(txt) {
    var state = new lime.RoundedRect();
    state.inner = new lime.RoundedRect();
    state.label = new lime.Label(txt).setAlign('center').
        setFontFamily('"Trebuchet MS"').setFontColor('#010101').setFontSize(17);

    state.appendChild(state.inner);
    state.inner.appendChild(state.label);
    return state;
};

/**
 * Set button base color
 * @param {*} clr New base color.
 * @return {lime.GlossyButton} object itself.
 */
lime.GlossyButton.prototype.setColor = function(clr) {
    clr = lime.fill.parse(clr);
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        var c = s == this.downstate ? clr.clone().addSaturation(-.2) : clr;
        s.setFill(c);
        var grad = new lime.fill.LinearGradient().setDirection(0, 0, 0, 1);
        grad.addColorStop(0, c.clone().addBrightness(.13));
        grad.addColorStop(.5, c.clone().addBrightness(.05));
        grad.addColorStop(.52, c);
        grad.addColorStop(1, c);
        s.inner.setFill(grad);
    },this);
    return this;
};

/**
 * Set button text.
 * @param {string} txt Text.
 * @return {lime.GlossyButton} object itself.
 */
lime.GlossyButton.prototype.setText = function(txt) {
    this.upstate.label.setText(txt);
    this.downstate.label.setText(txt);
    return this;
};

/** @inheritDoc */
lime.GlossyButton.prototype.setSize = function(value, opt_height) {
    if (this.upstate) {
    this.upstate.setSize.apply(this.upstate, arguments);
    var size = this.upstate.getSize();
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        s.setSize(size);
        var innerSize = size.clone();
        innerSize.width -= this.borderWidth;
        innerSize.height -= this.borderWidth;
        s.inner.setSize(innerSize);
    },this);
    }
    return this;
};

/** @inheritDoc */
lime.GlossyButton.prototype.getSize = function() {
    return this.upstate.getSize();
};
