goog.provide('lime');

goog.require('goog.style');
goog.require('lime.css');
goog.require('lime.userAgent');

(function() {

var dirtyObjectQueue = [[], []];
var dirtyObjectQueueNext = [[], []];

/**
 * Add object to Dirty objects queue (waiting for redraw)
 * @param {lime.DirtyObject} obj Object that needs to be updated.
 * @param {number=} opt_pass Pass number.
 * @param {boolean=} opt_nextframe Register for next frame.
 */
lime.setObjectDirty = function(obj, opt_pass, opt_nextframe) {
    var queue = opt_nextframe ? dirtyObjectQueueNext : dirtyObjectQueue;
    var pass = opt_pass || 0;
    goog.array.insert(queue[pass], obj);
};

/**
 * Remove object from Dirty obejcts queue
 * @param {lime.DirtyObject} obj Object that needs to be updated.
 * @param {number=} opt_pass Pass number.
 * @param {boolean=} opt_nextframe Register for next frame.
 */
lime.clearObjectDirty = function(obj, opt_pass, opt_nextframe) {
    /*
    //todo: enable and test
    var queue = opt_nextframe ? dirtyObjectQueueNext : dirtyObjectQueue;
    var pass = opt_pass || 0;
    goog.array.remove(queue[pass], obj);*/
};

/**
 * Call update on all elements waiting to be invalidated
 */
lime.updateDirtyObjects = function() {
    var ob;
    for (var i = 0; i < 2; i++) {
    while (dirtyObjectQueue[i].length) {
        ob = dirtyObjectQueue[i][0];
        ob.update(i);
        ob.dirty_ = 0;
        if (ob == dirtyObjectQueue[i][0])dirtyObjectQueue[i].shift();
    }
    dirtyObjectQueue[i] = [];
    }
    /*
    if (dirtyObjectQueue.length != 2 && !dirtyObjectQueue[0].length &&
        !dirtyObjectQueue[1].length)
    console.log(dirtyObjectQueue);
    for (var i = 0; i < 2; i++) {
        for (var j = 0; i < dirtyObjectQueue[i].length; i++) {

       }
   }*/
    //dirtyObjectQueue=dirtyObjectQueueNext;
    dirtyObjectQueueNext = [[], []];
};

})();

/**
* Enum for Dirty states.
* @enum {number}
*/
lime.Dirty = {
    POSITION: 1,
    SCALE: 2,
    CONTENT: 4,
    FONT: 8,
    ALPHA: 16,
    VISIBILITY: 32,
    LAYOUT: 64,
    ROTATION: 128,
    ALL: 7 // POSITION | SCALE
};

/**
* Enum for AutoResize values
* @enum {number}
*/
lime.AutoResize = {
    NONE: 0,
    LEFT: 1,
    WIDTH: 2,
    RIGHT: 4,
    TOP: 8,
    HEIGHT: 16,
    BOTTOM: 32,
    ALL: 63
};

/**
* Enum for Transtion properties
* @enum {number}
*/
lime.Transition = {
    POSITION: 1,
    SCALE: 2,
    SIZE: 3,
    ROTATION: 4,
    OPACITY: 5
};


goog.style.installStyles(lime.css.css(null, null));

