goog.provide('test.anim2');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.Delay');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');



test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Sprite().setAnchorPoint(0, 0);
	flameLayer.setPosition(100, 0);

	// canvas rendering for no reason
	flameLayer.setRenderer(lime.Renderer.CANVAS);

	gamescene.appendChild(flameLayer);
	var quality = 4;
	var scale = 1;


        	var flame = new lime.Sprite;
        	flameLayer.appendChild(flame);
        	flame.setFill(100, 0, 0);
        	flame.setRotation(10);
        	flame.setPosition(100, 100);
        	flame.setSize(200, 200);
        //	flame.setScale(flame.getScale().clone().scale(scale));

        	   var move = new lime.animation.Sequence(
        	       new lime.animation.Spawn(
                          (new lime.animation.ScaleBy(1.5)),
                          new lime.animation.FadeTo(0.5)
                          ), new lime.animation.MoveBy(300, 300));
                    move.addTarget(flame);


        	flame = (new lime.Sprite)
        	    .setFill('assets/nano.png')
        	    .setPosition(300, 100)
        	    .setQuality(quality)

        	    .setScale(.3);

        	var flame_x = flame.getPosition().x;

            flameLayer.appendChild(flame);

        move.addTarget(flame);
        move.play();

        	flame = new lime.Sprite;
        	flameLayer.appendChild(flame);
        	flame.setFill('assets/nano.png');
        	flame.setPosition(new goog.math.Coordinate(50, 250));
        	flame.setQuality(quality).setOpacity(.6);
        	flame.setScale(flame.getScale().clone().scale(scale));


          	tex = new lime.Sprite;
            tex.setFill('assets/nano.png');
        	tex.setQuality(quality);
        	tex.setScale(flame.getScale().clone().scale(scale));
             /*
            flame = new lime.Sprite;
            flameLayer.appendChild(flame);
            flame.setFill(tex);
            flame.setPosition( new goog.math.Coordinate(300,250) );
        	flame.setQuality(quality);
        	flame.setScale(flame.getScale().clone().scale(scale));*/


	// set active scene

	test.director.replaceScene(gamescene);

	/*goog.events.listen(document.body,'mousedown',function(e){

	    console.log(e.clientX+' '+e.clientY);
	    var p = test.director.getPosition();
	    console.log(p.x+' '+p.y);
	    var p2 = test.director.screenToLocal(new goog.math.Coordinate(e.clientX,e.clientY));
	    console.log('-->'+p2.x+' '+p2.y);
	    var p3 = flameLayer.screenToLocal(new goog.math.Coordinate(e.clientX,e.clientY));
	    console.log('>>>'+p3.x+' '+p3.y);
	    var p3 = flame.screenToLocal(new goog.math.Coordinate(e.clientX,e.clientY));
	    console.log('>>>'+p3.x+' '+p3.y);
	},false);*/

};

goog.exportSymbol('test.start', test.start);
