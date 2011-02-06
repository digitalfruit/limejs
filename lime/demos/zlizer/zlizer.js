//set main namespace
goog.provide('zlizer');


//get requirements
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Loop');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.transitions.MoveInUp');
goog.require('zlizer.Button');
goog.require('zlizer.Game');

zlizer.WIDTH = 768;
zlizer.HEIGHT = 1004;

// entrypoint
zlizer.start = function() {

    zlizer.director = new lime.Director(document.body, zlizer.WIDTH, zlizer.HEIGHT);
    zlizer.director.makeMobileWebAppCapable();

    lime.Label.defaultFont = 'Impact';
    lime.Label.installFont('Impact', 'assets/impact.ttf');
    zlizer.loadMenuScene();

};

zlizer.isBrokenChrome = function(){
   return (/Chrome\/9\.0\.597\.84/).test(goog.userAgent.getUserAgentString());
}


zlizer.loadMenuScene = function(opt_transition) {
    var scene = new lime.Scene();
    zlizer.director.replaceScene(scene, opt_transition ? lime.transitions.MoveInDown : undefined);

    var layer = new lime.Layer().setPosition(zlizer.WIDTH * .5, 0);
    scene.appendChild(layer);

    var title = new lime.Sprite().setFill('assets/main_title.png').setPosition(0, 250);
    layer.appendChild(title);


    var mask = new lime.Sprite().setSize(620, 560).setFill('#c00').setAnchorPoint(0.5, 0).setPosition(0, 410);
    layer.appendChild(mask);

    var contents = new lime.Layer().setPosition(0, 280);
    layer.appendChild(contents);

    contents.setMask(mask);

    var btn_play = new zlizer.Button('PLAY NOW').setPosition(0, 330).setSize(250, 100);
    contents.appendChild(btn_play);
    goog.events.listen(btn_play, lime.Button.Event.CLICK, function() {
      zlizer.loadGame(1);
    });

    var btn_levels = new zlizer.Button('PICK LEVEL').setPosition(0, 480).setSize(250, 100);
    contents.appendChild(btn_levels);
    goog.events.listen(btn_levels, lime.Button.Event.CLICK, function() {
       contents.runAction(new lime.animation.MoveTo(0, -255).enableOptimizations());
    });

    var levels = new lime.Layer().setPosition(0, 690);
    contents.appendChild(levels);

    if(zlizer.isBrokenChrome()){
           levels.setRenderer(lime.Renderer.CANVAS);
       }

    var lbl_levels = new lime.Label().setText(('Pick level:').toUpperCase()).setFontSize(30).setAnchorPoint(.5, 0).setPosition(0, 0).setFontColor('#fff');
    levels.appendChild(lbl_levels);

    var btns_layer = new lime.Layer().setPosition(-250, 110);
    levels.appendChild(btns_layer);

    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 5; c++) {
            var num = (c + 1) + (r * 5);
            var btn = new zlizer.Button('' + num).setSize(100, 100).setPosition(c * 125, r * 125);
            btns_layer.appendChild(btn);
            goog.events.listen(btn, lime.Button.Event.CLICK, function() {
              zlizer.loadGame(this);
            },false, num);
        }
    }

};


zlizer.loadGame = function(level) {
    zlizer.activeGame = new zlizer.Game(level);
    zlizer.director.replaceScene(zlizer.activeGame, lime.transitions.MoveInUp);
};


function Particle(x0, y0, x1, y1) {
    this.p0 = [x0, y0];
    this.p1 = [x1, y1];
    this.life = 0;
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('zlizer.start', zlizer.start);
