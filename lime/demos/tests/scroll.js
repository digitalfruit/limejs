goog.provide('test.scroll');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.LinearGradient');
goog.require('lime.ui.Scroller');



test.WIDTH = 800;
test.HEIGHT = 600;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var layer = new lime.Sprite().setAnchorPoint(0, 0);
	layer.setPosition(200, 100);
	gamescene.appendChild(layer);

	var scroll = new lime.ui.Scroller().setFill('#ccc').setAnchorPoint(0, 0.5).setSize(400, 130);
	layer.appendChild(scroll);


	// some better way to have content in a flow will be added soon
	var box = new lime.Sprite().setFill('#00c').setSize(120, 100);
    scroll.appendChild(box);
    box = new lime.Sprite().setFill('#0cc').setSize(130, 100).setPosition(200, 0);
    scroll.appendChild(box);
    box = new lime.Sprite().setFill('#0c9').setSize(160, 100).setPosition(470, 0);
    scroll.appendChild(box);
    box = new lime.Sprite().setFill('#c00').setSize(160, 100).setPosition(650, 0);
    scroll.appendChild(box);

	scroll.scrollTo(0);

	var lipsum = ('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mauris magna, bibendum tempor vulputate vel, pharetra vitae diam.').split(' ');

    var scroll2 = new lime.ui.Scroller().setFill(
        new lime.fill.LinearGradient().addColorStop(0, 100, 0, 0, .4).addColorStop(1, 100, 0, 0, .0)
        ).setAnchorPoint(0, 0)
        .setSize(170, 230).setDirection(lime.ui.Scroller.Direction.VERTICAL);

    scroll.appendChild(scroll2);

    for (var i = 0; i < lipsum.length; i++) {
        var b = new lime.Label(lipsum[i]).setFill(0, 100, 0, .2).setPosition(10, i * 40).setSize(150, 30).setAnchorPoint(0, 0).setPadding(7);
        scroll2.appendChild(b);
    }


	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
