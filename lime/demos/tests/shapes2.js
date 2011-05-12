goog.provide('test.shapes2');


goog.require('lime');
goog.require('lime.Button');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.animation.MoveBy');


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


    var line = new lime.Sprite().setFill('#666').setSize(2, 300).setPosition(200, 200);
    flameLayer.appendChild(line);
    line = new lime.Sprite().setFill('#666').setSize(300, 2).setPosition(200, 200);
    flameLayer.appendChild(line);

    var dragFunc = function(e) {if(this.getStroke())this.setStroke(null);else this.setStroke(5,200,0,0,1);/*e.startDrag();*/e.event.stopPropagation()};


    var box = new lime.Sprite().setFill('#00c').setSize(60, 60).setPosition(200, 200).setAnchorPoint(0.3, 0.9);//.setRotation(30)
       // .setQuality(.5);
    goog.events.listen(box, ['mousedown', 'touchstart'], dragFunc);
    flameLayer.appendChild(box);


    var box2 = new lime.Sprite().setFill('#0c0').setSize(70, 70).setAnchorPoint(1, 1).setRotation(0).setPosition(0, 0);
    goog.events.listen(box2, ['mousedown', 'touchstart'], dragFunc);
    box.appendChild(box2);


    var box3_1 = new lime.Sprite().setFill('#600').setSize(50, 50).setAnchorPoint(0, 0).setPosition(-40, 0).setRotation(15);
    goog.events.listen(box3_1, ['mousedown', 'touchstart'], dragFunc);
    box2.appendChild(box3_1);


    var box3_2 = new lime.Sprite().setFill('#cc0').setSize(50, 50).setAnchorPoint(0.5, 0).setPosition(40, 40).setRotation(-20);
    goog.events.listen(box3_2, ['mousedown', 'touchstart'], dragFunc);
    box3_1.appendChild(box3_2);


	var makeButton = function(txt) {
	    var b = new lime.Button(
	        new lime.Label().setSize(160, 30).setText(txt).setFontSize(22).setFill('#c00').setFontColor('#fff'),
    	    new lime.Label().setSize(160, 30).setText(txt).setFontSize(22).setFill('#00c').setFontColor('#fff')
	    );
	    return b;
	}


	var blayer = new lime.Layer().setPosition(100, 340);
	gamescene.appendChild(blayer);


	var mode = lime.Renderer.DOM;
	var b1 = makeButton('Toggle Mode');
	goog.events.listen(b1, 'click', function() {
	    mode = mode == lime.Renderer.DOM ? lime.Renderer.CANVAS : lime.Renderer.DOM;
	    box2.setRenderer(mode);
    });
    blayer.appendChild(b1);


    var is_debug = false;
    var b2 = makeButton('Toggle Debug').setPosition(0, 35);
    goog.events.listen(b2, 'click', function() {
       is_debug = !is_debug;
       if (is_debug)
           this.ss = goog.style.installStyles('.lime-director div,.lime-director img,.lime-director canvas {border: 1px solid #c00;}');
       else goog.style.uninstallStyles(this.ss);
    });
    blayer.appendChild(b2);



    // set active scene
    test.director.replaceScene(gamescene);
};



goog.exportSymbol('test.start', test.start);
