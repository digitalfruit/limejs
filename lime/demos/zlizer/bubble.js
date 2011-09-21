goog.provide('zlizer.Bubble');

goog.require('lime.Sprite');

zlizer.Bubble = function(value) {
    lime.Sprite.call(this);

    this.value = value;

    this.circle = new lime.Sprite().setFill('assets/bubble_back.png').setSize(70, 70);
    this.appendChild(this.circle);

    this.lbl = new lime.Label().setText(value).setFontSize(34).setFontColor('#fff').setFontWeight(700).setFontFamily('Impact');
    this.appendChild(this.lbl);

    this.GRAVITY = 2.5;

    this.setAnchorPoint(0, 0);
    this.setScale(1.2);

    //this.setRenderer(lime.Renderer.CANVAS);

    this.v = new goog.math.Vec2(0, this.GRAVITY);


};
goog.inherits(zlizer.Bubble, lime.Sprite);

zlizer.Bubble.random = function(max) {
    var value = Math.ceil(Math.random() * max);
    return new zlizer.Bubble(value);
};


zlizer.Bubble.prototype.updateFloatingSpeed = function() {

    this.v.add(new goog.math.Vec2((Math.random() * 2 - 1) * .6, Math.random() * .1));

    var delta = this.v.clone().scale(zlizer.BUBBLE_SPEED);

    this.move = new lime.animation.MoveBy(delta.x, delta.y).setDuration(20).enableOptimizations().setEasing(lime.animation.Easing.LINEAR);
    this.runAction(this.move);
};
