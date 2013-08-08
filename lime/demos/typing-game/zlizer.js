//set main namespace
goog.provide('ydn.game');


//get requirements
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
goog.require('ydn.game.Button');
goog.require('ydn.game.Game');
goog.require('goog.debug.Logger');
goog.require('ydn.debug');

ydn.game.WIDTH = 768;
ydn.game.HEIGHT = 1004;

/**
 * @protected
 * @type {goog.debug.Logger} logger.
 */
ydn.game.logger =
    goog.debug.Logger.getLogger('ydn.game');

// entrypoint
ydn.game.start = function() {
  ydn.game.logger.finest('starting');
    ydn.game.director = new lime.Director(document.body, ydn.game.WIDTH, ydn.game.HEIGHT);
    ydn.game.director.makeMobileWebAppCapable();

    lime.Label.defaultFont = 'Impact';
    lime.Label.installFont('Impact', 'assets/impact.ttf');
    ydn.game.loadMenuScene();

};

ydn.game.isBrokenChrome = function(){
   return (/Chrome\/9\.0\.597/).test(goog.userAgent.getUserAgentString());
};


/**
 *
 * @param {lime.transitions.Transition=}  opt_transition
 */
ydn.game.loadMenuScene = function(opt_transition) {
    var scene = new lime.Scene();
    var tr = opt_transition || new lime.transitions.MoveInDown();
    ydn.game.director.replaceScene(scene, tr);

    var layer = new lime.Layer().setPosition(ydn.game.WIDTH * .5, 0);
    scene.appendChild(layer);

    var title = new lime.Sprite().setFill('assets/main_title.png').setPosition(0, 250);
    layer.appendChild(title);


    var mask = new lime.Sprite().setSize(620, 560).setFill('#c00').setAnchorPoint(0.5, 0).setPosition(0, 410);
    layer.appendChild(mask);

    var contents = new lime.Layer().setPosition(0, 280);
    layer.appendChild(contents);

    contents.setMask(mask);

    var btn_play = new ydn.game.Button('PLAY NOW').setPosition(0, 330).setSize(250, 100);
    btn_play.addEventListener(lime.Button.Event.CLICK, function() {
      ydn.game.loadGame(1);
    }, false);
    contents.appendChild(btn_play);

    var btn_levels = new ydn.game.Button('PICK LEVEL').setPosition(0, 480).setSize(250, 100);
    contents.appendChild(btn_levels);
    btn_levels.addEventListener(goog.events.EventType.CLICK, function() {
       contents.runAction(new lime.animation.MoveTo(0, -255).enableOptimizations());
    }, false);

    var levels = new lime.Layer().setPosition(0, 690);
    contents.appendChild(levels);

    if(ydn.game.isBrokenChrome()){
           levels.setRenderer(lime.Renderer.CANVAS);
       }

    var lbl_levels = new lime.Label().setText(('Pick level:').toUpperCase()).setFontSize(30).setAnchorPoint(.5, 0).setPosition(0, 0).setFontColor('#fff');
    levels.appendChild(lbl_levels);

    var btns_layer = new lime.Layer().setPosition(-250, 110);
    levels.appendChild(btns_layer);
    
    var r = 0;
    for (r = 0; r < 4; r++) {
        for (var c = 0; c < 5; c++) {
            var num = (c + 1) + (r * 5);
            var btn = new ydn.game.Button('' + num).setSize(80, 80).setPosition(c * 125, r * 90);
            btns_layer.appendChild(btn);
            goog.events.listen(btn, goog.events.EventType.CLICK, function() {
              ydn.game.loadGame(this.level);
            }, false, {level: num});
        }
    }

    //Creates a button to go back to the main menu
    var btn_main = new ydn.game.Button('Back to Menu').setSize(400, 80).setPosition(250, r * 90);
    btns_layer.appendChild(btn_main);
    goog.events.listen(btn_main, goog.events.EventType.CLICK, function() {
      contents.runAction(new lime.animation.MoveTo(0, 280).enableOptimizations());
    }, false);
    
};


ydn.game.loadGame = function(level) {
  ydn.game.logger.finest('loading level ' + level);
    ydn.game.activeGame = new ydn.game.Game(level);
    ydn.game.director.replaceScene(ydn.game.activeGame, new lime.transitions.MoveInUp());
};

// add lime credintials to a scene
ydn.game.builtWithLime = function(scene) {
    var lm = new lime.Sprite().setFill('assets/lime.png');
    var txt = new lime.Label().setText('Built with').setFontColor('#fff').setFontSize(24).setPosition(550, 950);
    var btn = new lime.Button(lm).setScale(.3).setPosition(670, 950);
    goog.events.listen(btn, 'click', function() {
        goog.global['location']['href'] = 'http://www.limejs.com/';
    });
    scene.appendChild(txt);
    scene.appendChild(btn);
};


/**
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @constructor
 */
function Particle(x0, y0, x1, y1) {
    this.p0 = [x0, y0];
    this.p1 = [x1, y1];
    this.life = 0;
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('ydn.game.start', ydn.game.start);
goog.exportSymbol('ydn.debug.log', ydn.debug.log);
