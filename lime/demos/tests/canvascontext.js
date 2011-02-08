goog.provide('test.canvascontext');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.RoundedRect');
goog.require('lime.fill.LinearGradient');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.Loop');
goog.require('lime.CanvasContext')


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	var layer = new lime.Layer();
	gamescene.appendChild(layer);
	
	var cvs = document.createElement('canvas');
	cvs.width= 300;
	cvs.height = 300;
	layer.appendChild(cvs);
	var ctx = cvs.getContext('2d');
	

	
	var smile = new lime.CanvasContext().setSize(110,110).setPosition(100,100).setScale(.8).setRotation(20);
	layer.appendChild(smile);
	smile.draw = test.drawSmile; // you may also subclass lime.CanvasContext
	
	var moveandrotate = new lime.animation.Spawn(
	    new lime.animation.MoveBy(300,0).setDuration(3),
	    new lime.animation.RotateBy(-40).setDuration(3)
	);
	
	smile.runAction(new lime.animation.Loop(new lime.animation.Sequence(moveandrotate,moveandrotate.reverse())));
	
    // set active scene
    test.director.replaceScene(gamescene);
};

test.drawSmile = function(ctx){
   	//sample code from https://developer.mozilla.org/en/Canvas_tutorial/Drawing_shapes
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 8;
	ctx.beginPath();
    ctx.arc(0,0,50,0,Math.PI*2,true); // Outer circle
    ctx.moveTo(35,0);
    ctx.arc(0,0,35,0,Math.PI,false);   // Mouth (clockwise)
    ctx.moveTo(-10,-15);
    ctx.arc(-15,-15,5,0,Math.PI*2,true);  // Left eye
    ctx.moveTo(20,-15);
    ctx.arc(15,-15,5,0,Math.PI*2,true);  // Right eye
    ctx.stroke(); 
}

goog.exportSymbol('test.start', test.start);
