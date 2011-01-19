goog.provide('lime.DirtyObject');


/**
* Dirty object (requires updates)
* @interface
*/
lime.DirtyObject = function() {};

/**
 * Method called to update all changed parameters to the screen
 */
lime.DirtyObject.prototype.update = function() {};


// Todo: This file is badly named
