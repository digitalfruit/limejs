goog.provide('test.events4');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();


	var gamescene = new lime.Scene;

	var layer = (new lime.Layer).setPosition(100, 100);
	gamescene.appendChild(layer);


    var box = (new lime.Sprite).setSize(100, 100).setFill(0, 0, 100);
    layer.appendChild(box);

    goog.events.listen(box, ['mousedown', 'touchstart'], function(e) {
        this.setFill(0, 100, 0);
        e.startDrag(false, new goog.math.Box(0, 10, 200, -10));
        var t = this;
        e.swallow(['mouseup', 'touchend'], function() {t.setFill(0, 0, 100)});
    });



    box = (new lime.Sprite).setSize(50, 50).setFill(100, 0, 0).setPosition(200, 50);
    layer.appendChild(box);

    goog.events.listen(box, ['mousedown', 'touchstart'], function(e) {
        e.startDrag(true, new goog.math.Box(0, 250, 100, 150));
    });



    box = (new lime.Sprite).setSize(30, 30).setFill(0, 100, 100).setPosition(100, 150);
    layer.appendChild(box);

    goog.events.listen(box, ['mousedown', 'touchstart'], function(e) {
        e.startDrag(false, new goog.math.Box(150, 250, 150, 0));
    });





	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
