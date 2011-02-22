goog.provide('test.frame2');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
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
	
	var sprite = new lime.Sprite().setPosition(200,200).setSize(100,100);
	layer.appendChild(sprite);
	
	var anim = new lime.animation.KeyframeAnimation();
	for(var r=0;r<6;r++){
	    for(var c=0;c<10;c++){
	        anim.addFrame(new lime.fill.Frame('assets/spinner/spinner_sheet.png',c*50,r*50,50,50).setSize(.5,.5,true));
	    }
	}
	sprite.runAction(anim);
	
    // set active scene
    test.director.replaceScene(gamescene);
};


goog.exportSymbol('test.start', test.start);
