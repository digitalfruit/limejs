goog.provide('test.webgl');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.MoveBy');
goog.require('lime.fill.LinearGradient');

goog.require('lime.animation.Loop');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.Sequence');
goog.require('lime.GlossyButton');

test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var scene = new lime.Scene().setRenderer(lime.Renderer.WEBGL);

	layer = new lime.Layer();
	scene.appendChild(layer);

    var numboxes = 1000;
    
    for(var i=0;i<numboxes;i++){
        
        var sprite = new lime.Sprite().
            setSize(10+Math.random()*20,10+Math.random()*20).
            setPosition(Math.random()*600,Math.random()*400).
            setFill(Math.round(Math.random()*255),
                    Math.round(Math.random()*255),
                    Math.round(Math.random()*255));
        layer.appendChild(sprite);
        
        var seq =  new lime.animation.Spawn(
            new lime.animation.ScaleBy(1+Math.random()).setDuration(7),
            new lime.animation.RotateBy(360*Math.random()).setDuration(10)
            );
        
        var anim = new lime.animation.Loop(new lime.animation.Sequence(seq,seq.reverse()));
        
        sprite.runAction(anim);
        
        
    }
    
    var button = new lime.GlossyButton('DOM').setSize(80,30).setPosition(50,360);
    scene.appendChild(button);
    goog.events.listen(button,'click',function(){scene.setRenderer(lime.Renderer.DOM)});
    
    button = new lime.GlossyButton('Canvas').setSize(80,30).setPosition(150,360);
    scene.appendChild(button);
    goog.events.listen(button,'click',function(){scene.setRenderer(lime.Renderer.CANVAS)});
    
    button = new lime.GlossyButton('WebGL').setSize(80,30).setPosition(250,360);
    scene.appendChild(button);
    goog.events.listen(button,'click',function(){scene.setRenderer(lime.Renderer.WEBGL)});
   


    // set active scene
    test.director.replaceScene(scene);
};

goog.exportSymbol('test.start', test.start);
