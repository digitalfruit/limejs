goog.provide('test.mask');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');

goog.require('lime.animation.MoveTo');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer;
	gamescene.appendChild(flameLayer);


	var one = new lime.Sprite().
	    setSize(100, 100).
	    setPosition(100, 100).
	    setFill(100, 0, 0);

	flameLayer.appendChild(one);

	var two = new lime.Sprite().
	    setSize(100, 100).
	    setPosition(150, 150).
	    setFill(0, 100, 0).setRotation(15);
	flameLayer.appendChild(two);

	var three = new lime.Sprite().setRenderer(lime.Renderer.CANVAS).
	    setSize(100, 100).
	    setPosition(160, 160).setRotation(-15).
	    setFill(0, 0, 100);

    three.setMask(two);

	flameLayer.appendChild(three);



	goog.events.listen(three, ['mousedown', 'touchstart'], function(e) {console.log('click');
	   three.runAction(new lime.animation.MoveTo(220, 220).setDuration(2));
	   //two.setPosition(100,100);
	});


	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
