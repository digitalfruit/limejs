goog.provide('test.frame1');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.RoundedRect');
goog.require('lime.fill.Frame');
goog.require('lime.animation.KeyframeAnimation');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	 layer = new lime.Layer();
	gamescene.appendChild(layer);
	
	var sprite = new lime.Sprite().setPosition(120,200).setSize(200,200).setFill(
	    new lime.fill.Frame('assets/nano.png',70,20,105,105).setSize(.5,.5,true).setOffset(.5,.5,true)
	    ).setRenderer(lime.Renderer.DOM).setStroke(10,100,0,0,.8);
	layer.appendChild(sprite);
	
	var img = new lime.fill.Image('assets/nano.png').setSize(0.5,.5,true).setOffset(.5,.5,true);
	
	var nano = new lime.Sprite().setFill(img).setPosition(400,100).setStroke(10,100,0,0,.8);
	layer.appendChild(nano);
	
    var nano2 = new lime.RoundedRect().setRadius(30).setFill(img).setPosition(400,300).setStroke(10,100,0,0,.8).
        setRenderer(lime.Renderer.CANVAS);
	layer.appendChild(nano2);
	
    
    // set active scene
    test.director.replaceScene(gamescene);
};


goog.exportSymbol('test.start', test.start);
