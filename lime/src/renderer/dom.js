goog.provide('lime.Renderer.DOM');

goog.require('goog.dom');
goog.require('lime.Renderer');
goog.require('lime.style');

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
lime.Renderer.DOM.drawSizePosition = function() {
    var size = this.getSize(),
       quality = this.getQuality(),
       position = this.getPosition(),
       rquality = this.relativeQuality_ || 1,
       enable3D = this.getCSS3DTransformsAllowed();

    if (this.transitionsActive_[lime.Transition.POSITION]) {
        position = this.transitionsActive_[lime.Transition.POSITION];
    }

    var width = Math.round(size.width * rquality);
    var height = Math.round(size.height * rquality);

    var realScale = this.getScale().clone();
    if (this.transitionsActive_[lime.Transition.SCALE]) {
        realScale = this.transitionsActive_[lime.Transition.SCALE].clone();
    }
    if (width != 0) realScale.scale(size.width / (width * quality / rquality));
    else realScale.scale(1 / quality);

    lime.style.setSize(this.domElement, width, height);

    lime.style.setTransformOrigin(this.domElement,
        this.anchorPoint_.x * 100, this.anchorPoint_.y * 100, true);


    var ax = this.anchorPoint_.x * size.width * rquality;
    var ay = this.anchorPoint_.y * size.height * rquality;

    var px = position.x * rquality / quality - ax,
        py = position.y * rquality / quality - ay;

    var so = this.stroke_ ? this.stroke_.width_ : 0;

    if (((ax-so) != 0 || (ay-so) != 0) && this.domElement == this.containerElement &&
            this.children_.length) {
        lime.Renderer.DOM.makeContainer.call(this);
    }


    if (this.domElement != this.containerElement) {
        if (!this.transitionsActiveSet_[lime.Transition.POSITION] && !this.transitionsActiveSet_[lime.Transition.SCALE] && !this.transitionsActiveSet_[lime.Transition.ROTATION])
        lime.style.setTransform(this.containerElement,
                new lime.style.Transform()
                    .set3DAllowed(enable3D)
                    .translate(ax-so, ay-so));
    }

    if (this.mask_ != this.activeMask_) {
        if (this.activeMask_) {
            lime.Renderer.DOM.removeMask.call(this);
        }

        if (this.mask_) {
            lime.Renderer.DOM.addMask.call(this);
        }
    }

    var transform = new lime.style.Transform()
        .setPrecision(0.1)
        .set3DAllowed(enable3D);

    if (this.mask_) {
        lime.Renderer.DOM.calculateMaskPosition.call(this.mask_);
        transform.setPrecision(0.1)
            .translate(-this.mask_.mX - ax, -this.mask_.mY - ay)
            .rotate(this.mask_.mRot, 'rad').translate(ax, ay).setPrecision(1);
    }

    var rotation = -this.getRotation();
    if (goog.isDef(this.transitionsActive_[lime.Transition.ROTATION])) {
        rotation = -this.transitionsActive_[lime.Transition.ROTATION];
    }

    transform.translate(px, py).scale(realScale.x, realScale.y).
        rotate(rotation);

    if (!this.transitionsActiveSet_[lime.Transition.POSITION] && !this.transitionsActiveSet_[lime.Transition.SCALE] && !this.transitionsActiveSet_[lime.Transition.ROTATION]) {
       //     console.log('transform',this.transition_position_set_,this.transition_position_);
        lime.style.setTransform(this.domElement, transform);
    }

};

/**
 * Update nodes dirty values and call draw after
 * @this {lime.Node}
 */
lime.Renderer.DOM.update = function() {
    if (!this.domElement) return;

    lime.Renderer.DOM.drawSizePosition.call(this);

    if (!this.transitionsActiveSet_[lime.Transition.OPACITY]) {
        var opacity = this.opacity_;
        if (goog.isDef(this.transitionsActive_[lime.Transition.OPACITY])) {
            opacity = this.transitionsActive_[lime.Transition.OPACITY];
        }
        if (this.getDirty() & lime.Dirty.ALPHA) {
            goog.style.setOpacity(this.domElement, opacity);
        }
    }

    if (this.getDirty() & lime.Dirty.VISIBILITY) {
        this.domElement.style['display'] = this.hidden_ ? 'none' : 'block';
    }

    if(!this.maskTarget_)
    this.renderer.draw.call(this, this.domElement);

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

    var cos = Math.cos(rot);
    var sin = Math.sin(rot);


    this.mWidth = Math.round(Math.sqrt(x1 * x1 + y1 * y1));
    this.mHeight = Math.round(Math.sqrt(x2 * x2 + y2 * y2));

    if (target.renderer.getType() == lime.Renderer.DOM) {
        var el = target.rootElement;

        //todo: can be optimized
        goog.style.setSize(el, this.mWidth, this.mHeight);

        lime.style.setTransform(el, new lime.style.Transform()
            .setPrecision(0.1)
            .set3DAllowed(this.getCSS3DTransformsAllowed())
            .translate(tl.x, tl.y).rotate(-rot, 'rad'));
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
