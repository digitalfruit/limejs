goog.provide('test.anim3');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.Delay');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');



test.WIDTH = 800;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

    var gamescene = new lime.Scene;

    var flameLayer = new lime.Layer();//.setRenderer(lime.Renderer.CANVAS); flameLayer.setPosition(100,0);
    gamescene.appendChild(flameLayer);

    var quality = 4; var scale = 1;

    var flame = new lime.Sprite;
    flameLayer.appendChild(flame);
    flame.setFill(100, 0, 0).setPosition(0, 100).setSize(100, 100);

    var move = new lime.animation.MoveBy(700, 0).setDuration(5).enableOptimizations()
        .setEasing(lime.animation.Easing.EASEINOUT);
    move.addTarget(flame);
    move.play();


    flame = new lime.Sprite;
    flameLayer.appendChild(flame);
    flame.setFill(100, 0, 0).setPosition(0, 210).setSize(100, 100);

    move = new lime.animation.MoveBy(700, 0).setDuration(5).setEasing(lime.animation.Easing.EASEINOUT);
    move.addTarget(flame);
    move.play();


	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
