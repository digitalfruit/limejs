goog.provide('ydn.game.Bubble');

goog.require('lime.Sprite');

/**
 * @param value
 * @constructor
 * @extends {lime.Sprite}
 */
ydn.game.Bubble = function(value) {
    goog.base(this);

    this.value = value;

    this.circle = new lime.Sprite().setFill('assets/bubble_back.png').setSize(70, 70);
    this.appendChild(this.circle);

    this.lbl = new lime.Label('' + value).setFontSize(34).setFontColor('#fff').setFontWeight('700').setFontFamily('Arial');
    this.appendChild(this.lbl);

    this.GRAVITY = 2.5;

    this.setAnchorPoint(0, 0);
    this.setScale(1.2);

    //this.setRenderer(lime.Renderer.CANVAS);

    this.v = new goog.math.Vec2(0, this.GRAVITY);


};
goog.inherits(ydn.game.Bubble, lime.Sprite);

/**
 * @return {!ydn.game.Bubble}
 */
ydn.game.Bubble.random = function() {
    var value = Math.floor(Math.random() * 26);
  var alpha = String.fromCharCode(65 + value)
    return new ydn.game.Bubble(alpha);
};


/**
 * @return {string}
 */
ydn.game.Bubble.prototype.getValue = function() {
  return this.value;
};


ydn.game.Bubble.prototype.updateFloatingSpeed = function() {

    this.v.add(new goog.math.Vec2((Math.random() * 2 - 1) * .6, Math.random() * .1));

    var delta = this.v.clone().scale(ydn.game.BUBBLE_SPEED);

    this.move = new lime.animation.MoveBy(delta.x, delta.y).setDuration(20).enableOptimizations().setEasing(lime.animation.Easing.LINEAR);
    this.runAction(this.move);
};
