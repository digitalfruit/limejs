#Building

If you have followed along previous examples you may have looked up how the internals looked like in [Firebug](http://getfirebug.com/) or Webkit Developer Tools. What you see there in the Resources tab may have not made you happy. Even the Hello World example loads in lot of different Javascript files and their total size is huge. Not quite the way [YSlow](http://developer.yahoo.com/yslow/) or [Google Page Speed](http://code.google.com/speed/page-speed/) have told how it should be done and a nightmare to distribute.

Fortunately there is a solution named *Closure Compiler* and it was already downloaded when you first ran the init script. You should never distribute the development files(unless for open source reasons). Once you have completed your project simply run the *lime.py* helper script with *build* command. This will combine all Javascript code needed for your project into a single file. To start this file you use the same HTML file you had before with an exception that you don't need to include Closure Library's base.js any more.

The build command takes in base namespace of the code that you need to compile. This namespace needs to be defined with `goog.provide()` in the entrypoint of you projects code. With `-o` parameter you can define the path where the compiled version should be written(defaults to *stdout*).

    #!Bash
    bin/lime.py build helloworld -o helloworld/compiled/hw.js


## Advanced optimizations mode

Though default build process strips out all whitespace, replaces local variable names and does much more, the compression rate can be taken to much higher level. If you enable advanced optimizations additional optimizations like property name replacing for all variables and redundant code removal will also take place. Your final code will be much smaller, but there are some extra requirements that you must stick to if you wish to use this mode. For example you can't use property names inconsistently (with dot notation in some places and string notation in other) and must *jsdoc* the *@this* object type in static functions. More on that [here](http://code.google.com/closure/compiler/docs/api-tutorial3.html). To enable advanced optimizations you simple add `-a` to the build command.

    #!Bash
    bin/lime.py build helloworld -o helloworld/compiled/hw_adv.js -a

To further optimize the compiled version it is encouraged that you compress it with `gzip`. [Read more](http://code.google.com/speed/page-speed/docs/payload.html#GzipCompression)

### Declaring Externs

To declare Externs to be used by the Advanced Compilation, use the `-e` option in the build command. This option can be passed multiple times, in case you have multiple externs files.

    #!Bash
    bin/lime.py build helloworld -o helloworld/compiled/hw_adv.js -e helloworld/externs/some_externs.js -e helloworld/externs/more_externs.js -a

## Exports

As said before advanced optimizations mode replaces all variable names. This means there are no way to interact with you compiled code from some external code(for example onload handler in your HTML file). To deal with that you can define externs and exports from your code. Extern means that this variable/propery will not be renamed so you can fully interact with it from any external code. Export means variable will be renamed but a link to the new variable will be created with original name. In 99% of places you will only need export and save lot of space this way. 

    #!JavaScript
    goog.exportSymbol('helloworld.start', helloworld.start);



## Debugging

Sometimes you may find out that you have made a mistake following the advanced optimizations guidelines and your compiled version doesn't run any more though your development version worked fine. Common debugging techniques can't be applied here as the compressed file is completely unreadable. The solution is to compile with a `-m/--map` option. This way compiler makes a function map file that binds a compressed function to the position of the uncompressed function in original source. To use the map you have to download Closure Inspector that is a addon for Firebug. Now Firebug can show you the place in the original source where the error happened. [Read more](http://code.google.com/closure/compiler/docs/inspector.html)

    #!Bash
    bin/lime.py build helloworld -o helloworld/compiled/hw_adv.js -a -m helloworld/complied/debug_map.txt


## Preloader/Offline support

*Preloader support is currenlty very limited. Much more functionality will be added in the future.*

Having a single Javascript file makes your game easy to distribute but the Javascript file and all the assets you wish to use still need to be loaded every time the game is accessed. To make the experience better for the player you can compile your game with preloader file. This preloader file use modern browsers offline support capabilities and downloads all files you need before starting the game. Even better, next time the game is played it starts much quicker because it is loaded from users hard drive. If the game is updated, preloader will first download the updated files and then start your game. Offline access is specially important on iOS devices where it allows people to play your webapp game even when they are not connected to the internet.

You can build your game with preloader by specifying `-p` option and a callback that starts your game. This callback is the same Javascript function name that you would usually use in the onload handler of your development version.

    #!Bash
    bin/lime.py build helloworld -o helloworld/compiled/hw_adv.js -a -p helloworld.start


Here are some rules on working with [*.manifest](http://www.w3.org/TR/html5/offline.html#manifests) file the preloader build creates:

*   Manifest file needs to be served as *text/cache-manifest* from your webserver. [Tutorial](http://www.thecssninja.com/javascript/how-to-create-offline-webapps-on-the-iphone)
*   If you use your game specific assets(images etc.) you need to list them in the manifest manually
*   If you change some of the files in the manifest(without running build again) you also have to change the manifest file. Simplest is to just update the generation time.

