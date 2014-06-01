goog.provide('lime.Renderer.DOM');

goog.require('goog.dom');
goog.require('lime.Renderer');
goog.require('lime.style');
goog.require('lime.math.AffineTransform');
goog.require('lime.math.TrigTable');

/**
 * DOM renderer. This renders as div dom elements and
 * styles are added with CSS
 * @const
 * @type {lime.Renderer}
 */
lime.Renderer.DOM = new lime.Renderer();

/**
 * Update the DOM tree relations of the element.
 * @this {lime.Node}
 */
lime.Renderer.DOM.updateLayout = function() {
    var j = 0, el;
    for (var i = 0, child; child = this.children_[i]; i++) {
        el = child instanceof lime.Node ? child.rootElement : child;

        if (el == this.domElement.childNodes[j]) {
            j++;
            continue;
        }
        else {
            if (goog.dom.contains(this.containerElement, el)) {
                goog.dom.removeNode(el);
            }
            lime.Renderer.DOM.appendAt_(this.containerElement, el, j++);
            j++;
            continue;
        }
    }

   /* var lastIndex = this.containerElement.childNodes.length - 1;
    while (lastIndex >= j) {
        goog.dom.removeNode(this.containerElement.childNodes[lastIndex]);
        lastIndex--;
    }*/
};

/**
 * Calculate the size and position of the element and draw it
 * @this {lime.Node}
 */
lime.Renderer.DOM.drawSizePosition = function () {
    var size = this.getSize(),
        position = this.getPosition(),
        scale = this.getScale();

    var width = size.width;
    var height = size.height;

    var ax = this.anchorPoint_.x * width;
    var ay = this.anchorPoint_.y * height;

    var px = position.x - ax,
        py = position.y - ay;

    if (this.mask_ != this.activeMask_) {
        if (this.activeMask_) {
            lime.Renderer.DOM.removeMask.call(this);
        }

        if (this.mask_) {
            lime.Renderer.DOM.addMask.call(this);
        }
    }

    lime.style.setSize(this.domElement, width, height);

    // --- Start with the Identity
    var tx = lime.math.AffineTransform.getScaleInstance(1, 1);

    if (this.mask_) {

        lime.Renderer.DOM.calculateMaskPosition.call(this.mask_);

        tx.translate(-this.mask_.mX - ax, -this.mask_.mY - ay);

        tx.rotate(this.mask_.mRot, ax, ay);

        tx.translate(ax, ay);

    }


    // --- Begin removing of container Node

    var parentAnchorX = 0;
    var parentAnchorY = 0;

    var parent = this.getParent();

    if (parent) {
        var parentAnchor = parent.getAnchorPoint();
        var parentSize = parent.getSize();

        parentAnchorX = parentAnchor.x * parentSize.width;
        parentAnchorY = parentAnchor.y * parentSize.height;

        tx.translate(parentAnchorX, parentAnchorY);
    }


    // --- End of removing container Node


    var rotation = -this.getRotation();

    tx.translate(px, py);

    tx.translate(ax, ay);

    tx.rotate(rotation * (Math.PI / 180), 0, 0);

    tx.scale(scale.x, scale.y);

    tx.translate(-ax, -ay);

    lime.style.setAffineTransform(this.domElement, tx);

};

/**
 * Update nodes dirty values and call draw after
 * @this {lime.Node}
 */
lime.Renderer.DOM.update = function() {
    if (!this.domElement) return;

    lime.Renderer.DOM.drawSizePosition.call(this);

    if (this.getDirty() & lime.Dirty.ALPHA) {
        var opacity = this.opacity_;
        goog.style.setOpacity(this.domElement, opacity);
    }


    if (this.getDirty() & lime.Dirty.VISIBILITY) {
        this.domElement.style['display'] = this.hidden_ ? 'none' : 'block';
    }

    if (!this.maskTarget_) {
        this.renderer.draw.call(this, this.domElement);
    }
};

/**
 * Update the mask changes to reflect on the element
 * @this {lime.Node}
 */
