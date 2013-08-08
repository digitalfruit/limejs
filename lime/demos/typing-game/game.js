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
    this.magic = 6 + Math.round(((level - 1) / 20) * (15 - 6));
    ydn.game.RELOAD_TIME = 6800 - level * 120;
    ydn.game.BUBBLE_SPEED = 75 + this.level * 1.4;


    this.mask = new lime.Sprite().setFill(new lime.fill.LinearGradient().addColorStop(0, 0, 0, 0, 0).addColorStop(.95, 0, 0, 0, .1).addColorStop(1, 0, 0, 0, .0)).setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);

    this.mask = new lime.Sprite().setSize(768, 760).setAnchorPoint(0, 0).setPosition(0, 130);
    this.appendChild(this.mask);


    this.layer = new lime.Layer();
    if(ydn.game.isBrokenChrome()) this.layer.setRenderer(lime.Renderer.CANVAS);
    this.appendChild(this.layer);
    this.layer.setMask(this.mask);
    this.layer.setOpacity(.5);

    this.bubbles = [];
    this.addBubbles(3);

    lime.scheduleManager.scheduleWithDelay(this.reload, this, ydn.game.RELOAD_TIME);
    lime.scheduleManager.scheduleWithDelay(this.checkDeletions, this, 200);

    this.lblScore = new lime.Label().setText('NUMBER ' + this.magic).setPosition(760, 15)
        .setAnchorPoint(1, 0).setFontColor('#80ff36')
        .setFontSize(70);
    this.appendChild(this.lblScore);

    this.progress = new ydn.game.Progress().setProgress(.5).setPosition(20, 50);
    this.appendChild(this.progress);


    this.points = this.magic * this.RANGE;
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
        var b = ydn.game.Bubble.random(this.magic - 1);
        b.setPosition(Math.random() * this.WIDTH + 100, offset - Math.random() * 100);
        this.layer.appendChild(b);
        this.bubbles.push(b);
    }
    lime.scheduleManager.callAfter(this.updateFloaters, this, 100);
};

ydn.game.Game.prototype.reload = function(dt) {
   this.addBubbles(2);
};

ydn.game.Game.prototype.addPoints = function(p) {
    this.points += p;
    if (this.points < 0) this.points = 0;
    var progress = this.points / (this.magic * this.RANGE * 2);
    if (progress > 1) progress = 1;
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

    goog.events.listen(this, ['mousedown', 'touchstart', 'keydown'],
         this.downHandler_, false, this);

    lime.scheduleManager.schedule(function(){
     this.graphics.setDirty(lime.Dirty.CONTENT);
     }, this);
};


ydn.game.Game.prototype.downHandler_ = function(e) {
    if (e.type == 'keydown') {
        if (e.event.keyCode == 90 && !this.isdown) {
            this.isdown = true;
        }
        else return;
    }

    var touch = {pos: e.position, particles: [], quaters: [0, 0, 0, 0], moved: false};
    this.touches.push(touch);

    e.swallow(['mousemove', 'touchmove'], goog.partial(this.moveHandler_, touch));
    e.swallow(['mouseup', 'touchend', 'touchcancel', 'keyup'], goog.partial(this.upHandler_, touch));
    
};
ydn.game.Game.prototype.moveHandler_ = function(touch,e) {
    if (!goog.isDef(touch.pos)) {
        touch.pos = e.position;
        return;
    }
    touch.moved = true;
    var dx = e.position.x - touch.pos.x,
        dy = e.position.y - touch.pos.y,
        lensq = dx * dx + dy * dy;
       var limit = goog.userAgent.MOBILE ? 300 : 0;
    if (lensq > limit) {

       if (dx > 0) {
           if (dy > 0) {
             touch.quaters[0] = 1;}
           else {
             touch.quaters[1] = 1;
           }
       } else {
           if (dy > 0) {
             touch.quaters[2] = 1;
           }
           else {
             touch.quaters[3] = 1;
           }
       }

       touch.particles.push(new Particle(touch.pos.x, touch.pos.y, e.position.x, e.position.y));
      // console.log(this.pos.x+' '+this.pos.y+' '+e.position.x+' '+e.position.y);
       touch.pos = e.position;
       }
   };

ydn.game.Game.prototype.upHandler_ = function(touch,e) {
    if (e.type == 'keyup' && e.event.keyCode != 90) {
        return;
    }
    var ctx = this.ctx;
    var particles = touch.particles;
    var b = this.bubbles;
    var b_value;
    var dx, dy, lensq, loop, i, j, p, found = [];

    this.isdown = false;
    touch.remove = 1;


    if (particles.length) {
        ctx.beginPath();
        dx = particles[particles.length - 1].p1[0] - particles[0].p0[0];
        dy = particles[particles.length - 1].p1[1] - particles[0].p0[1];
        lensq = dx * dx + dy * dy;

        loop = touch.quaters[0] + touch.quaters[1] + touch.quaters[2] + touch.quaters[3];
        if (loop > 2 || lensq < 6000) {
           ctx.moveTo(particles[0].p0[0], particles[0].p0[1]);
           for (i = 0; i < particles.length; i++) {
               ctx.lineTo(particles[i].p1[0], particles[i].p1[1]);
           }
        }
        else {
            for (i = 0; i < particles.length; i++) {
                j = b.length;
                while (--j >= 0) {
                    if (b_value == 1) continue;
                    p = b[j].getPosition();
                    dx = p.x - particles[i].p1[0];
                    dy = p.y - particles[i].p1[1];
                    lensq = dx * dx + dy * dy;
                    if (lensq < 1000) {
                        this.breakup(b[j], particles[i].p1[0] - particles[i].p0[0],
                               particles[i].p1[1] - particles[i].p0[1]);
                    }
                }
            }
        }

        ctx.closePath();
        for (i = 0; i < b.length; i++) {
            p = b[i].getPosition();
            if (ctx.isPointInPath(p.x, p.y)) {
                found.push(b[i]);
            }
        }

        if (found.length > 1) {
            this.combine(found);
        }
    }
    else if (!touch.moved) {
        j = b.length;
        while (--j >= 0) {
            if (b_value == 1) continue;
            p = b[j].getPosition();
            dx = p.x - e.position.x;
            dy = p.y - e.position.y;
            lensq = dx * dx + dy * dy;
            if (lensq < 1000) {
                this.removeBubble(b[j]);
                break;
            }
        }
    }
};

