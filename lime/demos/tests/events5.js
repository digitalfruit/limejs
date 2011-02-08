goog.provide('test.events5');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
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


    var box = (new lime.Circle).setSize(120, 100).setFill(0, 0, 100).setAnchorPoint(0, 0.5);
    layer.appendChild(box);

    goog.events.listen(box, ['mousedown', 'touchstart'], function(e) {
        this.setFill(0, 100, 0);
        e.startDrag();
        var t = this;
        e.swallow(['mouseup', 'touchend'], function() {t.setFill(0, 0, 100)});
    });





	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
