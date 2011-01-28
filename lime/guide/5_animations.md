# Animations

Animations provide a way to change elements properties over time. Typical uses are making object larger or changing its position in a way it looks natural for the user. To make an animation you make an animation object and then run it on target. Don't forget that you have to include the animation using `goog.require()`, as no animations are loaded automatically. By default all animations run for 1 second, you can change it with `setDuration()` method.

    #!JavaScript
    var fadehalf = new lime.animation.FadeTo(.5).setDuration(2);
    ball.runAction(fadehalf);

Different types of animations supported:

-   *MoveBy* - move object by offset from current location.
-   *MoveTo* - move object to specific location.
-   *ScaleBy* - scale objects dimensions by a factor. Passing 2 makes object 2 times bigger from its current size.
-   *ScaleTo* - scale objects dimensions to a given factor.
-   *RotateBy* - rotate object by a given angle
-   *RotateTo* - rotate object to a specific angle
-   *ColorTo* - change objects color from current color to another.
-   *FadeTo* - fade elements opacity to a given value.

If you wish know when an animation has ended you can listen for its *stop* event. Event name is also defined as constant `lime.animation.Event.STOP`.

    #!Javascript
    var moveleft = new lime.animation.MoveBy(-100,0);
    ball.runAction(moveleft);
    goog.events.listen(moveleft,lime.animation.Event.STOP,function(){
        alert('Ball has finished moving');
    })


## Multiple targets

There is also possibility to run a single animation on multiple targets. For that you create animation instance, then add targets to this instance and finally call the `play()` method.

    #!JavaScript
    var doublesize = new lime.animation.ScaleBy(2);
    doublesize.addTarget(ball);
    doublesize.addTarget(square);
    doublesize.play();


## Sequence, Spawn and Loop

Sequence, Spawn and Loop are animations that combine other animations to make a new effect. Sequence takes in unlimited amount of animations and runs them in a queue one after another. Spawn is similar but all the subanimations run together in same time. Loop is used if you wish the animation to restart itself after it has finished.

    #!Javascript
    var zoomout = new lime.animation.Spawn(
        new lime.animation.ScaleTo(5),
        new lime.animation.FadeTo(0)
        );
        
    var keepturning = new lime.animation.Loop(
        new lime.animation.RotateBy(90)
        );


## Precompiled CSS3 animations

Making animations as described earlier results in Javascript animations. This means the way the effect is created is by changing objects properties with Javascript on timer intervals. Some modern browsers also support different kind of effects called CSS3 transitions. These events may run smoother as they are hardware accelerated in some platforms(iOS). To enable this accelerated support in LimeJS you have to run the animations `enableOptimizations()` method. This makes the animation run smoother on iOS devices and possibly use less CPU resources.

    #!Javascript
    ball.runAction(new lime.animation.MoveBy(100,0).enableOptimizations());

The downside is that `enableOptimizations()` does not always work. This is also the reason why you specifically have to say you wish the animation to use this feature. The CSS3 transitions API isn't so flexible that it could handle all possible scenarios.

Things that are not currently supported when `enableOptimizations()` is turned on:

- You can't combine move,scale and rotate animations in a way that their timings overlap but aren't the same. You can still use them together in a Sequence and you can use them together in a Spawn if their durations match.
- You can't combine position,scale and size in a way that one of the parameters is being changed manually while another is animating.


## Easing

Easing defines the characteristics how the time is changing when the animation is running. It provides more natural motion as it doesn't change the properties in fixed intervals. This makes an object slow down and speed up. All Lime animations have easing ease-in-out by default. This means that object will first speed up and then slow down when it reaches its destination. You define the easing function with `setEasing()` method. Built in values thath you can use include:

-   lime.animation.Easing.EASE
-   lime.animation.Easing.LINEAR
-   lime.animation.Easing.EASEIN
-   lime.animation.Easing.EASEOUT
-   lime.animation.Easing.EASEINOUT

You can also provide custom function made of points of cubic bezier curve.



*Lime animations do not use or rely on goog.fx.\* libraries. These are common functions for making animations in Closure Library but don't quite fit in with LimeJS logic. This may change in the future but not very likely.*