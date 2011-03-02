goog.provide('test.mask2');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');

goog.require('lime.animation.RotateBy');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer().setScale(2);
	gamescene.appendChild(flameLayer);


	var one = new lime.Sprite().
	    setPosition(100, 100).setRotation(30).
	    setFill('assets/nano.png');

	flameLayer.appendChild(one);

    var two = new lime.Sprite().
	    setPosition(100, 100).setRotation(-130).
	    setSize(110, 110).
	    setFill(100, 0, 0);

	flameLayer.appendChild(two);

    one.setMask(two);

    setInterval(function() {
       two.runAction(new lime.animation.RotateBy(30).setDuration(.5));
        one.runAction(new lime.animation.RotateBy(-10).setDuration(.5));
    },500);


	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
