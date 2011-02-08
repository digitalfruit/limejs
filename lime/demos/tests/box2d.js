goog.provide('test.box2d');


goog.require('box2d.BodyDef');
goog.require('box2d.BoxDef');
goog.require('box2d.CircleDef');
goog.require('box2d.CircleShape');
goog.require('box2d.PolyDef');
goog.require('box2d.Vec2');


goog.require('box2d.World');
goog.require('lime');
goog.require('lime.Circle');
goog.require('lime.CoverNode');
goog.require('lime.Director');
goog.require('lime.Layer');
goog.require('lime.Scene');


test.WIDTH = 600;
test.HEIGHT = 400;


test.start = function() {

    /*

    There is no box2d integration in LimeJS yet. This file only
    shows that box2d is in correct path.

    */


	//director
	test.director = new lime.Director(document.body, test.WIDTH, test.HEIGHT);
	test.director.makeMobileWebAppCapable();

	var gamescene = new lime.Scene;

	var flameLayer = new lime.Layer;
	flameLayer.setPosition(100, 0);
	gamescene.appendChild(flameLayer);

	var quality = 1;
	var scale = 1;


    var flame = (new lime.Circle)
        .setFill(100, 0, 0)
        .setRenderer(lime.Renderer.CANVAS)
	//    .setFill(100,0,0)
	    .setSize(40, 40);
//	flame.setQuality(quality);
//	flame.setScale(flame.getScale().clone().scale(scale));

     flameLayer.appendChild(flame);

	// set active scene
	test.director.replaceScene(gamescene);


	var gravity = new box2d.Vec2(30, 30);
	var bounds = new box2d.AABB();
	bounds.minVertex.Set(0, 0);
	bounds.maxVertex.Set(test.WIDTH, test.HEIGHT);
	var world = new box2d.World(bounds, gravity, true);

	var bodyDef = new box2d.BodyDef;
	bodyDef.position.Set(0, 210);


	var circleDef = new box2d.CircleDef;
	circleDef.radius = 20;
	circleDef.density = 1.0;
	circleDef.resitution = .0;
	circleDef.friction = 0;
//	bodyDef.linearVelocity = new box2d.Vec2(-150.0,150.0);
	bodyDef.AddShape(circleDef);

	var body = world.CreateBody(bodyDef);

    var ground = new box2d.BoxDef;
	ground.resitution = .0;
	//ground.density = 1.0;
	ground.friction = 0;
	ground.extents.Set(60, 20);
//    ground.SetVertices([-30,-10],[30,-10],[30,10],[-30,10]);


    var bdef = new box2d.BodyDef;
    bdef.AddShape(ground);
    bdef.position.Set(50, 300);
    var b = world.CreateBody(bdef);

    var box = (new lime.Sprite)
        .setFill(0, 100, 0)
        .setRenderer(lime.Renderer.CANVAS)
        .setAnchorPoint(0, 1)
	    .setSize(60, 20);
    flameLayer.appendChild(box);



    lime.scheduleManager.schedule(function(dt) {
        world.Step(dt / 1000, 3);
        var pos = body.GetCenterPosition().clone();

        flame.setPosition(pos);
        var pos = b.GetOriginPosition().clone();

        box.setPosition(pos);
    },this);



};

goog.exportSymbol('test.start', test.start);
