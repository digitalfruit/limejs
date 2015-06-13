goog.provide('lime.Renderer.CANVAS');

goog.require('goog.math.Box.size');
goog.require('goog.math.Size.scaleVec2');
goog.require('lime.Renderer');

/**
* Canvas renderer. This renders as canvas element or just
* draws on parent context.
* @const
* @type {lime.Renderer}
*/
lime.Renderer.CANVAS = new lime.Renderer();

/**
* Update the DOM tree relations of the element.
* @this {lime.Node}
*/
lime.Renderer.CANVAS.updateLayout = function() {};

/**
* Initalize canvas element and start the drawing process
* @this {lime.Node}
*/
lime.Renderer.CANVAS.drawCanvas = function() {
    var bounds = this.measureContents(),
        sizediff,
        PADDING = 12;


    if (!this.domElement) return;

    var context = this.domElement.getContext('2d');

    if (this.boundsCache && this.boundsCache.contains(bounds) &&
        (sizediff = this.boundsCache.size().area() / bounds.size().area()) &&
        sizediff < 1.6 && sizediff > 0.5) {
        //use the cached canvas size
        bounds = this.boundsCache;
    }
    else {
        if (this.staticCanvas != 1 && this.children_.length != 0) {
           if(!(this instanceof lime.Scene)){
               bounds.expand(PADDING, PADDING, PADDING, PADDING);
           }
        }
    }


    //clip to director
    /* var dir = this.getDirector();
    if (this.rotation_ == 0 && dir) {
    var fr = dir.getFrame();
    var br = dir.localToNode(
    new goog.math.Coordinate(fr.right, fr.bottom), this);
    var tl = dir.localToNode(
    new goog.math.Coordinate(fr.left, fr.top), this);
    if (br.x < bounds.right) {
    bounds.right = br.x;
    }
    if (br.y < bounds.bottom) {
    bounds.bottom = br.y;
    }
    if (tl.x > bounds.left) {
    bounds.left = tl.x;
    }
    if (tl.y > bounds.top) {
    bounds.top = tl.y;
    }
    }*/

    this.boundsCache = bounds; //save for later use

    var bsize = bounds.size(),
        pxsize = bsize.clone().ceil(),
        width = this.domElement.width,
        height = this.domElement.height;

    if (this.pixelRatio) {
        width /= this.pixelRatio;
        height /= this.pixelRatio;
    }

    if (width != pxsize.width || height != pxsize.height) {

        // High DPI canvas support: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
        var ratio = (goog.global['devicePixelRatio'] || 1) / (context.webkitBackingStorePixelRatio || 1);

        if (ratio !== 1) {
            this.domElement.width = pxsize.width * ratio;
            this.domElement.height = pxsize.height * ratio;
            this.domElement.style.width = pxsize.width + 'px';
            this.domElement.style.height = pxsize.height + 'px';
            context.scale(ratio, ratio);
            this.pixelRatio = ratio;
        } else {
            this.domElement.width = pxsize.width;
            this.domElement.height = pxsize.height;
        }

        this.redraw_ = 1;
    }



        var realScale = this.getScale().clone();
        if (this.transitionsActive_[lime.Transition.SCALE]) {
            realScale = this.transitionsActive_[lime.Transition.SCALE];
            //this.redraw_ = 1;
        }
        if (pxsize.width != 0) {
            realScale.scale(bsize.width / pxsize.width);
        }


        var fr = this.getFrame();
        this.ax = (fr.left - bounds.left);
        this.ay = (fr.top - bounds.top);

        var ap_offset = this.getSize().clone().
        scaleVec2(this.getAnchorPoint());

        var pos = this.getPosition().clone();

        if (this.transitionsActive_[lime.Transition.POSITION]) {
            pos = this.transitionsActive_[lime.Transition.POSITION];
            //this.redraw_ = 1;
        }

        pos.x -= ap_offset.width + this.ax;
        pos.y -= ap_offset.height + this.ay;

        lime.style.setTransformOrigin(this.domElement,
            (this.ax + ap_offset.width) / pxsize.width * 100,
            (this.ay + ap_offset.height) / pxsize.height * 100, true);

        if (!this.transitionsActiveSet_[lime.Transition.POSITION] && !this.transitionsActiveSet_[lime.Transition.SCALE] && !this.transitionsActiveSet_[lime.Transition.ROTATION]) {

            var rotation = -this.getRotation();
            if (goog.isDef(this.transitionsActive_[lime.Transition.ROTATION])) {
                rotation = -this.transitionsActive_[lime.Transition.ROTATION];
            }
            lime.style.setTransform(this.domElement,
                new lime.style.Transform().setPrecision(.1).translate(pos.x, pos.y).
                rotate(rotation).scale(realScale.x, realScale.y));
        }

        if (this.redraw_) {
            context.clearRect(0, 0, pxsize.width, pxsize.height);
            context.save();
            context.translate(this.ax, this.ay);

            var size = this.getSize(), anchor = this.getAnchorPoint();

            context.translate(size.width * anchor.x, size.height * anchor.y);

            this.renderer.drawCanvasObject.call(this, context);

            context.restore();
            this.redraw_ = 0;


        }
    };

/**
* Update nodes dirty values and call draw after
* @this {lime.Node}
*/
lime.Renderer.CANVAS.update = function() {
};


/**
* Draw single object to the canvas context
* @param {Object} context Canvas2DContext where to draw.
* @this {lime.Node}
*/
lime.Renderer.CANVAS.drawCanvasObject = function(context) {

    if(!this.inTree_) return;

    if (this.mask_ != this.activeMask_) {
        if (this.activeMask_) {
            lime.Renderer.DOM.removeMask.call(this);
        }

        if (this.mask_) {
            lime.Renderer.DOM.addMask.call(this);
        }
    }

    // if element is mask the only update mask prop and return
    if (this.maskTarget_) {
        return;
    }

    if (this.hidden_ || this.opacity_ == 0 || this.isMask == 1) {
        return;
    }

    if (this.opacity_ != 1) {
        context.globalAlpha *= this.opacity_;
    }

    if (this.mask_) {
        lime.Renderer.DOM.calculateMaskPosition.call(this.mask_);
        var m = this.activeMask_, scale = this.scale_;
        context.save();
        context.save();
        context.translate(m.mPos.x, m.mPos.y);
        context.rotate(-m.mRot);
        if (this.needsDomElement) {
            context.rotate(this.getRotation() * Math.PI / 180);
        }
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(m.mWidth/scale.x, 0);
        context.lineTo(m.mWidth/scale.x, m.mHeight/scale.y);
        context.lineTo(0, m.mHeight/scale.y);
        context.closePath();
        context.restore();
        context.clip();
    }

    this.renderer.draw.call(this, context);

    var zero = new goog.math.Coordinate(0, 0);
    for (var i = 0, child; child = this.children_[i]; i++) {
        var pos = child.localToParent(zero).clone(), rot = child.getRotation(), scale = child.getScale();
        context.save();
        context.translate(pos.x, pos.y);
        context.scale(scale.x,scale.y);

        if (rot != 0) {
            context.rotate(-rot * Math.PI / 180);
        }
        this.renderer.drawCanvasObject.call(child, context);
        context.restore();

    }

    if (this.opacity_ != 1) {
        context.globalAlpha /= this.opacity_;
    }
    if (this.activeMask_) {
        context.restore();
    }

};

