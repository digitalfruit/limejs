goog.provide('test.events1');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();


	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer;
	gamescene.appendChild(flameLayer);


	var box = (new lime.Sprite)
	    .setRenderer(lime.Renderer.DOM)
	    .setFill('assets/nano.png')
	    .setRotation(10)
	    .setPosition(50, 50).setScale(.5);
	  //  .setSize(100,100);


	flameLayer.appendChild(box);


    var moveToPosition = function(e) {
      box.runAction(
          new lime.animation.Spawn(
              new lime.animation.MoveTo(e.position).setDuration(1),
              new lime.animation.RotateBy(40).setDuration(1),
              new lime.animation.Sequence(
                  new lime.animation.ScaleTo(2).setDuration(.5),
                  new lime.animation.ScaleTo(1).setDuration(.5)
              )
          )
        );
    };

    goog.events.listen(gamescene, 'touchstart', moveToPosition);
    goog.events.listen(gamescene, 'mousedown', moveToPosition);




	// set active scene
	test.director.replaceScene(gamescene);



};

goog.exportSymbol('test.start', test.start);
