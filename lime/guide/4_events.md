# Events

Event management in Lime is very similar to normal events management in Closure library. You use the same methods `goog.events.listen(src, type, listener, opt_capt, opt_handler)` to listen for events and `goog.events.unlisten(src, type, listener, opt_capt, opt_handler)` to remove the listener. The target object(src) is the same Node element that you interact normally. Event types are the ones you would normally add to your DOM elements: usually *mousedown*, *mousemove* and *mouseup* for mouse events and *touchstart*, *touchmove*, *touchend* and *touchcancel* for touch events. Event types can be also specified as an array.

The idea behind Lime event management is to allow you to write all your code only once for both touch and mouse based devices. If you have tried to do this before you might know this is not so simple to achieve as it first sounds. First of all there is no one-to-one relation between mouse and touch events. Mousedown may usually mean same as touchstart but mousemove is totally different concept than touchmove. Secondly there is a implementation difference - the position of the different events is exposed differently for different events. And thirdly the touch devices usually support multitouch. This means that you can't only have handlers for specific events but you need to set next responders for specific interations. Lime tries to solve all those problems.

When you listen for an event on an element in Lime the Event object you receive in your handler function isn't the normal browser event but instance of *lime.events.Event*. The properties of this object include:

*   *position* - Coordinate for the event in target node's coordinate space
*   *screenPosition* - Coordinate for the event in screen coordinate space
*   *targetObject* - Object that fired the event
*   *event* - Normal browser event(you can call stopPropagation() on that for example)
 
These positions are the same for both mouse and touch events. All the coordinates can be transformed to different coordinate spaces with Node object's helper functions.

## event.swallow()

Event object also has `swallow(eventType,handler)` method. This allows you to interact with queue of events. You would normally use it so that you listen for a first interaction(mousdown, touchstart etc) as you normally would and then on a handler would swallow next mousemove or mouseup events. Swallow means that the handlers only get called if it is still part of the same interaction. On a multitouch capable device every individual touch has its own swallow handlers so if your touchstart had been started by one finger it never gets mixed up with movement of some other finger. When the interaction ends(touchend, mouseup) all swallowed listeners are automatically cleared.

    #!JavaScript
    goog.events.listen(ball,['mousedown','touchstart'],function(e){
        this.setFill('#c00'); // ball is colored to red when touched
        
        e.swallow(['mouseup','touchend','touchcancel'],function(){
            this.setFill('#0c0'); // ball is colored back to green when interaction ends
        }
    });

## Dragging

One common interaction is to drag elements around. Lime has made it simple for you. In the event handler simply call `event.startDrag()`. You can also provide parameters that limit the draggable area, snap to center or provide custom target object. Because the drag method uses the same `swallow()` logic as described earlier every dragging is handled separately and you can drag around multiple items same time without writing a single line of code.

    #!JavaScript
    goog.events.listen(ball,['mousedown','touchstart'],function(e){
        e.startDrag(true); // true is for snapToCenter
    });

## Non DOM elements

When you use Canvas renderer there are no DOM elements to pick up the events. While developing with raw Canvas methods this can be problem cause you only have one event target. Fortunately in Lime using different renderers doesn't affect the event system at all. You can still listen events on Nodes that don't have a DOM counterpart. 


## The Hit Test

If you have some weird custom displayobject you can override it's `hitTest()` method to give it a custom area from where it responds to events. By default all sprites respond to their bounding box(not to fill). Custom shapes check their own geometry. Layers don't have any body so they respond to all of their children.
