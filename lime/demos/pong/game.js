goog.provide('pong.Game');

goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.Sprite');
goog.require('lime.animation.FadeTo');
goog.require('lime.fill.LinearGradient');
goog.require('pong.Notice');
goog.require('pong.Player');
goog.require('lime.audio.Audio');

pong.Game = function(mode) {
    lime.Sprite.call(this);

    this.RADIUS = 20;
    this.SPEED = .45;
    this.WIDTH = 300;
    this.HEIGHT = 360;
    this.mode = mode;
    this.winning_score = 10;

    this.setAnchorPoint(0, 0);
    this.setSize(320, 460);

    var back = new lime.fill.LinearGradient().addColorStop(0, '#bbb').addColorStop(1, '#DDD');
    this.setFill(back);


    this.world = new lime.Sprite().setFill('#FFF').setSize(this.WIDTH, this.HEIGHT).setPosition(10, 50).
        setAnchorPoint(0, 0);
    this.appendChild(this.world);

    this.p1 = new pong.Player(1);
    this.p1.enableInteraction();
    this.world.appendChild(this.p1);

    this.p2 = new pong.Player(0);
    if (mode == 1)
    this.p2.enableSimulation();
    else
    this.p2.enableInteraction();
    this.world.appendChild(this.p2);


    this.ball = new lime.Circle().setSize(this.RADIUS * 2, this.RADIUS * 2).setFill(200, 0, 0);
    this.world.appendChild(this.ball);
    this.placeball();

    this.notice = new pong.Notice().setPosition(160, 200).setHidden(false);
    this.appendChild(this.notice);

    this.endRoundSound = new lime.audio.Audio('assets/applause.wav');
    this.bounceSound = new lime.audio.Audio('assets/bounce.wav');
};
goog.inherits(pong.Game, lime.Sprite);


pong.Game.prototype.start = function() {
    lime.scheduleManager.schedule(this.step_, this);
    this.notice.setHidden(true);
    this.v = new goog.math.Vec2(Math.random() * .5, -.8).normalize();
};


//var logs = [];var ii=0;
pong.Game.prototype.step_ = function(dt) {
  /*  logs.push(dt);
    if(ii<200 && !(logs.length%30)){
        console.log(logs.join(' '));
        logs=[];
        ii++;
    }*/
    var pos = this.ball.getPosition(), size = this.world.getSize();
    pos.x += this.v.x * dt * this.SPEED;
    pos.y += this.v.y * dt * this.SPEED;

    if (pos.x < this.RADIUS) {
        // bounce off left wall
        this.v.x *= -1;
        pos.x = this.RADIUS;
        this.bounceSound.stop();
        this.bounceSound.play();
    }
    else if (pos.x > size.width - this.RADIUS) {
        // bounce off right wall
        this.v.x *= -1;
        pos.x = size.width - this.RADIUS;
        this.bounceSound.stop();
        this.bounceSound.play();
    }

    var pp, pwidth = this.p1.getSize().width / 2 + this.RADIUS;
    if (pos.y < this.RADIUS) {
        pp = this.p2.getPosition();
        var diff = pos.x - pp.x;
        if (Math.abs(diff) < pwidth) {
            // bounce off of top paddle
            this.v.x += diff / pwidth;
            this.v.y *= -1;
            if (this.v.x > 1) this.v.x = 1;
            if (this.v.x < -1) this.v.x = -1;
            this.v.normalize();
            pos.y = this.RADIUS;
            this.bounceSound.stop();
            this.bounceSound.play();
        }
        else this.endRound(this.p1);
    }
    else if (pos.y > size.height - this.RADIUS) {
        pp = this.p1.getPosition();
        var diff = pos.x - pp.x;
        if (Math.abs(diff) < pwidth) {
            // bounce off of bottom paddle
            this.v.x += diff / pwidth;
            this.v.y *= -1;
            if (this.v.x > 1) this.v.x = 1;
            if (this.v.x < -1) this.v.x = -1;
            this.v.normalize();
            pos.y = size.height - this.RADIUS;
            this.bounceSound.stop();
            this.bounceSound.play();
        }
        else this.endRound(this.p2);
    }

    if (this.mode == 1)
    this.p2.updateTargetPos(pos.x, this.v.y, dt);

    this.ball.setPosition(pos);

};
pong.Game.prototype.placeball = function() {
    this.ball.setPosition(this.WIDTH / 2, this.HEIGHT - this.RADIUS);
    goog.events.listenOnce(this.world, ['touchstart', 'mousedown'], this.start, false, this);
    this.p1.setPosition(this.WIDTH / 2, this.HEIGHT);
    this.p2.setPosition(this.WIDTH / 2, 0);
};

pong.Game.prototype.endGame = function() {
    this.notice.title.setText(this.p1.score > this.p2.score ? 'You won!' : 'You lost.');
    this.notice.score.setText(this.p1.score + ' : ' + this.p2.score);
    this.notice.setOpacity(0).setHidden(false);
    var show = new lime.animation.FadeTo(1);
    this.notice.runAction(show);
    goog.events.listenOnce(this.notice, ['touchstart', 'mousedown'], pong.newgame, false, this);
}

pong.Game.prototype.endRound = function(winner) {
    winner.score++;

    lime.scheduleManager.unschedule(this.step_, this);

    if(winner.score >= this.winning_score) {
        this.endGame();
        return;
    }
    
    this.notice.title.setText(winner == this.p1 ? 'You scored' : 'Opponent scored');
    this.notice.score.setText(this.p1.score + ' : ' + this.p2.score);

    this.notice.setOpacity(0).setHidden(false);
    var show = new lime.animation.FadeTo(1);
    goog.events.listen(show, lime.animation.Event.STOP, function() {
        this.placeball();
    },false, this);
    this.notice.runAction(show);

    this.endRoundSound.stop();
    this.endRoundSound.play();
};
