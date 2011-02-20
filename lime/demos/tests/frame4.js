goog.provide('test.frame4');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.SpriteSheet');
goog.require('lime.ASSETS.monster.plist')


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	 layer = new lime.Layer();
	gamescene.appendChild(layer);
	
	var sprite = new lime.Sprite().setPosition(200,200).setSize(70,100);
	layer.appendChild(sprite);
	
	var ss = new lime.SpriteSheet('assets/monster.png',lime.ASSETS.monster.plist);
	
	var anim = new lime.animation.KeyframeAnimation();
	for(var i=1;i<=7;i++){
	    anim.addFrame(ss.getFrame('walking-s000'+i+'.png'));
	}
	sprite.runAction(anim);
	
    // set active scene
    test.director.replaceScene(gamescene);
};


goog.exportSymbol('test.start', test.start);
