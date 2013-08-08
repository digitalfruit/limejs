goog.provide('ydn.game.Game');

goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Spawn');
goog.require('ydn.game.Bubble');
goog.require('ydn.game.Progress');
goog.require('ydn.game.dialogs');
goog.require('lime.CanvasContext');
goog.require('goog.math');

/**
 * @constructor
 * @extends lime.Scene
 */
ydn.game.Game = function(level) {
    lime.Scene.call(this);

    this.WIDTH = 600;
    this.RANGE = 7; //defines number of steps between loss-neutral-win
    this.LIFE = .9;
    this.MAX = .15;


    this.level = level;
    ydn.game.RELOAD_TIME = 6800 - level * 120;
    ydn.game.BUBBLE_SPEED = 75 + this.level * 1.4;


    this.mask = new lime.Sprite().setFill(new lime.fill.LinearGradient().addColorStop(0, 0, 0, 0, 0).addColorStop(.95, 0, 0, 0, .1).addColorStop(1, 0, 0, 0, .0)).setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);

    this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);


    this.layer = new lime.Layer();
    this.appendChild(this.layer);
    this.layer.setMask(this.mask);
    this.layer.setOpacity(.5);

   /**
   * @type {Array.<!ydn.game.Bubble>}
   */
    this.bubbles = [];
    this.addBubbles(3);

    lime.scheduleManager.scheduleWithDelay(this.reload, this, ydn.game.RELOAD_TIME);
    lime.scheduleManager.scheduleWithDelay(this.checkDeletions, this, 200);


    this.points = this.RANGE;

    this.lblScore = new lime.Label('LEVEL ' + this.level).setPosition(760, 15)
        .setAnchorPoint(1, 0).setFontColor('#80ff36')
        .setFontSize(70);
    this.appendChild(this.lblScore);

    this.progress = new ydn.game.Progress().setProgress(.5).setPosition(20, 50);
    this.appendChild(this.progress);

    this.addPoints(0);

    this.cover = new lime.Layer().setPosition(ydn.game.director.getSize().width / 2, 0);
    this.appendChild(this.cover);

    var btn = new ydn.game.Button('Back to menu').setSize(270, 70).setPosition(150, 945);
    this.appendChild(btn);
    goog.events.listen(btn, 'click', function() {
      ydn.game.loadMenuScene(new lime.transitions.MoveInUp());
    });

    this.startup();
    
    //only needed to use pointInPath() function. no actual drawing.
    var canvas = goog.dom.createDom('canvas');
    this.ctx = canvas.getContext('2d');
    
	//lime logo
	ydn.game.builtWithLime(this);
};
goog.inherits(ydn.game.Game, lime.Scene);


/**
 * @param {number} count
 * @param {number=} opt_offset
 */
ydn.game.Game.prototype.addBubbles = function(count,opt_offset) {
    var offset = opt_offset || 0;
    for (var i = 0; i < count; i++) {
        var b = ydn.game.Bubble.random();
        b.setPosition(Math.random() * this.WIDTH + 100, offset - Math.random() * 100);
        this.layer.appendChild(b);
        this.bubbles.push(b);
    }
    lime.scheduleManager.callAfter(this.updateFloaters, this, 100);
};

ydn.game.Game.prototype.reload = function(dt) {
   this.addBubbles(2);
};

/**
 * @param {number} p
 */
ydn.game.Game.prototype.addPoints = function(p) {
  goog.asserts.assertNumber(p);
  goog.asserts.assert(!isNaN(p));
    this.points += p;
    var progress = this.points / (this.RANGE * 2);
    progress = goog.math.clamp(progress, 0, 1);
    this.progress.setProgress(progress);
    //this.lblScore.setText(this.points+'_#'+this.magic+'_L'+this.level);
    if (progress <= 0 || progress >= 1) {
        this.showEndDialog();
    }
};

ydn.game.Game.prototype.start = function() {
    this.touches = [];

    this.layer.runAction(new lime.animation.FadeTo(1));
    
    this.graphics = new lime.CanvasContext().setSize(ydn.game.director.getSize().clone()).setAnchorPoint(0,0).setQuality(.5);
    this.appendChild(this.graphics);

   
    this.isdown = false;

    goog.events.listen(this, ['keydown'],
         this.downHandler_, false, this);

    lime.scheduleManager.schedule(function(){
     this.graphics.setDirty(lime.Dirty.CONTENT);
     }, this);
};


