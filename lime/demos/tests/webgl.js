goog.provide('test.webgl');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.MoveBy');
goog.require('lime.fill.LinearGradient');

goog.require('lime.animation.Spawn');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.RotateBy');

test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var scene = new lime.Scene().setRenderer(lime.Renderer.WEBGL);

	layer = new lime.Layer;
	scene.appendChild(layer);

    var numboxes = 150;
    
    for(var i=0;i<numboxes;i++){
        
        var sprite = new lime.Sprite().setSize(20+Math.random()*40,20+Math.random()*40).setPosition(Math.random()*600,Math.random()*400).setFill(Math.round(Math.random()*255),Math.round(Math.random()*255),Math.round(Math.random()*255));
          /*  setPosition(Math.random()*600,Math.random()*400).
            setSize(10+Math.random()*20,10+Math.random()*20).
            setFill(Math.random()*255,Math.random()*255,Math.random()*255,.1);*/
        layer.appendChild(sprite);
        
        sprite.runAction(
            new lime.animation.Spawn(
            new lime.animation.ScaleBy(1+Math.random()).setDuration(5),
            new lime.animation.RotateBy(360*Math.random()).setDuration(15)
            )
        );
    }


    // set active scene
    test.director.replaceScene(scene);
};

goog.exportSymbol('test.start', test.start);
