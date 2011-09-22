#FAQ

*This is a draft*

This page combines answers to some of the common problems/questions that have come up in the forums. If you can't find a solution from here post your question to to [Google Groups page](http://groups.google.com/group/limejs/topics) or [GitHub issues](https://github.com/digitalfruit/limejs/issues) page.


###Where should I start? What is the first step?

Read the *README* file. Many times if needed. If any terms confuse you type them into Google. Try to get the demos or helloworld running and continue from there.


###So I saw mention of `lime.py` in the README. Is LimeJS about writing Python code that is transformed to run in the browser?

Absolutely not! `Lime.py` is just a helper tool to speed up running some common tasks during development process. It could have been written in any language. We picked Python because Google's Closure tools are also written and Python and choosing any other language would have resulted adding extra dependency. LimeJS is pure Javascript library and developing on it does not require understanding Python. 


###I ran `init` and `create helloworld` but nothing shows up in the browser.


###While running `build` I get a cryptic error message about "namespace % already defined".


###I'm confused. Some weird files seem to be searched by lime.py. 


###Build returns empty file.


###I made a change and now I get blank screen. Help!

Debugging is just a part of development process. Get to know how your browsers' development tools work. We recommend [Webkit Development Tools](http://www.youtube.com/watch?v=N8SS-rUEZPg) but [Firebug](http://getfirebug.com) should also be a fine choice.


###I'm trying to use a new object I found from the documentation but it seems to be undefined.

Most of the classes are not included by default and you have to include them manually. Add line `goog.require('lime.some.Class')` to the beginning of your file where you need to use it.


###WTF. Undefined has no method `setScale()`?

You are creating a new shape without `new` operator before the constructor. Change the line that says `var myshape = lime.Sprite()` to `var myshape = new lime.Sprite()`.


###I found a bug/have a feature request. Where should I report it?

Best way is to post it to out [GitHub issues](https://github.com/digitalfruit/limejs/issues) page. If you don't have a GitHub account you can just post it to the [forums](http://groups.google.com/group/limejs/topics).


###I'd like to help out developing LimeJS. Where should I start?

Make an account at [GitHub](http://github.com) and fork our [repository](http://github.com/digitalfruit/limejs). Make your changes and set up a pull request. If you need ideas about what parts to work on check the to-do list in the [README](https://github.com/digitalfruit/limejs/blob/master/README.md) or look at the [forums](http://groups.google.com/group/limejs/topics) or ask us.


###Whats the deal with Box2D?

http://groups.google.com/group/limejs/browse_thread/thread/f2584b367d5439c4