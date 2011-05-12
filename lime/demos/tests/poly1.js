goog.provide('test.poly1');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Polygon');
goog.require('lime.Scene');
goog.require('lime.animation.RotateBy');
goog.require('lime.fill.LinearGradient');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer().setRenderer(lime.Renderer.CANVAS);
	gamescene.appendChild(flameLayer);

	var line = new lime.Sprite().setFill('#666').setSize(2, 300).setPosition(200, 200);
       flameLayer.appendChild(line);
       line = new lime.Sprite().setFill('#666').setSize(300, 2).setPosition(200, 200);
       flameLayer.appendChild(line);

	var poly = new lime.Polygon(-130, -130, 130, -130, 130, 130, -130, 130, -190, 0).setFill(100, 0, 0).setPosition(200, 200).setStroke(5,'#f00');
	flameLayer.appendChild(poly);

	 var p2 = new lime.Polygon(0, -160, 140, 120, -140, 120).setFill(
	     new lime.fill.LinearGradient().setDirection(0, 0, 1, 0).addColorStop(.1, 100, 0, 0)
	        .addColorStop(.5, 0, 0, 100).addColorStop(.9, 0, 100, 0)
	     ).setStroke(10,'#f90');
	poly.appendChild(p2);

 	goog.events.listen(poly, ['mousedown', 'touchstart'], function(e) {
 	    poly.runAction(new lime.animation.RotateBy(20));
     	p2.runAction(new lime.animation.RotateBy(20));
 	});
    	goog.events.listen(p2, ['mousedown', 'touchstart'], function(e) {
        	p2.runAction(new lime.animation.RotateBy(-20));

         	e.event.stopPropagation();
    	});

	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
