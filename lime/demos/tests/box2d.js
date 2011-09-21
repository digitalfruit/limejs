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
goog.require('lime.fill.LinearGradient');


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

	var gamescene = new lime.Scene();

	var layer = new lime.Layer;
	layer.setPosition(100, 0);
	gamescene.appendChild(layer);

	// set active scene
	test.director.replaceScene(gamescene);
/*	
    // new API proposal

	var physics = new lime.Physics(layer).setGravity(0,10);
	physics.world
	
	circle.enablePhysics(physics).setAngularDamping(.1).setDesity(.5);
	circle.enablePhysics(physics,bodyDef);
	
	circle.getPhysicsBody();
	
	var phdata = new lime.PhysicsData(lime.ASSETS.filename);
	var circle = phdata.createShape('icecream',physics).setPosition(100,0).setFill();
	

*/
	

	var gravity = new box2d.Vec2(0, 100);
	var bounds = new box2d.AABB();
	bounds.minVertex.Set(-test.WIDTH, -test.HEIGHT);
	bounds.maxVertex.Set(2*test.WIDTH,2*test.HEIGHT);
	var world = new box2d.World(bounds, gravity, false);


    var circle = (new lime.Circle)
        .setFill(new lime.fill.LinearGradient().addColorStop(0.49,200,0,0).addColorStop(.5,0,0,250))
	    .setSize(40, 40);
    layer.appendChild(circle);
	
	
	var cbodyDef = new box2d.BodyDef;
	cbodyDef.position.Set(200, 0);
    cbodyDef.angularDamping = .001;

	var circleDef = new box2d.CircleDef;
	circleDef.radius = 15;
	circleDef.density = 1;
	circleDef.restitution =.8;
	circleDef.friction = 1;
	
	cbodyDef.AddShape(circleDef);
	

	var circle_body = world.CreateBody(cbodyDef);

    var ground = new box2d.PolyDef;
	ground.restitution = .9
	ground.density = 0;
	ground.friction = 1;
//	ground.extents.Set(30, 10);//box version
    ground.SetVertices([[-30,-5],[30,-10],[30,10],[-30,10]]); // actually not a box
    
    var gbodyDef = new box2d.BodyDef;
    gbodyDef.position.Set(220, 300);
    gbodyDef.AddShape(ground);
    var ground_body = world.CreateBody(gbodyDef);

    var box = (new lime.Sprite)
        .setFill(0,100,0)
	    .setSize(60, 20);
    layer.appendChild(box);

    lime.scheduleManager.schedule(function(dt) {
        world.Step(dt / 1000, 3);
        var pos = circle_body.GetCenterPosition().clone();
        var rot = circle_body.GetRotation();
        circle.setRotation(-rot/Math.PI*180);
        circle.setPosition(pos);
        var pos = ground_body.GetCenterPosition().clone();
        box.setPosition(pos);
    },this);


};

goog.exportSymbol('test.start', test.start);