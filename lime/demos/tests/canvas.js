goog.provide('test.canvas');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
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

	flameLayer = new lime.Layer;
	gamescene.appendChild(flameLayer);


    sprite = new lime.Sprite().setRenderer(lime.Renderer.CANVAS);
    flameLayer.appendChild(sprite);

     ch1 = new lime.Circle().setSize(30, 30).setPosition(100, 100).setFill('#c00');
    sprite.appendChild(ch1);

     ch2 = new lime.Circle().setSize(30, 30).setPosition(150, 100).setFill('#c00');
    sprite.appendChild(ch2);

     ch3 = new lime.Circle().setSize(30, 30).setPosition(200, 100).setFill('#c00');
    sprite.appendChild(ch3);




    // set active scene
    test.director.replaceScene(gamescene);
};

function debug() {
ch1.setScale(1.1);
    ch2.setScale(1.1);
    ch3.setScale(1.1);
}


goog.exportSymbol('test.start', test.start);
