goog.provide('test.opacity');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Loop');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Sequence');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var layer = new lime.Layer;
	layer.setPosition(100, 0);
	gamescene.appendChild(layer);


    var ball = new lime.Circle;
    layer.appendChild(ball);
   // ball.setRenderer(lime.Renderer.CANVAS);
    ball.setFill(100, 0, 0);
    ball.setPosition(50, 100).setSize(100, 100);

    ball.runAction(new lime.animation.Loop(new lime.animation.Sequence(
        new lime.animation.FadeTo(0).setDuration(3).enableOptimizations(),
        new lime.animation.FadeTo(1).setDuration(3).enableOptimizations()
    )));




	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
