//set main namespace
goog.provide('pong');


//get requirements
goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('pong.Game');

// entrypoint
pong.start = function() {

	lime.scheduleManager.setDisplayRate(1000 / 60);

	pong.director = new lime.Director(document.body, 320, 460);
	var scene = new lime.Scene(),
	    layer = new lime.Layer();


		var btn = new lime.GlossyButton('SINGLE').setSize(100, 40).setPosition(150, 100);
		goog.events.listen(btn, 'click', function() {
				pong.newgame(1);
		});
		layer.appendChild(btn);

		btn = new lime.GlossyButton('VS').setSize(100, 40).setPosition(150, 200);
		goog.events.listen(btn, 'click', function() {
			pong.newgame(2);
		});
		layer.appendChild(btn);

	scene.appendChild(layer);

	pong.director.makeMobileWebAppCapable();
	// set current scene active
	pong.director.replaceScene(scene);

};

pong.newgame = function(mode) {
	var scene = new lime.Scene(),
	layer = new lime.Layer();

	scene.appendChild(layer);

	var game = new pong.Game(mode);
	layer.appendChild(game);
	

	pong.director.replaceScene(scene);
};



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('pong.start', pong.start);
