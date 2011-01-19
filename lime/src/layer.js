goog.provide('lime.Layer');


goog.require('lime');
goog.require('lime.Node');

/**
 * Layer object. This object has no visible body itself but
 * acts as a container for other objects. Setting position/scale etc
 * changes position/scale of all of its children
 * @constructor
 * @extends lime.Node
 */
lime.Layer = function() {
    lime.Node.call(this);

    this.domClassName = goog.getCssName('lime-layer');
};
goog.inherits(lime.Layer, lime.Node);


/**
 * @inheritDoc
 */
lime.Layer.prototype.hitTest = function(e) {
    //Layers hittest returns true if ony of its childrens hittest returns true

    //todo: this can be optimized
    for (var i = 0, child; child = this.children_[i]; i++) {

            if (child.hitTest(e)) {
                e.position = this.screenToLocal(e.screenPosition);
                return true;
            }

    }

    return false;

};

