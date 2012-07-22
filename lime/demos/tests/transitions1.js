goog.provide('test.transitions1');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.transitions.Dissolve');

test.WIDTH = 800;
test.HEIGHT = 600;

test.start = function(){

	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var scene1 = test.createScene('#666');
		scene2 = test.createScene('#c00');

	scene1.appendChild(new lime.Label('pushScene with dissolve transition')
		.setPosition(200, 100));
	scene2.appendChild(new lime.Label('pushed scene')
		.setPosition(200, 200));
    // set active scene
    test.director.replaceScene(scene1);

    lime.scheduleManager.callAfter(function() {
	    var tran = test.director.pushScene(scene2, lime.transitions.Dissolve, 4);

	    goog.events.listen(tran,'end',function() {
            lime.scheduleManager.callAfter(function() {
	    		test.director.popScene();
	    	}, this, 1000);
        },false,this);

	}, this, 1000);
};

test.createScene = function(color) {
	var scene = new lime.Scene();
	var layer = new lime.Layer();
	var sprite = new lime.Sprite().setFill(color).setSize(test.WIDTH, test.HEIGHT);

	layer.appendChild(sprite);
	scene.appendChild(layer);

	return scene;
};