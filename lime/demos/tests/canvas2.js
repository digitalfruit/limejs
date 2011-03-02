goog.provide('test.canvas2');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Circle');
goog.require('lime.RoundedRect');
goog.require('lime.Polygon');
goog.require('lime.Label');
goog.require('lime.fill.LinearGradient');
goog.require('lime.animation.Loop');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveBy');

test.WIDTH = 500;
test.HEIGHT = 350;


test.start = function() {

	var director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	director.makeMobileWebAppCapable();

	var scene = new lime.Scene;
	
	var layer1 = test.makeLayerOfStuff();
	scene.appendChild(layer1);
	
	var layer2 = test.makeLayerOfStuff().setPosition(0,180).setRenderer(lime.Renderer.CANVAS);
	scene.appendChild(layer2);

    // set active scene
    director.replaceScene(scene);
};

test.makeLayerOfStuff = function(){
    var layer = new lime.Layer();
    
    
    //sprite
    var box = new lime.Sprite().setFill('#36C').setSize(70,40).
        setPosition(70,80).setAnchorPoint(.2,.7).setRotation(15).setScale(1.5);
    layer.appendChild(box);
    
    
    // circles
    var circle = new lime.Circle().setFill('#f90').setSize(30,30).setPosition(150,20);
    layer.appendChild(circle);
    
    var circle2 = new lime.Circle().setFill('assets/html5_badge.png').setSize(50,50).
        setPosition(0,30).setScale(1.2);
    circle.appendChild(circle2);
    
    var circle3 = new lime.Circle().setFill(
        new lime.fill.LinearGradient().addColorStop(0,0,100,0,.5).addColorStop(1,200,0,0)
        ).setSize(50,50).setPosition(0,40).setScale(1.2);
    circle2.appendChild(circle3);
    
    
    // rounded rect
    var rrect = new lime.RoundedRect().setFill(0,0,100).setSize(60,40).
        setPosition(240,70).setRadius(7).setScale(1.3);
    layer.appendChild(rrect);
    
    var anim = new lime.animation.Spawn(
        new lime.animation.ScaleBy(.3).setDuration(3).enableOptimizations(),
        new lime.animation.MoveBy(0,-30).setDuration(3).enableOptimizations()
    );
    
    rrect.runAction(
        new lime.animation.Loop(
            new lime.animation.Sequence(anim,anim.reverse())
        )
    );
    
    //label
    var lbl = new lime.Label().setText('DEMO').setFontSize(15).setFontColor('#fff');
    rrect.appendChild(lbl);


    // masked circle
    var ball = new lime.Circle().setFill('#3F0').setSize(55,55).setPosition(330,60).setScale(1.6);
    layer.appendChild(ball);
    
    var mask = new lime.Sprite().setSize(50,50).setFill('#c00').setRotation(45).setPosition(20,0);
    ball.appendChild(mask);
    ball.setMask(mask);


    // polygon
    var poly = new lime.Polygon().setPoints(0,50 ,40,0, -40,0).
        setFill(255,0,150,.5).setPosition(400,70).setRotation(190).setScale(1.5);
    layer.appendChild(poly);
    
    mask.runAction(
        new lime.animation.Loop(
            new lime.animation.RotateBy(30).setDuration(1)
        )
    );
    
    
    return layer;
}

goog.exportSymbol('test.start', test.start);
