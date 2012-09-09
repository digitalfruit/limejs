goog.provide('test.transitions1');


goog.require('lime');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.Button');
goog.require('lime.Label');
goog.require('lime.transitions.Dissolve');
goog.require('lime.transitions.SlideIn');

test.WIDTH = 800;
test.HEIGHT = 600;

test.start = function() {

    test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
    test.director.makeMobileWebAppCapable();

    var scene1 = test.createScene('#666');
    scene2 = test.createScene('#c00').setOpacity(0);

    scene1.appendChild(new lime.Label('pushScene with dissolve transition').setPosition(200, 100));
    scene2.appendChild(new lime.Label('pushed scene').setPosition(200, 50));
    // set active scene
    test.director.replaceScene(scene1);

    lime.scheduleManager.callAfter(function() {
        var tran = test.director.pushScene(scene2, lime.transitions.Dissolve, 4);

        goog.events.listenOnce(tran, 'end', function() {
            var button1 = new lime.Button().setUpState(
                (new lime.Label).setSize(200, 25).setFill('#FFFFFF').setText('CLICK ME For popScene')
                )
                .setPosition(200, 150);
            var button2 = new lime.Button().setUpState(
                (new lime.Label).setSize(250, 25).setFill('#FFFFFF').setText('CLICK ME For popScene + Transition')
                )
                .setPosition(200, 250);

            scene2.appendChild(button1);
            scene2.appendChild(button2);
            
            goog.events.listenOnce(button1, 'click', function() {
                test.director.popScene();
            }, false, this);
            
            goog.events.listenOnce(button2, 'click', function() {
                test.director.popScene(lime.transitions.SlideIn);
            }, false, this);
        }, false, this);

    }, this, 1000);
};

test.createScene = function(color) {
    var scene = new lime.Scene();
    var layer = new lime.Layer();
    var sprite = new lime.Sprite().setFill(color).setSize(test.WIDTH, test.HEIGHT);

    layer.appendChild(sprite);
    scene.appendChild(layer);

    return scene;
};
