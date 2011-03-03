goog.provide('test.keyframe2');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Polygon');
goog.require('lime.Circle');
goog.require('lime.RoundedRect');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.Loop');

goog.require('lime.fill.LinearGradient');

test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	 layer = new lime.Layer();
	gamescene.appendChild(layer);
	

    var sprite = new lime.RoundedRect().setRadius(10).setSize(50,50).setPosition(100,200);
    layer.appendChild(sprite);
    var anim = new lime.animation.KeyframeAnimation().setDelay(.5).
        addFrame('#c00').addFrame('#0c0').addFrame('#00c');
    sprite.runAction(anim);



    var circle = new lime.Circle().setSize(120,120).setPosition(250,200);
    layer.appendChild(circle);
    var anim2 = new lime.animation.KeyframeAnimation().setDelay(1/15);
    for(var i=1;i<=10;i++){
        anim2.addFrame(new lime.fill.LinearGradient().setDirection(0,0,i/10,i/10).
            addColorStop(i/11,'#c00').addColorStop(1,'#00c'));
    }
    for(var i=1;i<=10;i++){
        anim2.addFrame(new lime.fill.LinearGradient().setDirection(0,1,i/10,1-i/10).
            addColorStop(i/11,'#00c').addColorStop(1,'#c00'));
    }
    circle.runAction(anim2);



    var sign = new lime.Polygon().setPoints(10,0,60,60,50,20,120,20,120,-20,50,-20,60,-60).
        setPosition(450,200);
    layer.appendChild(sign);
    var anim3 = new lime.animation.KeyframeAnimation().setDelay(1/30);
    for(var i=1;i<=100;i++){
        anim3.addFrame(new lime.fill.Image('assets/sign.png').setSize(200,33).
            setOffset(1-i/100,0,true));
    }
    sign.runAction(anim3);
    
    var loop=new lime.animation.Loop(
         new lime.animation.RotateBy(45).setDuration(1)
     );
         //loop.addTarget(sprite);
         loop.addTarget(sign);
       //  loop.addTarget(sign);
    loop.play();

    // set active scene
    test.director.replaceScene(gamescene);
};



goog.exportSymbol('test.start', test.start);
