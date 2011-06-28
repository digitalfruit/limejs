goog.provide('lime.fill.LinearGradient');

goog.require('lime.fill.Fill');

/**
 * Linear gradient fill.
 * @constructor
 * @extends lime.fill.Fill
 */
lime.fill.LinearGradient = function() {
    lime.fill.Fill.call(this);

    this.colors_ = [];
    this.setDirection(0, 0, 0, 1);

};
goog.inherits(lime.fill.LinearGradient, lime.fill.Fill);

/**
 * Common name for Lineargradient objects
 * @type {string}
 */
lime.fill.LinearGradient.prototype.id = 'lineargradient';

/**
 * @inheritDoc
 */
lime.fill.LinearGradient.prototype.initForSprite = function(sprite) {
    // no CSS3 gradients in Opera yet and IE filters aren't good solution
    if(goog.userAgent.OPERA || goog.userAgent.IE){
        sprite.setRenderer(lime.Renderer.CANVAS);
    }
};

/**
 * Set direction of the gradient by defining start and endpoint
 * locations as vectors from top-left corner to bottom-right.
 * @param {number} x0 Start position x coordinate.
 * @param {number} y0 Start position y coordinate.
 * @param {number} x1 End position x coordinate.
 * @param {number} y1 End position y coordinate.
 * @return {lime.fill.LinearGradient} object itself.
 */
lime.fill.LinearGradient.prototype.setDirection = function(x0, y0, x1, y1) {
    this.points_ = [x0, y0, x1, y1];

    return this;
};

/**
 * Add color stop to the gradient. Accepts same format as node.setFill().
 * @param {number} offset Position of color [0-1].
 * @param {*} color Color value.
 * @return {lime.fill.LinearGradient} object itself.
 */
lime.fill.LinearGradient.prototype.addColorStop = function(offset, color) {
    var color_vars = goog.array.toArray(arguments);
    color_vars.shift();
    this.colors_.push([offset, lime.fill.parse(color_vars)]);
    return this;
};

/**
 * Format color stop string for current browser
 * @private
 * @param {Array.<number|lime.fill.Fill>} clr Color in format [offset,color].
 * @return {string} Color stop CSS string.
 */
lime.fill.LinearGradient.prototype.formatColorStop_ = function(clr) {

    return goog.userAgent.WEBKIT ?
        'color-stop(' + clr[0] + ', ' + clr[1].str + ')' :
        clr[1].str + ' ' + clr[0] * 100 * this.rate + '%';
};

/** @inheritDoc */
lime.fill.LinearGradient.prototype.setDOMStyle = function(domEl, shape) {
     var grad, frame = shape.getFrame(),
     width = frame.right - frame.left,
     height = frame.bottom - frame.top;

    if (!goog.userAgent.WEBKIT) {

    //Endpoint calculation for non-webkit.
    //If you are a math-wiz then optimize it
    var x = (this.points_[2] - this.points_[0]) * width,
        y = (this.points_[1] - this.points_[3]) * height,
        x0 = frame.left + width * this.points_[0],
        y0 = frame.top + height * this.points_[1],
        angle = Math.atan2(y, x), tana = -y / x, p;

        if (tana == Infinity) tana = Math.pow(10, 10);

        if (angle > 0 && angle < Math.PI / 2) {
            p = [frame.right, frame.top];
        }
        else if (angle > 0) {
            p = [frame.left, frame.top];
        }
        else if (angle > -Math.PI / 2) {
            p = [frame.right, frame.bottom];
        }
        else {
            p = [frame.left, frame.bottom];
        }
        var xx = (p[1] + (1 / tana) * p[0] - y0 + tana * x0) /
                    (tana + 1 / tana),
            yy = (tana * xx + y0 - x0 * tana);
        xx -= x0;
        yy -= y0;
        this.rate = Math.sqrt((x * x + y * y) / (xx * xx + yy * yy));
    }
    var colors = goog.array.map(this.colors_, this.formatColorStop_, this);


    if (goog.userAgent.WEBKIT) {
        grad = '-webkit-gradient(linear,' + this.points_[0] * 100 + '% ' +
            this.points_[1] * 100 + '%,' + this.points_[2] * 100 + '% ' +
            this.points_[3] * 100 + '%,' + colors.join(',') + ')';
    }
    else {

        grad = 'linear-gradient(' + this.points_[0] * 100 + '% ' +
            this.points_[1] * 100 + '% ' +
            Math.atan2((this.points_[1] - this.points_[3]) * height,
            (this.points_[2] - this.points_[0]) * width) + 'rad,' +
            colors.join(',') + ')';
   }

   if (goog.userAgent.GECKO) grad = '-moz-' + grad;

   domEl.style['background'] = grad;
};

/** @inheritDoc */
lime.fill.LinearGradient.prototype.setCanvasStyle = function(context, shape) {
    var p = this.points_,
        frame = shape.getFrame(),
        width = frame.right - frame.left,
        height = frame.bottom - frame.top;

    var grad = context.createLinearGradient(
            frame.left + width * p[0],
            frame.top + height * p[1],
            frame.left + width * p[2],
            frame.top + height * p[3]
        );

    for (var i = 0; i < this.colors_.length; i++) {
        grad.addColorStop(this.colors_[i][0], this.colors_[i][1].str);
    }
    context.fillStyle = grad;
};
