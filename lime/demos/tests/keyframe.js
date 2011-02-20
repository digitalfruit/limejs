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
	
    for(var r=1;r<=5;r++){
        for(var c=1;c<=5;c++){
            glow().setPosition(r*100,c*50+50);
        }
    }

    // set active scene
    test.director.replaceScene(gamescene);
};

function glow(){
    // the glow demo frames are from Keith Peters SWFSheet sample http://bit-101.com/
    
    var glow = new lime.Sprite().setPosition(150,150).setSize(90,45);
	layer.appendChild(glow);
	
	var anim = new lime.animation.KeyframeAnimation();
	for(var i=1;i<=60;i++){
	    var fill = lime.fill.parse('assets/spinner/frame_00'+(i>9?'':'0')+i+'.png').setSize(50,50).setOffset(.5,.5,true);
	    anim.addFrame(fill);
	}
	
	glow.runAction(anim);
	
	return glow;
}

goog.exportSymbol('test.start', test.start);
