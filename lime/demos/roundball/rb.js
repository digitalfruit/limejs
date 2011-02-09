//set main namespace
goog.provide('rb');


//get requirements
goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.transitions.Dissolve');
goog.require('rb.Board');
goog.require('rb.Button');
goog.require('rb.Game');
goog.require('rb.Help');

//constant iPad size
rb.WIDTH = 720;
rb.HEIGHT = 1004;

// entrypoint
rb.start = function() {
/*

    //enable for non-seeded random. useful for debugging
    var pseudoRandom = new goog.testing.PseudoRandom(109);
    pseudoRandom.install();
    */

	rb.director = new lime.Director(document.body, rb.WIDTH, rb.HEIGHT);
	rb.director.makeMobileWebAppCapable();

	rb.loadMenu();

};

/**
 * Different modes
 * @enum {number}
 */
rb.Mode = {
    CLASSIC: 0,
    TIMED: 1
};

// load menu scene
rb.loadMenu = function() {
    var scene = new lime.Scene(),
	    layer = new lime.Layer().setPosition(rb.WIDTH / 2, 0);

	if(rb.isBrokenChrome()) layer.setRenderer(lime.Renderer.CANVAS);


	var title = new lime.Sprite().setFill('assets/main_title.png').setPosition(0, 290);
	title.qualityRenderer = true;
	layer.appendChild(title);


	var btns = new lime.Layer().setPosition(0, 430);
	layer.appendChild(btns);
	var move = new lime.animation.MoveBy(-rb.WIDTH, 0).enableOptimizations();

	var btn = rb.makeButton('Play Classic').setPosition(0, 200);
	goog.events.listen(btn, 'click', function() {
	    rb.usemode = rb.Mode.CLASSIC;
	    btns.runAction(move);
	});
	btns.appendChild(btn);

	btn = rb.makeButton('Play Timed').setPosition(0, 320);
	goog.events.listen(btn, 'click', function() {
	    rb.usemode = rb.Mode.TIMED;
	    btns.runAction(move);
	});
	btns.appendChild(btn);

	btn = rb.makeButton('Help').setPosition(0, 440);
	goog.events.listen(btn, 'click', function() {
	    rb.loadHelpScene();
	});
	btns.appendChild(btn);


    //second area that will slide in
    var btns2 = new lime.Layer().setPosition(rb.WIDTH, 0);
    btns.appendChild(btns2);

    var lbl = new lime.Label().setText('Select board size:').setFontColor('#fff').setFontSize(24).setPosition(0, 140);
    btns2.appendChild(lbl);

    btn = rb.makeButton('6x6').setPosition(0, 200);
	goog.events.listen(btn, 'click', function() {
	    rb.newgame(6);
	});
	btns2.appendChild(btn);

    btn = rb.makeButton('7x7').setPosition(0, 320);
	goog.events.listen(btn, 'click', function() {
	    rb.newgame(7);
	});
	btns2.appendChild(btn);

    btn = rb.makeButton('8x8').setPosition(0, 440);
	goog.events.listen(btn, 'click', function() {
	    rb.newgame(8);
	});
	btns2.appendChild(btn);



	scene.appendChild(layer);
	//lime logo
	rb.builtWithLime(scene);

	// set current scene active
	rb.director.replaceScene(scene, lime.transitions.Dissolve);
};

// helper for same size buttons
rb.makeButton = function(text) {
    var btn = new rb.Button(text).setSize(300, 90);
    return btn;
};

rb.isBrokenChrome = function(){
   return (/Chrome\/9\.0\.597/).test(goog.userAgent.getUserAgentString());
}

/*
rb.makeButton = function(size){

	return btn;
}*/

// load new game scene
rb.newgame = function(size) {
    var scene = new rb.Game(size);
	rb.director.replaceScene(scene, lime.transitions.Dissolve);
};

// load new help scene
rb.loadHelpScene = function() {
    var scene = new rb.Help();

	rb.builtWithLime(scene);
	rb.director.replaceScene(scene, lime.transitions.Dissolve);
};

// add lime credintials to a scene
rb.builtWithLime = function(scene) {
    var lm = new lime.Sprite().setFill('assets/lime.png');
    var txt = new lime.Label().setText('Built with').setFontColor('#fff').setFontSize(24).setPosition(290, 960);
    var btn = new lime.Button(lm).setScale(.3).setPosition(410, 960);
    goog.events.listen(btn, 'click', function() {
        window.location.href = 'http://www.limejs.com/';
    });
    scene.appendChild(txt);
    scene.appendChild(btn);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('rb.start', rb.start);
