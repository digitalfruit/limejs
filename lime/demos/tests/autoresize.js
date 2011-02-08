goog.provide('test.autoresize');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.Delay');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');



test.WIDTH = 800;
test.HEIGHT = 600;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var layer = new lime.Sprite().setAnchorPoint(0, 0);
	layer.setPosition(300, 100);
	gamescene.appendChild(layer);

	var d1 = test.createDummy();
	d1.setPosition(0, 0);
//	d1.c.setAutoResize(lime.AutoResize.WIDTH  & lime.AutoResize.RIGHT);
//	d1.setSize(500,100);
	layer.appendChild(d1);


    var d2 = test.createDummy();
	d2.setPosition(0, 120);
	d2.c.setAutoResize(lime.AutoResize.WIDTH | lime.AutoResize.HEIGHT);
	d2.setSize(500, 100);
	layer.appendChild(d2);


    var d3 = test.createDummy();
	d3.setPosition(0, 240);
	d3.c.setAutoResize(lime.AutoResize.WIDTH | lime.AutoResize.RIGHT | lime.AutoResize.TOP);
	d3.setSize(500, 100);
	layer.appendChild(d3);


    var d4 = test.createDummy();
	d4.setPosition(0, 360);
	d4.c.setAutoResize(lime.AutoResize.ALL);
	d4.setSize(500, 100);
	layer.appendChild(d4);


	test.director.replaceScene(gamescene);


};

test.createDummy = function() {
    var parent = new lime.Sprite().setAnchorPoint(0.3, 0.2).setSize(200, 70).setFill('#c00');
    var child = new lime.Sprite().setAnchorPoint(0.3, 0.3).setSize(100, 40).setFill('#0c0').setPosition(10, 10);
    parent.appendChild(child);
    parent.c = child;
    return parent;
};

goog.exportSymbol('test.start', test.start);