ydn.game.Game.prototype.downHandler_ = function(e) {
  var key = event.keyCode || event.which;
  var value = String.fromCharCode(key);
  for (var i = 0; i < this.bubbles.length; ++i) {
    if (this.bubbles[i].getValue() == value) {
      this.removeBubble(this.bubbles[i]);
      this.addPoints(1);
      return;
    }
  }
  this.addPoints(-1);
};

ydn.game.Game.prototype.startup = function() {
  // intro here.
   this.start();
};

ydn.game.Game.prototype.showEndDialog = function() {
    this.done = 1;
    lime.scheduleManager.unschedule(this.reload, this);
    lime.scheduleManager.unschedule(this.checkDeletions, this);

   for (var i = 0; i < this.bubbles.length; i++) {
       lime.animation.actionManager.stopAll(this.bubbles[i]);
   }

   var dialog = new lime.RoundedRect().setRadius(30).setFill(new lime.fill.LinearGradient().addColorStop(0, 0, 0, 0, .5).addColorStop(1, 0, 0, 0, .7)).setSize(400, 400).setPosition(400, 200).setAnchorPoint(.5, 0);
   this.appendChild(dialog);
   var title = new lime.Label().setText('Level complete!').setFontColor('#fff').setFontSize(46).setPosition(0, 70);
   dialog.appendChild(title);
   var btn = new ydn.game.Button('NEXT LEVEL').setSize(300, 90).setPosition(0, 200);
   dialog.appendChild(btn);

   if (this.points <= 0) {
       title.setText('You lost');
       btn.setText('TRY AGAIN');
   }
   else if (this.level == 20) dialog.removeChild(btn);

   goog.events.listen(btn, lime.Button.Event.CLICK, function() {
       ydn.game.loadGame(this.points < 0 ? this.level : this.level + 1);
   },false, this);



   var btn2 = new ydn.game.Button('MAIN SCREEN').setSize(300, 90).setPosition(0, 320);
   dialog.appendChild(btn2);

   goog.events.listen(btn2, lime.Button.Event.CLICK, function() {
         ydn.game.loadMenuScene();
     });

     goog.events.unlisten(this, ['keydown'],
             this.downHandler_, false, this);

};

/**
 * @param {!ydn.game.Bubble} b
 */
ydn.game.Game.prototype.removeBubble = function(b) {
    this.layer.removeChild(b);
    var lbl = new lime.Label().setText(b.value).setFontColor('#c00').setFontSize(40)
        .setOpacity(1).setPosition(b.getPosition()).setFontWeight(700);
    this.appendChild(lbl);
    var show = new lime.animation.Spawn(
      new lime.animation.MoveBy(0, -60),
      new lime.animation.FadeTo(0),
      new lime.animation.ScaleBy(2)
    );
    lbl.runAction(show);
    goog.events.listen(show, lime.animation.Event.STOP, function() {
        this.removeChild(lbl);
    },false, this);
    goog.array.remove(this.bubbles, b);
};

ydn.game.Game.prototype.checkDeletions = function() {
    var i = this.bubbles.length;
    while (--i >= 0) {
     if (this.bubbles[i].getPosition().y > 840 || this.bubbles[i].getPosition().x < 0 || this.bubbles[i].getPosition().x > 768) {
         this.removeBubble(this.bubbles[i]);
     }
    }
};
ydn.game.Game.prototype.returnPoints = function(b) {
    var hide = new lime.animation.Spawn(
         new lime.animation.ScaleBy(2),
         new lime.animation.FadeTo(0)
      );
      goog.events.listen(hide, lime.animation.Event.STOP, function() {
          this.layer.removeChild(b);
      },false, this);
      b.runAction(hide);
      this.addPoints(b.value);
      var lbl = new lime.Label().setText('+' + b.value).setFontColor('#060').setFontSize(40)
          .setOpacity(0.5).setPosition(b.getPosition().clone()).setFontWeight(700);
      this.appendChild(lbl);
      var show = new lime.animation.Spawn(
        new lime.animation.MoveBy(0, -60),
        new lime.animation.FadeTo(0),
        new lime.animation.ScaleBy(2)
      );
      lbl.runAction(show);
      goog.events.listen(show, lime.animation.Event.STOP, function() {
          this.removeChild(lbl);
      },false, this);
};

ydn.game.Game.prototype.updateFloaters = function(dt) {
    for (var i = 0; i < this.bubbles.length; i++) {
        this.bubbles[i].updateFloatingSpeed();
    }
};

