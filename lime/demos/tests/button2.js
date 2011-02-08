goog.provide('test.button2');


goog.require('lime');
goog.require('lime.Button');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.GlossyButton');
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


    var btn = new lime.GlossyButton('Hello').setSize(150, 38).setRenderer(lime.Renderer.CANVAS);
    goog.events.listen(btn, 'click', function() {
        test.director.replaceScene(gamescene, lime.transitions.SlideInDown);
    });


    layer.appendChild(btn);

    var color = lime.fill.parse('#62be00');

    var f = new lime.Sprite().setSize(50, 50).setPosition(0, 200).setFill(color);
    layer.appendChild(f);

    var f = new lime.Sprite().setSize(50, 50).setPosition(60, 200).setFill(color.clone().addBrightness(.05));
    layer.appendChild(f);
    var f = new lime.Sprite().setSize(50, 50).setPosition(120, 200).setFill(color.clone().addSaturation(-.15));
    layer.appendChild(f);




     var btn2 = new lime.Button(
          (new lime.Circle).setSize(50, 50).setFill(150, 0, 0),
          (new lime.Label).setSize(50, 50).setFill(0, 100, 50).setText('B').setFontSize(20)
      ).setPosition(300, 200);
      goog.events.listen(btn2, 'click', function() {
          test.director.replaceScene(menuscene, lime.transitions.SlideInUp);
      });
      layer2.appendChild(btn2);





	// set active scene
	test.director.replaceScene(menuscene);


};

goog.exportSymbol('test.start', test.start);
