goog.provide('lime.Scene');


goog.require('lime');
goog.require('lime.Node');

/**
 * Scene object
 * @constructor
 * @extends lime.Node
 */
lime.Scene = function() {
    lime.Node.call(this);

    this.setAnchorPoint(0, 0);

    this.domClassName = goog.getCssName('lime-scene');
    this.createDomElement();

};
goog.inherits(lime.Scene, lime.Node);

/** @inheritDoc */
lime.Scene.prototype.getScene = function() {
    return this;
};

/** @inheritDoc */
lime.Scene.prototype.measureContents = function() {
    return this.getFrame();
}