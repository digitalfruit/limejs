goog.provide('test.shapes1');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer;
	flameLayer.setPosition(100, 0);
	gamescene.appendChild(flameLayer);

	var quality = 1;
	var scale = 1;


        	var flame = new lime.Circle;
        	flameLayer.appendChild(flame);
        	flame.setRenderer(lime.Renderer.CANVAS);
        	flame.setFill('assets/nano.png');
        //	flame.setFill(100,0,0);
        //	flame.setRotation(90);
        //	flame.setSize(150,100);
        	flame.setPosition(50, 100);
        //	flame.setQuality(quality);
        //	flame.setScale(flame.getScale().clone().scale(scale));



        	flame = (new lime.Circle)
        	    .setFill('assets/nano.png')
        	    .setSize(100, 100)
        	    .setPosition(300, 100)
        	    .setQuality(quality)
        	    .setScale(scale);

        	var flame_x = flame.getPosition().x;

            flameLayer.appendChild(flame);


        	flame = new lime.Circle;
        	flameLayer.appendChild(flame);
        	flame.setFill('assets/nano.png');
        	flame.setPosition(new goog.math.Coordinate(50, 250));
        	flame.setQuality(quality);
        	flame.setScale(flame.getScale().clone().scale(scale));

	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
