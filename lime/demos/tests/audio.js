goog.provide('test.audio');


goog.require('lime');
goog.require('lime.Button');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Label');

goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.Loop');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.audio.Audio');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();


	var menuscene = new lime.Scene;

	var layer = (new lime.Layer).setPosition(100, 100);
	menuscene.appendChild(layer);


	var sprite = new lime.Sprite().setFill('#0c0').setSize(50, 50);
	layer.appendChild(sprite);
    var sprite2 = new lime.Sprite().setFill('#00c').setSize(50, 50).setPosition(70, 0);
	layer.appendChild(sprite2);

	// set active scene
	test.director.replaceScene(menuscene);

	var tromboon = new lime.audio.Audio('assets/tromboon_sample.mp3');

	goog.events.listen(sprite, ['mousedown', 'touchstart'], function() {
	    tromboon.play();
	});

	goog.events.listen(sprite2, ['mousedown', 'touchstart'], function() {
	    tromboon.stop();
	});


};

goog.exportSymbol('test.start', test.start);
