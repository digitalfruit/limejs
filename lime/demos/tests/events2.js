goog.provide('test.events2');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
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


	var dbg = document.getElementById('dbg');


	for (var r = 0; r < 3; r++) {
	    for (var c = 0; c < 5; c++) {

	        var box = (new lime.Sprite)
	            .setSize(80, 80)
	            .setFill(0, 150, 0);

	        box.selected = 0;

	        var box2 = (new lime.Sprite)
    	        .setSize(10, 10)
    	        .setPosition(0, -30)
    	        .setFill(150, 0, 0);

	        var bl = (new lime.Layer).setPosition(100 * c, 100 * r);

	        bl.appendChild(box);
	        bl.appendChild(box2);

	        bl.box = box;

	        layer.appendChild(bl);

	        var rotate = function(e) {
	            this.runAction(
	                new lime.animation.Spawn(
                          new lime.animation.RotateBy(25).setDuration(1),
                          new lime.animation.Sequence(
                              new lime.animation.ScaleTo(1.2).setDuration(.5),
                              new lime.animation.ScaleTo(1).setDuration(.5)
                          )
                      ));

                this.box.selected = this.box.selected ? 0 : 1;

                if (this.box.selected)
                    this.box.setFill(0, 255, 0);
                else
                    this.box.setFill(0, 150, 0);
	        }

	        goog.events.listen(bl, ['mousedown', 'touchstart'], rotate);

	    }
	}



	// set active scene
	test.director.replaceScene(gamescene);
	 var c1 = new goog.math.Coordinate(700, 400);
	c2 = box.screenToLocal(c1);


};

goog.exportSymbol('test.start', test.start);
