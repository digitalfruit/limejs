goog.provide('test.anim1');

//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Template');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Loop');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

    //director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

    var menuscene = new lime.Scene;

   	var layer = (new lime.Layer).setPosition(50, 50).setAnchorPoint(0, 0);
   	menuscene.appendChild(layer);

    var template = function () {
        return '<div style="position:relative; height:50px; width:50px; float:left; background-color:blue;"></div><div style="position:relative;float:left; background-color:green;">Divs Floated Left</div>';
    };

    var templateObj = new lime.Template(template);
    templateObj.setSize(100, 100);
    templateObj.setScale(1);
    templateObj.setPosition(0, 0);
    templateObj.setAnchorPoint(0, 0);

    var anim = new lime.animation.Loop(new lime.animation.Sequence(
        new lime.animation.ScaleTo(3).setDuration(1),
        new lime.animation.ScaleTo(1).setDuration(0.5)
    ));

    templateObj.runAction(anim);

    layer.appendChild(templateObj);

    test.director.replaceScene(menuscene);


};

goog.exportSymbol('test.start', test.start);
