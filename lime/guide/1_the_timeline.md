# The Timeline

## Director

It all starts from the director. Director is a base object needed for every game and connects all LimeJS logic to a single place on the webpage. If you come from flash world you can think of it as a stage, Cocos2d users see familiarities with Cocos2d-s own Director. All other can think of it just as a front controller. 

There is only one director instance for each game. It handles games global viewport and controls which scenes are visible. In the beginning of your game logic you have to create an instance of director. The parameters for the constructor method are container DOM element, stage width in pixels and height in pixels.

    #!JavaScript
    var director = new dfkit.Director(document.body,320,460);

## Scene

Scene is a independent portion of visible elements that cover all the viewport. This means that only one scene can be active at a given time. For example, in common game logic you would have menu scene, play scene and game-over scene. To make a scene visible you call `director.replaceScene(scene)` or `director.pushScene(scene)`. The difference is that *pushScene* does not remove the previous scene but keeps it in a hidden stack so it can be made visible again with `director.popScene()` call.

    #!JavaScript
    var scene = new lime.Scene();
    director.replaceScene(scene);

## Transitions

Using plain `replaceScene()` just makes a quick switch between the scenes that may not be visually appealing. To make it better you can set optional *transition* and *duration* property of your `replaceScene()` call. The transition defines the animation that happens when current scene is dismissed and new scene is activated. Currently various *Slide* and *Move* transitions are supported as well as *Dissolve* for fade-in effect.

    #!JavaScript
    director.replaceScene(menuscene,lime.transitions.SlideInRight);

    director.replaceScene(gamescene,lime.transitions.Dissolve,2);

## ScheduleManager

Everything in Lime is drawn with repaint-dirty pattern. That means that every time you change something your method calls aren't strictly related to the equivalent DOM or Canvas2dContext calls. Instead property you set is marked as dirty and will be redrawn in the next frame. This allows us to update only once, update only what is necessary and keep all updates stateless. Last criteria allows us to switch between the renderer methods any time. As there isn't any on-enter-frame event in Javascript we've made a *lime.sheduleManager* static object that simulates it. These are the methods it provides:

- schedule(callback, context) - Call a function in every frame. Context is object that represents *this*.
- unschedule(callback, context) - Clear previously scheduled function.
- scheduleWithDelay(callback, context, delay, opt_limit) - Same as *schedule* but function is only called if more than *delay* seconds has passed from last execution.
- callAfter(callback, context, delay) - Only call function once after the delay.

You should never use JavaScript built in methods `setTimeout()` and `setInterval()` directly in your game code. *lime.schduleManager* provides you with the same functionality with extra features. Your callback is called with a parameter that is the delay from the last execution of the same callback in milliseconds. This allows you to make smooth animations even if the CPU performance changes drastically.

    #!JavaScript
    var velocity = 2;
    lime.scheduleManager.schedule(function(dt){
        var position = this.getPosition();
        position.x += velocity * dt; // if dt is bigger we just move more
        this.setPosition(position); 
    },ball);


## Pausing

Using scheduleManager instead of timer functions also gives you benefit of pausing support. When you wish to pause your game you simply have to call the `setPaused(true)` on your Director object. This pauses all the scheduled functions and animations. Once you resume by calling `setPaused(false)` all your code is resumed as if nothing ever happened. While your game is in paused state instance of *lime.PauseScene* is placed as a active scene of the Director. If you wish to have some custom appearance on this state you can override this class functionality. 

	#!JavaScript
	mygame.director.setPaused(true);


## Layers

Now we are ready to add something on the screen. To better manage your display object we have introduced *lime.Layer* objects. You can think about them in a same way as Photoshop layers. Layers are there to hold stuff in. They act as any other display objects with an exception that they don't have any body or size themselves. Their only contents is their children objects. So you create them, add to the tree, position if necessary and add child objects into to them. Just to be clear, using layers is not required  - your can add any display objects to the scene. Layers just make your life easier.

    #!JavaScript
    var layer = new lime.Layer().setPosition(100,100);
    scene.appendChild(layer);
    
    for(var i=0;i<5;i++){
        var box = customMakeBoxFunc().setPosition(i*50,0);
        layer.appendChild(box);
    }

