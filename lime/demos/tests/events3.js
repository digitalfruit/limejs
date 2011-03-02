goog.provide('test.events3');


goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.ColorTo');
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



	for (var r = 0; r < 3; r++) {
	    for (var c = 0; c < 5; c++) {

	        var box = (new lime.Circle)
	            .setSize(80, 80)
	            .setFill(0, 150, 0);

	        box.selected = 0;

	        var box2 = (new lime.Sprite)
    	        .setSize(10, 30)
    	        .setPosition(0, -15)
    	        .setFill(150, 0, 0);

	        var bl = (new lime.Layer).setPosition(100 * c, 100 * r).setRenderer(lime.Renderer.CANVAS);

	        bl.appendChild(box);
	        bl.appendChild(box2);

	        bl.box = box;

	        layer.appendChild(bl);

	        var select = function(e) {
	            this.runAction(new lime.animation.ScaleTo(1.5).setDuration(.7));

                this.box.normalColor_ = this.box.getFill();
                this.box.runAction(new lime.animation.ColorTo(this.box.normalColor_.clone().addBrightness(.3).addSaturation(-.3)).setDuration(.5));
                this.getParent().setChildIndex(this,this.getParent().getNumberOfChildren()-1);

                e.swallow(['touchmove', 'mousemove'], function(e) {

                    this.setPosition(this.localToNode(e.position, layer));

                });

                e.swallow(['touchend', 'touchcancel', 'mouseup'], function(e) {

                    this.runAction(new lime.animation.ScaleTo(1));
                    this.box.runAction(new lime.animation.ColorTo(this.box.normalColor_).setDuration(.5));
                    //this.box.setFill(0,150,0);

                });
                
                e.event.stopPropagation();

	        }

	        goog.events.listen(bl, ['mousedown', 'touchstart'], select);

	    }
	}



	// set active scene
	test.director.replaceScene(gamescene);


};

goog.exportSymbol('test.start', test.start);
