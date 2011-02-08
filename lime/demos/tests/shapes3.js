goog.provide('test.shapes3');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.RoundedRect');
goog.require('lime.Scene');
goog.require('lime.animation.MoveBy');
goog.require('lime.fill.LinearGradient');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer;
	flameLayer.setPosition(100, 0);
	gamescene.appendChild(flameLayer);


    var rect = new lime.RoundedRect().setSize(100, 100).setPosition(200, 300).setFill(0, 0, 100);
    flameLayer.appendChild(rect);

    var rect2 = new lime.RoundedRect().setSize(100, 100).setPosition(200, 200).setFill(0, 0, 100)
        .setRenderer(lime.Renderer.CANVAS);
    flameLayer.appendChild(rect2);


    var grad = new lime.fill.LinearGradient().setDirection(0, 0, 0, 1).addColorStop(0, '#c00').addColorStop(.45, '#0c0').addColorStop(.5, '#f90').addColorStop(1, '#00c');
     rect.setFill(grad);
    rect2.setFill(grad);



    // set active scene
    test.director.replaceScene(gamescene);
};



goog.exportSymbol('test.start', test.start);
