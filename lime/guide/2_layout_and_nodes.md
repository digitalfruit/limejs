# Layout and nodes


## Resize and orientation changes

There is not much you have to do to support different screen sizes and viewport size changes in LimeJS. It's all done automatically. In the constructor of the Director(or in the *setSize* method) you define the stage size, but this doesn't need to match the actual screen size. The actual size of your game is taken from the size of the container DOM element your game is located in. If the size of the container object changes your game will resize as well to fill the container. It is important to note that although your game scales the coordinates you use in your game logic will still reflect your original stage size so you can completely ignore it while programming.


## Full screen games

The default project template initializes the Director directly inside the body element. This makes it easy to make a game that is always in full screen - something that is a must for mobile web applications. But this behavior isn't something that is required. You could very well just make a fixed size DIV element and use it as a parent container. This will then look more like a usual flash game inside HTML page. 

## Nodes

Node is the most important object in LimeJS as it's the base object for every object in the display objects tree structure. In fact even the Director, Scene and Layer classes described earlier all inherit from Node class. 

Node class defines lot of common functionality for the display objects. Note that all the setter functions return the object itself so they can be combined together in a chain. All setters also have getter counterpart. Everything is similar to the DOM element tree or Flash displayobjects tree.

	#!JavaScript
	var parent = new lime.Node();
	var child = new lime.Node();
	parent.appendChild(child);


### Size

	#!JavaScript
	var node = new lime.Node().setSize(50,50);
	
	var size = node.getSize(); // returns object
	size.width+=100;
	node.setSize(size);
	
	node.setSize(new goog.math.Size(100,50));

### Position

	#!JavaScript
	var node = new lime.Node().setPosition(200,100);
	
	var pos = node.getPosition(); // return object
	pos.y = 150;
	node.setPosition(pos);

	node.setPosition(new goog.math.Coordinate(50,50));

### Scale

Scale makes object larges by a factor. Note that the position of the element isn't changed.

	#!JavaScript
	var node = new lime.Node().setScale(1,2);
	node.setScale(.7); //scale in both axis
	node.setScale(new goog.math.Vec2(1,2));

### Rotation

Object rotation is defined in degrees.

	#!JavaScript
	var node = new lime.Node().setRotation(90);
	

### Quality

Setting object's quality value makes it render in a smaller size and then scale the whole element to its original size. In some cases this allows boost performance by loosing in quality. Note that it almost never makes sense to to set the quality value larger than 1 as if quality is already 100% it can't get any better.

	#!JavaScript
	node.setQuality(.5);

### AutoResize

AutoResize define how the objects size should change when its parent objects size changes. There are no percentage unit sizes in LimeJS but this allows you to have same result in much powerful way. Enum lime.AutoResize defines different properties that can be flexible. You pass the combination of these bitmask properties to ’setAutoResize()’ method to make the combination you need. Similar method is used in iOS UIKit framework.

	#!JavaScript
	box.setAutoResize(lime.AutoResize.WIDTH | lime.AutoResize.HEIGHT);
	
	footer.setAutoResize(lime.AutoResize.TOP);

### Anchor Points

In HTML all objects position relatively from its top left corner by default. In games this isn't always suitable. There are many object that have their most important point in some other area. Node's method ’setAnchorPoint(vec2)’ allows you to set any position as base relative point. The vector passed in should have values in 0-1 range where (0,0) means top-left and (1,1) bottom-right. By default all objects are positioned by their center. Anchor point is used when positioning the element and its children and also while rotating.

	#!JavaScript
	box.setAnchorPoint(0,0);
	
	circle.setAnchorPoint(.5,.5); //also default value

## Coordinate conversion

In some situation you may need to set one elements position relatively from another. When the objects aren't in the same layer this isn't so simple as the position properties originate from different parent. For dealing with that issue Lime provides functions to convert coordinates from one node's coordinate space to other.

	box.localToScreen(coord) - Converts local coordinate to screen coordinate.
	box.screenToLocal(coord) - Converts screen coordinate to local nodes space.
	box.localToNode(coord,node) - Converts local coordinate to any other nodes coordinate space.