ydn.game.Game.prototype.startup = function() {
    var title = new lime.Label().setText('Are you ready?').setFontSize(52).setPosition(0, 0);
    this.cover.appendChild(title);
    var show = new lime.animation.MoveBy(0, 200).setDuration(1.5);
    title.runAction(show);

    var box = ydn.game.dialogs.box1();
    this.cover.appendChild(box);
    var that = this;

    goog.events.listen(show, lime.animation.Event.STOP, function() {
        ydn.game.dialogs.appear(box);

        var box2 = ydn.game.dialogs.box2();
        ydn.game.dialogs.hide(box, function() {
            that.cover.removeChild(box);
            that.cover.appendChild(box2);
            ydn.game.dialogs.appear(box2);

            var box3 = ydn.game.dialogs.box3(that);
            ydn.game.dialogs.hide(box2, function() {
                that.cover.removeChild(box2);
                that.cover.appendChild(box3);
                ydn.game.dialogs.appear(box3);

                ydn.game.dialogs.hide(box3, function() {
                    that.cover.removeChild(box3);
                    that.cover.removeChild(title);
                    that.start();
                });

            });

        });
    });

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

     goog.events.unlisten(this, ['mousedown', 'touchstart', 'keydown'],
             this.downHandler_, false, this);

};

ydn.game.Game.prototype.removeBubble = function(b) {
    this.layer.removeChild(b);
    this.addPoints(-b.value);
    var lbl = new lime.Label().setText('-' + b.value).setFontColor('#c00').setFontSize(40)
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

ydn.game.Game.prototype.combine = function(bubs) {
    var sumcoord = [0, 0];
    var sum = 0;

    for (var i = 0; i < bubs.length; i++) {
        var p = bubs[i].getPosition();
        sumcoord[0] += p.x;
        sumcoord[1] += p.y;
        goog.array.remove(this.bubbles, bubs[i]);
        sum += bubs[i].value;
    }
    sumcoord[0] /= bubs.length;
    sumcoord[1] /= bubs.length;

    var anim = new lime.animation.Spawn(
        new lime.animation.MoveTo(sumcoord[0], sumcoord[1]).enableOptimizations(),
        new lime.animation.FadeTo(0).enableOptimizations()
    );
    for (var i = 0; i < bubs.length; i++) {
        anim.addTarget(bubs[i]);
    }
    anim.play();
    goog.events.listen(anim, lime.animation.Event.STOP, function(e) {
       for (var i = 0; i < bubs.length; i++) {
           this.layer.removeChild(bubs[i]);
       }
    },false, this);

    var b = new ydn.game.Bubble(sum).setPosition(sumcoord[0], sumcoord[1]).setOpacity(0);
    this.layer.appendChild(b);

    var appear = new lime.animation.Sequence(
        new lime.animation.Delay().setDuration(.5),
        new lime.animation.FadeTo(1)
    );
    goog.events.listen(appear, lime.animation.Event.STOP, function() {
        if (b.value == this.magic) { this.returnPoints(b)}
        else {
        this.bubbles.push(b);
        b.updateFloatingSpeed(); }
    },false, this);
    b.runAction(appear);

};

ydn.game.Game.prototype.breakup = function(bub,dx,dy) {
    if (bub.value < 2) return;

    var angle = Math.PI * 2 * Math.random();

    var split = Math.ceil(Math.random() * (bub.value - 1));
    split = [split, bub.value - split];

    goog.array.remove(this.bubbles, bub);
    var pos = bub.getPosition().clone();

    var fade = new lime.animation.FadeTo(0);
    goog.events.listen(fade, lime.animation.Event.STOP, function() {
        this.layer.removeChild(bub);
    },false, this);

    bub.runAction(fade);

    var rand = new goog.math.Vec2(-dy, dx).normalize().scale(70);

    for (var i = 0; i < 2; i++) {
        var newb = new ydn.game.Bubble(split[i]).setPosition(pos).setOpacity(.5);
        this.layer.appendChild(newb);
        if (i)rand.invert();
        var appear = new lime.animation.Spawn(
            new lime.animation.MoveBy(rand.x, rand.y),
            new lime.animation.FadeTo(1)
        );
        var game = this;
        goog.events.listen(appear, lime.animation.Event.STOP, function() {
            if (this.value == game.magic) {
                game.returnPoints(this);
            }
            else {
                game.bubbles.push(this);
                newb.updateFloatingSpeed();
            }
        },false, newb);
        newb.runAction(appear);
    }

};
