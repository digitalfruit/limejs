goog.provide('test.anim4');


goog.require('lime');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.Circle');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Loop');
goog.require('lime.animation.Delay');



test.WIDTH = 800;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body,1024, 768);
	test.director.makeMobileWebAppCapable();

    var scene = new lime.Scene();

    var circle = new lime.Circle()
        .setSize(50, 50)
        .setFill(255, 150, 0)
        .setPosition(100, 100);

    scene.appendChild(circle);

    var moveRight = new lime.animation.MoveTo(874, 100)
        .setSpeed(1)
        .setEasing(lime.animation.Easing.LINEAR);

    var moveLeft = new lime.animation.MoveTo(100, 100)
        .setSpeed(1)
        .setEasing(lime.animation.Easing.LINEAR);

    goog.events.listen(moveRight,lime.animation.Event.STOP, function () {
        setTimeout(function () {
            circle.runAction(moveLeft);
        }, 500);
    });

    goog.events.listen(moveLeft,lime.animation.Event.STOP, function () {
        setTimeout(function () {
            circle.runAction(moveRight);
        }, 500);
    });
    
    circle.runAction(moveRight);
    
    // better solution
    
    var circle2 = new lime.Circle()
        .setSize(50, 50)
        .setFill(255, 150, 0)
        .setPosition(100, 200);

    scene.appendChild(circle2);
    
    var moveRight2 = new lime.animation.MoveTo(874, 200)
        .setDuration(774/100).setEasing(lime.animation.Easing.LINEAR).enableOptimizations();

    var moveLeft2 = new lime.animation.MoveTo(100, 200)
        .setDuration(774/100).setEasing(lime.animation.Easing.LINEAR).enableOptimizations();

    circle2.runAction(new lime.animation.Loop(
       new lime.animation.Sequence(
            moveRight2, new lime.animation.Delay().setDuration(.5),
            moveLeft2, new lime.animation.Delay().setDuration(.5)
       )
    ));
    

    // set current scene active
    test.director.replaceScene(scene);


};

goog.exportSymbol('test.start', test.start);
