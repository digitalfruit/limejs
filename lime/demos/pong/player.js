goog.provide('pong.Player');

goog.require('lime.RoundedRect');

pong.Player = function(is_down) {
    lime.Sprite.call(this);

    //this.setFill(200,100,0,.3);
    this.setSize(80, 50);

    this.is_down = is_down;

    this.setAnchorPoint(.5, 0);

    var front_color = '#000';
    var back_color = '#DDD';
    var grad = new lime.fill.LinearGradient().
        addColorStop(0, is_down ? front_color : back_color).
        addColorStop(1, is_down ? back_color : front_color);
    this.inner = new lime.RoundedRect().setSize(80, 15).setFill(grad).setAnchorPoint(.5, 0);
    this.appendChild(this.inner);


    if (!is_down) {
        this.setAnchorPoint(.5, 1);
        this.inner.setAnchorPoint(.5, 1);
    }

    this.score = 0;
};
goog.inherits(pong.Player, lime.Sprite);

pong.Player.prototype.enableInteraction = function() {
    var py = this.getPosition().y;
    goog.events.listen(this, ['mousedown', 'touchstart'], function(e) {
        var whalf = this.getSize().width / 2;
        var width = this.getParent().getSize().width - whalf;
        var py = this.getPosition().y;
        e.startDrag(false, new goog.math.Box(py, width, py, whalf));
    },false, this);
};

pong.Player.prototype.enableSimulation = function() {
    this.v = 0;
    this.a = 0;
};

pong.Player.prototype.updateTargetPos = function(ballx,vy,dt) {
    var px = this.getPosition().x;
    var diff = ballx - px;

    this.a = diff;
    if (vy > 0) this.a *= .3;

    this.v += this.a;
    var absv = Math.abs(this.v);
    if (absv > 300) this.v = 300 * (this.v > 0 ? 1 : -1);

    this.v *= .9;

    px += this.v * dt * 0.001;

    var whalf = this.getSize().width / 2;
    var width = this.getParent().getSize().width - whalf;

    if (px < whalf) {
        px = whalf;
        this.v *= -1;
    }
    else if (px > width) {
        px = width;
        this.v *= -1;
    }

    this.setPosition(px, this.getPosition().y);
};
