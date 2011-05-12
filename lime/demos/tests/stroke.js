goog.provide('test.stroke');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Circle');
goog.require('lime.RoundedRect');
goog.require('lime.Polygon');
goog.require('lime.Label');
goog.require('lime.fill.LinearGradient');

test.WIDTH = 500;
test.HEIGHT = 350;


test.start = function() {

	var director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	director.makeMobileWebAppCapable();

	var scene = new lime.Scene;
	
	var layer = new lime.Layer().setPosition(70,170);
	scene.appendChild(layer);
	
	var sprite = new lime.Sprite().setSize(90,90).setFill('#c00');
	layer.appendChild(sprite);
    
	var circle = new lime.Circle().setSize(90,90).setFill('assets/html5_badge.png').setPosition(80,0);
	layer.appendChild(circle);
	
    var rrect = new lime.RoundedRect().setSize(70,90).setRadius(15).setRotation(-20).setFill(
        new lime.fill.LinearGradient().setDirection(0,0,1,1).
            addColorStop(0,0,0,100,.9).addColorStop(1,0,0,100,0)
        ).setPosition(160,0);
	layer.appendChild(rrect);
	
    var tri = new lime.Polygon().setPoints(0,-70 ,40,0, -40,0).setFill(
        new lime.fill.LinearGradient().setDirection(0,0,0,1).
            addColorStop(0.4,200,0,0).addColorStop(1,0,200,0)
        ).setPosition(220,20);
	layer.appendChild(tri);
	
	var sprite2 = new lime.Label().setText('Hi').setFontColor('#fff').setFontSize(32).
	    setPadding(15,10).setRotation(10).setFill('#0a0').setPosition(280,0);
    layer.appendChild(sprite2);
    
    var circle2 = new lime.Circle().setSize(100,70).setRotation(5).setPosition(350,0);
    layer.appendChild(circle2);
    
    var index = 0;
    lime.scheduleManager.scheduleWithDelay(function(){
        var child = layer.getChildAt(index);
        
        child.setStroke(
            Math.floor(Math.random()*6)*2+4,
            Math.floor(Math.random()*255),
            Math.floor(Math.random()*255),
            Math.floor(Math.random()*255),
            Math.random()*.5+.5
        );
        
        index++;
        if(index>=layer.getNumberOfChildren()) index=0;
    },this,500);
    
    // set active scene
    director.replaceScene(scene);
};


goog.exportSymbol('test.start', test.start);
