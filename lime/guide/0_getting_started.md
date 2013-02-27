# Getting started

## Installation

**Windows users:** please follow the installation guide in the README file

The dependencies required to develop with LimeJS include [Python 2.6+](http://www.python.org/), [Git](http://git-scm.com/download) and [Subversion](http://subversion.apache.org/) or Git-SVN. If you wish to use Closure Compiler then [Java](http://www.java.com/en/) is also required. Once you have your built game there are no specific requirements for the distribution server.

Download the source from [github](http://github.com/digitalfruit/limejs). The files include Javascript source files (in lime/) and one Python helper command line tool(lime.py) in bin/ directory.

Check out the features of the CLI utility by running

    #!Bash
    bin/lime.py --help
    
You will see the utility can handle initial setup, dependency updating, project creation, template generations and project building.

Start by running inital setup: 

    #!Bash
    bin/lime.py init
    
This will download [Closure Library](http://code.google.com/closure/library/), [Box2D physics library](http://box2d.thinkpixellab.com/), [Closure Compiler](http://code.google.com/closure/compiler/) & [Templates](http://code.google.com/closure/templates/) and set them all up so they are ready for being used.

You're done! Create a simple helloworld project by running 
    
    #!Bash
    bin/lime.py create helloworld

Open helloworld/helloworld.html in the browser and enjoy your accomplishment.


## Common Closure


LimeJS is built with Closure Library. Closure is JavaScript library built by Google, it has been used to develop lot of Google's great products like Gmail or Docs. It is highly maintainable and readable, fast and feature rich. It also integrates well with other Closure tools like Compiler and Templates.

### Namespaces

One of Closure's the most noticeable features is its namespacing system. Unlike some other libraries all the code is separated between files. Every file provides names for its code and can request some other files being present. While developing you only have to include *base.js* file that gives you new functions `goog.provide(namespace)` and `goog.require(namespace)`. Provide function declares that all code in the file can be requested with that name. Require function requests another file with that name. The whole system is analogues with any other language that has namespaces built in (Java, ActionScript, Python) with an exception that the name does not need to specify correct folder structure but can be completely arbitrary. Closure uses its built in *deps.js* file to map the namespaces to file paths. This means that if you add new namespaces you have to run 

    #!Bash
    python bin/lime.py update

to update the *deps.js* so your new file can be accessed.

It is not required that you use `goog.provide()` for your own project files but its highly encouraged. Using this will also get you much better results when you are ready to compile your game.


### Inheritance

Working with LimeJS one of the common actions is to make your custom subclass of a builtin class. Using this you can add your custom game specific methods to common objects. This is an example of a *lime.Circle*'s subclass *mygame.Ball*.

	#!JavaScript
	// make file loadable from other files
	goog.provide('mygame.Ball'); 
	
	// request that lime.Circle's definitions are loaded
	goog.require('lime.Circle'); 
	
	// new constructor
	mygame.Ball = function(){
	    // call parents constructor 
		goog.base(this);
		
		// custom initialization code
		this.color_ = 'red';
	}
	// define parent class
	goog.inherits(mygame.Ball,lime.Circle); 
	
	// new custom method for ball instances
	mygame.Ball.prototype.myMethod = function(){	
	}
	

### Events

Closure provides you functions for listening and unlistening events for objects. You add an event listener with function `goog.events.listen(src, type, listener, opt_capture, opt_handler)`. Src is the target object dispatching the event, type is the event name(for example mousedown). Listener is callback function that is called when event fires. You can also make the event fire in capture phase and define custom context object for callback function. Removing event listener uses same kind of function named `goog.events.unlisten()` with all the same parameters.

If you wish to dispatch events from your custom object you have to make them subclass of *goog.events.EventTarget* and then call the objects `dispatchEvent()` method.


*There is much more you could know about Closure Library, check out the [docs](http://closure-library.googlecode.com/svn/docs/index.html), [book](http://www.amazon.com/Closure-Definitive-Guide-Michael-Bolin/dp/1449381871) or [video](http://www.youtube.com/watch?v=yp_9q3tgDnQ) for more information.*
