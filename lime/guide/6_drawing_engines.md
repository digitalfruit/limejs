# Drawing engine

One of the most important features of LimeJS is its different rendering engines support. It is wrong to call LimeJS a Canvas game framework as Canvas is only one of the lower level technologies supported. The lower level methods that have ability to draw to screen are gathered into namespace *lime.Renderer*. Different renderers can be switched on any Node with ÕsetRenderer(renderer)Õ method in any time. Currently supported renderers in LimeJS are *lime.Renderer.DOM* and *lime.Renderer.CANVAS*.

## Why many renderers are required?

Maybe your first intention is that Canvas is so cool and everything could be done with that. In some day we will maybe get to that but we're not there at the moment at least. Canvas is great and allows you to do almost anything but due to it's bitmap type nature can't be suitable for everything. You may have seen SVG vs Canvas charts about when to use which, same could be done about DOM vs Canvas. Also there isn't currently a stable browser that has hardware accelerated Canvas implementation. In mobile devices this is a must because mobile CPU-s aren't so speedy as your PC may be.

There are lot of innovative technologies in HTML5 and Canvas is only one of them. Rounded corners, transforms, transitions and gradients are some of the cool thing HTML5 adds to DOM. Every device/browser has a bit different implementation(performance wise and sometimes API-wise). This is actually a good thing as it helps the web move forward faster and doesn't limit us to some fixed stack. But it isn't something you want to worry about when you want to develop your game for many devices and the deadline is approaching. For example current iOS version 4.2 has very slow implementation of the Canvas element, instead it has GPU accelerated CSS transforms. On the other hand current non-beta PC browsers don't have hardware accelerated CSS transforms, but because they have fast CPU-s they can draw to Canvas pretty quickly. Because CSS transforms and Canvas are very different technologies you would practically have to make two games if you would want to support both. Luckily you have LimeJS that lets you do this with one line. 

## lime.Renderer.DOM

DOM renderer renders the nodes it draws as DIV elements and changes their CSS properties to make them look like wanted from the script. DOM renderer is default renderer for all elements that support it.

You should usually use DOM renderer when:

- On iOS
- The node tree is relatively simple and not deep
- Your element changes/animates often
- Your element takes big part of the screen

Instances on Director and Scene always use DOM renderer and can't be switched to Canvas.

## lime.Renderer.CANVAS

Canvas renderer makes a single Canvas element and draw into its 2D context with Canvas drawing methods. If element has children they will be drawn to the same Canvas. If any element changes whole Canvas will be redrawn in the next frame. You can't add pure DOM elements as children of a Node if it is being drawn with Canvas renderer.

You should usually use Canvas renderer when:

- You have a peace of tree that is relatively static
- DOM renderer result doesn't satisfy you
- You can see groups of elements that usually change together
- You are on machine with fast CPU or browser that has hardware accelerated Canvas implementation.
- If you use IE9 beta (no CSS transforms there yet)

Polygon shapes are always drawn with Canvas renderer as there isn't any way to make them with CSS.


## Future compatibility

There is one more thing why this method is important. Web is moving in rapid speed and there is no way to see what will happen in even couple of years. There will probably be even better technologies then available. By hiding away this layer we can implement them as soon as they arrive. The game developer doesn't need to change anything and users who still use older browsers/devices can use the old version.

We have already decided that there will be a WebGL renderer in the future. It will be pretty similar to the Canvas implementation but things will be drawn to WebGL graphics context. All the hard shaders stuff will be hidden away from you. You only need to call the ÕsetRenderer()Õ method for your current element. As the development is open for everyone someone else could very well make a SVG renderer or even VML if there is a need for that.

  

