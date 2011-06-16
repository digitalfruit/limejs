goog.provide('lime.Renderer');


/**
 * Renderer logic object. This object defines lower level
 * technologies that are used to draw Node instaces on screen.
 * @constructor
 */
lime.Renderer = function() {};

/**
 * Draw the object using the renderer
 */
lime.Renderer.prototype.draw = goog.nullFunction;

/**
 * Return base object of the subrenderer
 * @return {lime.Renderer} base renderer.
 */
lime.Renderer.prototype.getType = function() {
    return this.base ? this.base : this;
};

/**
 * Make and return subrenderer object.
 * @param {Object} sub Cloned empty instance.
 * @return {lime.Renderer} Subrenderer.
 */
lime.Renderer.prototype.makeSubRenderer = function(sub) {
    goog.object.extend(sub, this);
    sub.base = this.getType();
    return sub;
};
