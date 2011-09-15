goog.provide('pong.Notice');

goog.require('lime.RoundedRect');

pong.Notice = function() {
    lime.RoundedRect.call(this);


    var back = new lime.fill.LinearGradient().addColorStop(0, 255, 150, 0, .4)
        .addColorStop(0.9, 250, 150, 0, .05).addColorStop(1, 0, 0, 0, 0);

    this.setSize(150, 100).setFill(back).setAnchorPoint(.5, 0);

    this.title = new lime.Label().setText('Click to begin!').setPosition(0, 20);
    this.appendChild(this.title);
    
    this.score = new lime.Label().setText('').setPosition(0, 60).setFontSize(34);   
    this.appendChild(this.score);
};
goog.inherits(pong.Notice, lime.RoundedRect);

