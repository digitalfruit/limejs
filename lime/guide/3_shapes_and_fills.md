# Shapes and Fills


## Sprites

In previous chapter you learned about Node class. Though Node is the most important class in LimeJS you almost never create instances of Node itself. You will create Sprites. Sprite is a rectangular display object that can have visual appearance. The appearance can be added with ’setFill(fill)’ method. All of the functionality of the Node class can still be used on sprites and other shapes that inherit from it. This includes adding children sprites.

	#!JavaScript
	var redsquare = new lime.Sprite().setSize(50,50).
		setFill('#c00').setAnchorPoint(0,0);
	layer.appendChild(redsquare);

## Other common shapes

### Circle

Circle shape makes it easy to create circles or ellipses. All methods are the same as for Sprite. Note that you don't define radius for a circle but just set it's width and height.

	#!JavaScript
	var circle = new lime.Circle().setSize(40,40);
		// circle with radius 20

### RoundedRect

RoundedRect shape acts like a Sprite but you get a extra method ’setRadius(radius)’. Radius is the same corner radius property that you will find in any drawing application.

	#!JavaScript
	var shape = new lime.RoundedRect().setSize(100,40).
		setRadius(10);
		
### Label

Label is a shape what can have textual content inside. Text can be defined with ’setText(str)’ method. You can also set various font properties of a label and alignment of its text. If you don't set fixed size for the label one is calculated automatically based on the length of the text and size of the font.

	#!JavaScript
	var lbl = new lime.Label().setText('Your Score: 10').setFontFamily('Verdana').
		setFontColor('#c00').setFontSize(26).setFontWeight('bold').setSize(150,30);


### Polygon

Polygons are most abstract shapes you can create with LimeJS. You need to define the points that make up the polygon, all the rest is done for you. You can not change the anchorPoint and size properties of a polygon caused this are also taken from the point values. This flexible way allows you to create almost anything but realize that less points will mean better performance.

	#!JavaScript
	var triangle = new lime.Polygon().
		addPoints(0,-1, .5,.5, -.5,.5);


## Fills

Simply creating shapes will not show anything on the screen, it will only set up connections between them. To add some visual appearance you have to set shape's fill property with ’setFill(fill)’ method. The property passed in to *setFill* can be object that implements *lime.fill.Fill* or for some simpler fills you can just pass in the values that will be parsed through ’lime.fill.Fill.parse()’ function to automatically create the fills.   

### Colors

Color is the simplest fill you can add to your shape to have it appear in single solid color. You can pass in the values in many different forms: as a hex string, rgb(a) string or raw rgb(a) values.

	#!JavaScript
	shape.setFill(100,0,0); //dark red
	shape.setFill(0,0,0,.5); // 50% transparent gray
	
	shape.setFill('#ffffff'); //white
	shape.setFill('rgb(100,0,0)'); //same dark red as first
	
Once you have created your Color fill object you can transform its value with some built in functions. More specifically you can change color's brightness with method ’addBrightness(factor)’ and saturation with ’addSaturation(factor)’. The factor must be in -1 to +1 range.

	#!JavaScript
	var green = new lime.fill.Color(0,100,0); // neutral green
	var darker_green = green.addBrightness(-.2);
	var intensive_green = green.addSaturation(.3);


### Images

As it's name says Image fill simply allows you to set external image file as background of a shape. Image is scaled to fit the elements size.

	#!JavaScript
	sprite.setFill('assets/image.png');


### Gradients

Currently only supported gradient is *lime.fill.LinearGradient* that allows to create a background transform between colors on a single direction. Radial gradients are not supported at the moment. The angle of the gradient can be defined with method ’setDirection(x0,y0,x1,y1)’ where P(x0,y0) and P(x1,y1) define start and end positions inside 1x1 square. Colors can be defined with method ’addColorStop(offset,var_args)’ where offset must be in 0-1 range.

	#!JavaScript
	var gradient = new lime.fill.LinearGradient().
			setDirection(0,0,1,1). // 45' angle 
			addColorStop(0,100,0,0,1). // start from red color
			addColorStop(1,0,0,100,.5); // end with transparent blue
	sprite.setFill(gradient);
	


## Masks

Adding mask to a shape means that you only show some specific area of your element. In LimeJS masking is done similarly as in Flash - you create two objects and set one as a mask for the other. This means that only the intersection part is shown and all other parts are clipped away from original element. Only rectangular masks are supported at the moment. After the masks are set you can still modify all the properties of both elements.

	#!JavaScript
	var mask = new lime.Sprite().setSize(100,100).setPosition(100,100);
	parent.addChild(mask);
	var image = new lime.Sprite().setSize(300,200).setFill('assets/myimage.png');
	parent.addChild(image);
	
	image.setMask(mask);
	
	

	