lime.Renderer.DOM.calculateMaskPosition = function() {

    if (!goog.isDef(this.targetNode) || !this.targetNode.inTree_) return;

    var target = this.targetNode;
    //todo: replace with bounds method
    var bb = this.getFrame();
    var tl = new goog.math.Coordinate(bb.left, bb.top);
    var tr = new goog.math.Coordinate(bb.right, bb.top);
    var br = new goog.math.Coordinate(bb.right, bb.bottom);

    var targetParent = target.getParent();

    tl = this.localToNode(tl, targetParent);
    tr = this.localToNode(tr, targetParent);
    br = this.localToNode(br, targetParent);
    /*
    console.log('tl: '+tl.x+' '+tl.y);
    console.log('tr: '+tr.x+' '+tr.y);
    console.log('br: '+br.x+' '+br.y);
    */
    var rot = Math.atan2(tl.y - tr.y, tr.x - tl.x);


    var x1 = tr.x - tl.x;
    var y1 = tl.y - tr.y;

    var x2 = br.x - tr.x;
    var y2 = br.y - tr.y;

    var cos = lime.math.TrigTable.getCosineFromRadians(rot);
    var sin = lime.math.TrigTable.getSineFromRadians(rot);


    this.mWidth = Math.round(Math.sqrt(x1 * x1 + y1 * y1));
    this.mHeight = Math.round(Math.sqrt(x2 * x2 + y2 * y2));

    if (target.renderer.getType() == lime.Renderer.DOM) {
        var el = target.rootElement;

        //todo: can be optimized
        goog.style.setSize(el, this.mWidth, this.mHeight);

        var maskTransform = lime.math.AffineTransform.getScaleInstance(1, 1);

        maskTransform.translate(tl.x, tl.y);

        maskTransform.rotate(-rot, 0, 0);

        lime.style.setAffineTransform(el, maskTransform);

    }

    if (this.renderer.getType() == lime.Renderer.DOM) {
       this.domElement.style['display'] = 'none';
    }

    this.mPos = target.parentToLocal(tl.clone());

    this.mSet = true;
    this.mX = cos * tl.x - sin * tl.y;
    this.mY = cos * tl.y + sin * tl.x;
    this.mRot = rot;
/*
    target.setDirty(lime.Dirty.POSITION);
    target.update();
*/

};

/**
 * Helper function to add DOM node to the specific position
 * as a child.
 * @param {Object} p Parent DOM element.
 * @param {Object} c Child DOM element.
 * @param {number} opt_pos Position of the child.
 * @private
 */
lime.Renderer.DOM.appendAt_ = function(p, c, opt_pos) {
    if (opt_pos == undefined || p.childNodes.length <= opt_pos)
        p.appendChild(c);
    else
        p.insertBefore(c, p.childNodes[opt_pos]);
};

/**
 * Make separate container element for the childnodes
 * @this {lime.Node}
 */
lime.Renderer.DOM.makeContainer = function() {
    this.containerElement = goog.dom.createDom('div');
    var fragment = document.createDocumentFragment(),
        child;
    while ((child = this.domElement.firstChild)) {
       this.domElement.removeChild(child);
       fragment.appendChild(child);
    }
    this.containerElement.appendChild(fragment);
    this.domElement.appendChild(this.containerElement);
};

/**
 * Remove mask element relations
 * @this {lime.Node}
 */
lime.Renderer.DOM.removeMask = function() {
    if (this.domElement == this.rootElement) return;
    if (this.renderer.getType() == lime.Renderer.DOM) {
        goog.dom.removeNode(this.domElement);
        goog.dom.replaceNode(this.domElement, this.rootElement);
        this.rootElement = this.domElement;
    }
    this.activeMask_.isMask = 0;
    this.activeMask_ = null;
};

/**
 * Add mask element and make its relations
 * @this {lime.Node}
 */
lime.Renderer.DOM.addMask = function() {
    if (this.renderer.getType() == lime.Renderer.DOM) {
        this.rootElement = goog.dom.createDom('div');
        this.rootElement.style.cssText = 'position:absolute;overflow:hidden;';
        //todo: combine into css class
        lime.style.setTransformOrigin(this.rootElement,0,0);
        goog.dom.replaceNode(this.rootElement, this.domElement);
        this.rootElement.appendChild(this.domElement);
    }

    this.mask_.isMask = 1;
    this.mask_.targetNode = this;
    this.activeMask_ = this.mask_;
    this.mask_.setDirty(lime.Dirty.POSITION);
};
