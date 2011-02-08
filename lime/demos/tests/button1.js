goog.provide('test.button1');


goog.require('lime');
goog.require('lime.Button');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.transitions.SlideIn');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();


	var menuscene = new lime.Scene;
	var gamescene = new lime.Scene;

	var layer = (new lime.Layer).setPosition(100, 100);
	menuscene.appendChild(layer);
	var layer2 = (new lime.Layer).setPosition(100, 100);
	gamescene.appendChild(layer2);


    var btn = new lime.Button(
        (new lime.Sprite).setSize(120, 100).setFill(0, 0, 100),
        (new lime.Sprite).setSize(120, 100).setFill(0, 100, 100)
    );
    goog.events.listen(btn, 'click', function() {

        test.director.replaceScene(gamescene, lime.transitions.MoveInDown);

    });

    var btn2 = new lime.Button(
        (new lime.Sprite).setSize(220, 100).setFill(150, 0, 0),
        (new lime.Sprite).setSize(220, 100).setFill(0, 100, 50)
    ).setPosition(200, 100);
    goog.events.listen(btn2, 'click', function() {
        test.director.replaceScene(menuscene);
    });


    layer.appendChild(btn);
    layer2.appendChild(btn2);


    var btn3 = new lime.Button(
         (new lime.Label).setSize(100, 25).setFill(150, 0, 0).setText('Click me!').setFontSize(20),
         (new lime.Label).setSize(100, 25).setFill(0, 100, 50).setText('Click me!')
     ).setPosition(300, 200);
     goog.events.listen(btn3, ['down'], function(e) {
     });

     layer.appendChild(btn3);



     var btn4 = new lime.Button(
          (new lime.Circle).setSize(50, 50).setFill(150, 0, 0),
          (new lime.Label).setSize(50, 50).setFill(0, 100, 50).setText('B').setFontSize(20)
      ).setPosition(300, 200);

      layer2.appendChild(btn4);





	// set active scene
	test.director.replaceScene(menuscene);


};

goog.exportSymbol('test.start', test.start);
