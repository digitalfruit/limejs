goog.provide('lime.Button');

goog.require('lime.Layer');

/**
 * Simple button element
 * @param {lime.Sprite} opt_upstate Object shown on normal state.
 * @param {lime.Sprite} opt_downstate Object show when button is pressed.
 * @constructor
 * @extends lime.Layer
 */
lime.Button = function(opt_upstate, opt_downstate) {
    lime.Layer.call(this);

    this.domClassName = goog.getCssName('lime-button');

    //set up state
    if (goog.isDef(opt_upstate)) {
        this.setUpState(opt_upstate);
    }

    //set down state
    if (goog.isDef(opt_downstate)) {
        this.setDownState(opt_downstate);
    }


    var t = this;
    goog.events.listen(this, ['mousedown', 'touchstart', 'touchmove'],
        function(e) {
            t.setState(lime.Button.State.DOWN);
            e.swallow('mousemove', function(e) {
                if (t.hitTest(e)) {
                    t.setState(lime.Button.State.DOWN);
                }
                else {
                    t.setState(lime.Button.State.UP);
                }
            });
            e.swallow('touchmove', function(e) {
                if (!t.hitTest(e)) {
                    t.setState(lime.Button.State.UP);
                    e.release();
                }
            });
            e.swallow(['mouseup', 'touchend'], function(e) {
                if (t.hitTest(e)) {
                    t.dispatchEvent({type: lime.Button.Event.CLICK});
               }
               this.setState(lime.Button.State.UP);
           });
        }
    );


};
goog.inherits(lime.Button, lime.Layer);

/**
 * Button states
 * @enum {number}
 */
lime.Button.State = {
    UP: 0,
    DOWN: 1
};

/**
 * Button event names
 * @enum {string}
 */
lime.Button.Event = {
    UP: 'up',
    DOWN: 'down',
    CLICK: 'click' // touchUpInside?
};

/**
 * Sets the sprite used as button up state
 * @param {lime.Sprite} upstate Object shown on normal state.
 * @return {lime.Button} object itself.
 */
lime.Button.prototype.setUpState = function(upstate) {
    this.upstate = upstate;
    this.appendChild(this.upstate);

    this.state_ = -1;
    return this.setState(lime.Button.State.UP);
};

/**
 * Sets the sprite used as button down state. Down state is hown if
 * mouse is down on button or finger is touching the button.
 * @param {lime.Sprite} downstate Object shown when button is pressed.
 * @return {lime.Button} object itself.
 */
lime.Button.prototype.setDownState = function(downstate) {
    this.downstate = downstate;
    this.appendChild(downstate);

    this.state_ = -1;
    return this.setState(lime.Button.State.UP);
};


/**
 * Returns current state of the button
 * @return {lime.Button.State} current state.
 */
lime.Button.prototype.getState = function() {
    return this.state_;
};


/**
 * Sets the state of the button. Also fires events is state changes.
 * @param {lime.Button.State} value State to be set.
 * @return {lime.Button} object itself.
 */
lime.Button.prototype.setState = function(value) {

    if (value == this.state_) return this;

    //event checking
    if (this.state_ == lime.Button.State.UP &&
            value == lime.Button.State.DOWN)
        this.dispatchEvent({type: lime.Button.Event.DOWN});

    if (this.state_ == lime.Button.State.DOWN &&
            value == lime.Button.State.UP)
        this.dispatchEvent({type: lime.Button.Event.UP});


    var state = this.upstate;

    if (goog.isDef(this.downstate)) {
        if (lime.Button.State.DOWN == value)
            state = this.downstate;
        else
            this.downstate.setHidden(true);
    }

    if (state != this.upstate) {
        this.upstate.setHidden(true);
    }

    state.setHidden(false);
    this.state_ = value;
    return this;
};
