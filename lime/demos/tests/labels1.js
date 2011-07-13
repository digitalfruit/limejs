goog.provide('test.labels1');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var layer = new lime.Layer;
	gamescene.appendChild(layer);


    var lbl1 = test.makeLabel().setPosition(150, 150);
    layer.appendChild(lbl1);

    var lbl2 = test.makeLabel().setPosition(350, 150).setRenderer(lime.Renderer.CANVAS);
    layer.appendChild(lbl2);


	// set active scene
	test.director.replaceScene(gamescene);


};

test.makeLabel = function() {
    var txt = 'Hello World! Houston we have a problem. Mary-Jane had a little lamb.';
    txt = 'Hello world!';
    var lbl = new lime.Label().setText(txt).setFontSize(24).setFontColor('#c00').setFill('#ccc').
        //setSize(180,120).
        setAlign('right').setPadding(10, 20).setStroke(10,'#f90').setShadow('#000',2,1,1);

    return lbl;
};

goog.exportSymbol('test.start', test.start);
