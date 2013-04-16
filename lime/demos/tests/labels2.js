goog.provide('test.labels2');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('lime.Button');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var layer = new lime.Layer();
	gamescene.appendChild(layer);

  var lbl1 = test.makeLabel().setPosition(20, 10).setRenderer(lime.Renderer.CANVAS)
      .setMultiline(true)
      .setText('One line\nsetting multiline = true\n\nthen double newline');
  layer.appendChild(lbl1);

  var lbl2 = test.makeLabel().setMultiline(false).setRenderer(lime.Renderer.CANVAS)
      .setPosition(20, 180)
      .setText('This is a label\nwith new lines but \nwith multiline flag = false');
  layer.appendChild(lbl2);


  var lbl1 = test.makeLabel().setPosition(320, 10)
      .setMultiline(true)
      .setText('One line\nsetting multiline = true\n\nthen double newline');
  layer.appendChild(lbl1);

  var lbl2 = test.makeLabel().setMultiline(false)
      .setPosition(320, 180)
      .setText('This is a label\nwith new lines but \nwith multiline flag = false');
  layer.appendChild(lbl2);


	// set active scene
	test.director.replaceScene(gamescene);


};

test.makeLabel = function() {
    var lbl = new lime.Label()
        .setSize(250, 150)
        .setFontSize(18)
        .setFontColor('#c00')
        .setFill('#ccc')
        .setAlign('left')
        .setPadding(10, 20)
        .setAnchorPoint(0, 0)
        .setMultiline(true)
        .setStroke(10,'#f90');

    return lbl;
};

goog.exportSymbol('test.start', test.start);
