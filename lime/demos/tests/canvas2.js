
// pg - "Pot Game"
goog.provide('test.canvas');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.RoundedRect');
goog.require('lime.fill.LinearGradient');
goog.require('lime.Polygon');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;
	
	var layer1 = test.makeLayerOfStuff();
	gamescene.appendChild(layer1);
	
	var layer2 = test.makeLayerOfStuff().setPosition(0,200).setRenderer(lime.Renderer.CANVAS);
	gamescene.appendChild(layer2);

    // set active scene
    test.director.replaceScene(gamescene);
};

test.makeLayerOfStuff = function(){
    var layer = new lime.Layer();
    
    var box = new lime.Sprite().setFill('#c00').setSize(70,40).setPosition(100,80).setAnchorPoint(.2,.7).
        setRotation(15).setScale(1.5);
    layer.appendChild(box);
    
    var circle = new lime.Circle().setFill('#f90').setSize(50,50).setPosition(200,40);
    layer.appendChild(circle);
    
    var circle2 = new lime.Circle().setFill('assets/nano.png').setSize(50,50).setPosition(0,10).setScale(.7);
    circle.appendChild(circle2);
    
    var circle3 = new lime.Circle().setFill(
        new lime.fill.LinearGradient().addColorStop(0,0,100,0).addColorStop(1,200,0,0)
        ).setSize(50,50).setPosition(0,50).setScale(2);
    circle2.appendChild(circle3);
    
    var rrect = new lime.RoundedRect().setFill(0,0,100).setSize(60,40).setPosition(280,70).setRadius(7).setScale(1.3);
    layer.appendChild(rrect);
    
    
    var ball = new lime.Circle().setFill('#3F0').setSize(55,55).setPosition(400,60).setScale(1.6);
    layer.appendChild(ball);
    
    var mask = new lime.Sprite().setSize(50,50).setFill('#c00').setRotation(45);
    ball.appendChild(mask);
    ball.setMask(mask);
    
    var poly = new lime.Polygon().setPoints(0,50 ,30,0, -30,0).setFill('#F09').setPosition(490,120).
        setRotation(190).setScale(1.5);
    layer.appendChild(poly);
    
    
    return layer;
}

goog.exportSymbol('test.start', test.start);
