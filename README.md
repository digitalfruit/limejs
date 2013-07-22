#LimeJS

##Getting started:

###Mac OS X and Linux users:

- Requirements: Python 2.6+, Git
- Clone the git repo (you have probably already done that):
    git clone git://github.com/digitalfruit/limejs.git
- bin/lime.py --help
- bin/lime.py init
- bin/lime.py create helloworld

-----

- open ./helloworld/helloworld.html in the browser
- study/tweak the source

-----


- programming guide is at lime/guide/ or <http://www.limejs.com/>
- demos are available at lime/demos/
- unit tests are at lime/tests/
- documentation is at <http://limejs.digitalfruit.ee/docs/>


###Windows users:

If you consider yourself advanced user and know how to use Git/Python you are probably better off reading through Mac/Linux guide and choosing your best alternative tools/methods yourself. If not then follow this step-by-step route.

1.  Download and install Git bash from <http://git-scm.com/download/win> (if not already installed). While installing select "Use Git Bash only" and Unix style line endings.
2.  Clone lime git repo or download zip package from <https://github.com/digitalfruit/limejs/archive/master.zip>
3.  Extract the contents to suitable place on your hard drive. Next examples will use c:\ as the base path.
4.  If you don't have python download and install it from <http://www.python.org/download/>. Python3 should work fine but 2.7.x is recommended.
5.  Launch Git Bash
6.  Check if you have python installed on your global path by running:
     python --version
    
    If this returned error you have to add it to your global path or use full path to binaries in next steps.

    To add python to your global path run:
    
    `echo "export PATH=$PATH:/c/Python27/" >> ~/.bashrc`
    
    This is the longer version if you use Command Prompt instead of Git bash:
    
    1. Open Control Panel -> System and Security -> System -> Advanced system settings
    2. Under Advanced tab select Environment Variables...
    3. Under system variables find variable named Path.
    4. Select it and click Edit.
    5. Append semicolon and path to the folder you installed python to the value.
        For example ";C:\Python27\"
    6. Press OK and OK
    7. Restart Command Prompt
    8. Try if it works now

7.  Move to lime base folder
    cd c:\lime
    
8.  python bin/lime.py --help
9.  In similar pattern continue from Mac/Linux tutorial from step 3




##Browser support:

- *Current:* Chrome, Safari 5, Firefox 3.6+, Opera, IE9, Mobile Safari
- *Soon:* Android, Blackberry Playbook
- *Maybe:* WebOS



##Links:

Closure Library: <https://developers.google.com/closure/library/>

Closure Compiler: <https://developers.google.com/closure/compiler/>

Closure Templates: <https://developers.google.com/closure/templates/>

Box2D: <http://www.box2dflash.org/docs/2.0.2/reference/>

Canvas 2D API spec: <http://dev.w3.org/html5/2dcontext/>

WebGL spec: <http://www.khronos.org/registry/webgl/specs/latest/>

Closure book: <http://www.amazon.com/Closure-Definitive-Guide-Michael-Bolin/dp/1449381871/>
<http://books.google.com/books?id=p7uyWPcVGZsC&&pg=PP1>

Closure video from Google I/O 2010:
<http://www.youtube.com/watch?v=yp_9q3tgDnQ>



### Known issues:

- lime.py build problems when directories contain spaces
- ...add your issues to the github page


### Browser issues:

- Firefox 4 animation flickery <https://bugzilla.mozilla.org/show_bug.cgi?id=637597>
- IE10, Opera 11 don't use CSS gradients but fallback to Canvas.
- WebOS 1.4 Masking issue(appears on Roundball)


### Missing/broken:

- Custom WebGL context
- Sprite fill
- Web-app installing tutorial
- Unit tests(partial)
- Some basic fallback for non supported browsers


### Future:

- Strokes
- More shapes
- Box2D basic integration
- Different shape masks
- More transitions
- Better audio support
- Local cache support
- Other mobile platforms support(Android,WebOS,Playbook)
- Data support(endtable?)
- Radial Gradients
- Resources loading
- Preloader
- WebGL Renderer
- Dev console
- Tiles
- Scrollers
- Menus
- UI controls
- Video support
- Markup with templates
- Integration with MoRe





