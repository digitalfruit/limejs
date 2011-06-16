// Fix: bad naming. CoverNode is meaningless
goog.provide('lime.CoverNode');


goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.math.Box');
goog.require('goog.style');
goog.require('lime.Node');


/**
 * Object that covers whole viewport area and lives outside the scene.
 * @constructor
 * @extends lime.Node
 */
lime.CoverNode = function() {
    lime.Node.call(this);

    // Switch to canvas element
    var oldElement = this.baseElement;
    this.baseElement = document.createElement('canvas');
    goog.dom.replaceNode(this.baseElement, oldElement);

    /**
     * Canvas drawing context
     * @type {Object}
     */
    this.context = this.baseElement.getContext('2d');

    // add extra className
    goog.dom.classes.add(this.baseElement, goog.getCssName('lime-cover'));

};
goog.inherits(lime.CoverNode, lime.Node);


/**
 * Invalidate object size & position
 */
lime.CoverNode.prototype.update = function() {
    if (!this.director) return;

    var size = goog.style.getSize(this.director.baseElement.parentNode),
        style = this.baseElement.style,
        dscale = this.director.getScale(),
        quality = this.getQuality();

    style['width'] = size.width + 'px';
    style['height'] = size.height + 'px';

    this.baseElement.width = (size.width / dscale.x) * quality;
    this.baseElement.height = (size.height / dscale.y) * quality;

    // some action has set update area limits?
    if (this.updateRect_) {
        this.setNeedsRedrawInRect(this.updateRect_);
    }
    else {
        this.setNeedsRedraw();
    }
};

/**
 * Tell CoverNode that it needs to redraw its contents if whole viewport
 */
lime.CoverNode.prototype.setNeedsRedraw = function() {

    var box = new goog.math.Box(
        0, this.baseElement.width / this.getQuality(),
        this.baseElement.height / this.getQuality(), 0
    );
    this.setNeedsRedrawInRect(this.director.getBounds(box));

};

/**
 * Tell CoverNode that it needs to redraw its contents if
 * specific Box area
 * @param {goog.math.Box} box Box.
 */
lime.CoverNode.prototype.setNeedsRedrawInRect = function(box) {
    var dir = this.director,
        quality = this.getQuality(),
        scale = dir.getScale(),
        position = dir.getPosition();

    this.context.save();
    this.context.scale(quality, quality);
    this.context.translate(position.x / scale.x, position.y / scale.y);

    // call abstract method
    this.drawInRect(box);

    this.context.restore();
};


/**
 * Draw the contents inside given area
 * @param {goog.math.Box} box Draw area.
 */
lime.CoverNode.prototype.drawInRect = goog.abstractMethod;

