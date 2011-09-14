goog.provide('test.box2d_2');

goog.require('box2d.BodyDef');
goog.require('box2d.BoxDef');
goog.require('box2d.CircleDef');
goog.require('box2d.CircleShape');
goog.require('box2d.PolyDef');
goog.require('box2d.Vec2');
goog.require('box2d.JointDef');
goog.require('box2d.MouseJointDef');
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
	
	var gravity = new box2d.Vec2(0, 200);
	var bounds = new box2d.AABB();
	bounds.minVertex.Set(-test.WIDTH, -test.HEIGHT);
	bounds.maxVertex.Set(2*test.WIDTH,2*test.HEIGHT);
	var world = new box2d.World(bounds, gravity, false);

    function createCircle(radius, x, y){
        var circle = (new lime.Circle)
            .setFill(new lime.fill.LinearGradient().addColorStop(0.49,200,0,0).addColorStop(.5,0,0,250))
    	    .setSize(radius*2, radius*2);
        layer.appendChild(circle);
        
        var bodyDef = new box2d.BodyDef;
    	bodyDef.position.Set(x, y);
        bodyDef.angularDamping = .001;

    	var shapeDef = new box2d.CircleDef;
    	shapeDef.radius = circle.getSize().width/2;
    	shapeDef.density = 5;
    	shapeDef.restitution =.5;
    	shapeDef.friction = 1;
    	bodyDef.AddShape(shapeDef);
    	
    	var body = world.CreateBody(bodyDef);
    	circle._body = body; // just a reference, no API logic
    	return circle;
    }

    function createBox(x, y, width, height, rotation){
        var box = (new lime.Sprite).setFill(0,100,0).setSize(width, height);
        layer.appendChild(box);
        
        var bodyDef = new box2d.BodyDef;
        bodyDef.position.Set(x, y);
    	bodyDef.rotation = -rotation / 180 * Math.PI;
        
        var shapeDef = new box2d.BoxDef;
       	shapeDef.restitution = .9
       	shapeDef.density = 0; // static
       	shapeDef.friction = 1;
       	shapeDef.extents.Set(width / 2, height / 2);
       	
        bodyDef.AddShape(shapeDef);
       	
       	var body = world.CreateBody(bodyDef);
       	box._body = body; // just a reference
       	return box;
    }
    
    function makeDraggable(shape){ // only use for physics based dragging
        goog.events.listen(shape, ['mousedown', 'touchstart'], function(e){
            var pos = this.localToParent(e.position); //need parent coordinate system
            
            var mouseJointDef = new box2d.MouseJointDef(); 
            mouseJointDef.body1 = world.GetGroundBody(); 
            mouseJointDef.body2 = shape._body; // using ref created above 
            mouseJointDef.target.Set(pos.x, pos.y); 
            mouseJointDef.maxForce = 5000 * shape._body.m_mass; 
            //mouseJointDef.collideConnected = true; 
            //mouseJointDef.dampingRatio = 0; 
            
            var mouseJoint = world.CreateJoint(mouseJointDef); 
            
            e.swallow(['mouseup', 'touchend'], function(e){
                world.DestroyJoint(mouseJoint); 
            });
            e.swallow(['mousemove', 'touchmove'], function(e){
                var pos = this.localToParent(e.position);
                mouseJoint.SetTarget(new box2d.Vec2(pos.x, pos.y));
            });
            
        })
    }
    
    function updateFromBody(shape){
        var pos = shape._body.GetCenterPosition();
        var rot = shape._body.GetRotation();
        shape.setRotation(-rot / Math.PI * 180);
        shape.setPosition(pos);
    }
    
    var circle1 = createCircle(30, 200, 50),
        circle2 = createCircle(30, 300, 0),
        box1 = createBox(220,300, 300,20, 2),
        box2 = createBox(0,120, 400,20, 280).setFill('#ccc'),
        box3 = createBox(400,50, 400,20, 80).setFill('#ccc');
    
    makeDraggable(circle1);
    makeDraggable(circle2);


    lime.scheduleManager.schedule(function(dt) {
        if(dt>100) dt=100; // long delays(after pause) cause false collisions
        world.Step(dt / 1000, 3);
        
        updateFromBody(circle1);
        updateFromBody(circle2);
        updateFromBody(box1);
        updateFromBody(box2);
        updateFromBody(box3);
        
    },this);


};

goog.exportSymbol('test.start', test.start);
