goog.provide('test.frame3');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.SpriteSheet');
goog.require('lime.ASSETS.spinner.zwoptex')


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	 layer = new lime.Layer();
	gamescene.appendChild(layer);
	
	var sprite = new lime.Sprite().setPosition(200,200).setSize(300,230);
	layer.appendChild(sprite);
	
	var ss = new lime.SpriteSheet('assets/spinner/spinner_sheet.png',lime.ASSETS.spinner.zwoptex);
	
	var anim = new lime.animation.KeyframeAnimation();
	for(var i=1;i<=60;i++){
	    anim.addFrame(ss.getFrame('frame_00'+(i>9?'':'0')+i+'.png').
	        setSize(33,33).setOffset((60-i)/60,0,true));
	}
    
	sprite.runAction(anim);
	
    // set active scene
    test.director.replaceScene(gamescene);
};


goog.exportSymbol('test.start', test.start);
