goog.provide('test.keyframe');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
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
	

    glow().setPosition(100,100);
    glow().setPosition(300,100);
    glow().setPosition(200,100);
    glow().setPosition(400,100);
    glow().setPosition(500,100);
    

    glow().setPosition(100,150);
    glow().setPosition(300,150);
    glow().setPosition(200,150);
    glow().setPosition(400,150);
    glow().setPosition(500,150);
    

    glow().setPosition(100,200);
    glow().setPosition(300,200);
    glow().setPosition(200,200);
    glow().setPosition(400,200);
    glow().setPosition(500,200);
    glow().setPosition(100,250);
    glow().setPosition(300,250);
    glow().setPosition(200,250);
    glow().setPosition(400,250);
    glow().setPosition(500,250);
    

    glow().setPosition(100,300);
    glow().setPosition(300,300);
    glow().setPosition(200,300);
    glow().setPosition(400,300);
    glow().setPosition(500,300);
    // set active scene
    test.director.replaceScene(gamescene);
};

function glow(){
    var glow = new lime.Sprite().setPosition(150,150).setSize(90,45);
	layer.appendChild(glow);
	
	var anim = new lime.animation.KeyframeAnimation();
	for(var i=1;i<=60;i++){
	    var fill = lime.fill.parse('assets/glow/frame_00'+(i>9?'':'0')+i+'.png').setSize(50,50).setOffset(.5,.5,true);
	    anim.addFrame(fill);
	}
	
	glow.runAction(anim);
	
	return glow;
}

goog.exportSymbol('test.start', test.start);
