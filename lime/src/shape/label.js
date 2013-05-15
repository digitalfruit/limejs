goog.provide('lime.Label');
goog.provide('lime.Renderer.CANVAS.LABEL');
goog.provide('lime.Renderer.DOM.LABEL');


goog.require('lime.Renderer.CANVAS.SPRITE');
goog.require('lime.Renderer.DOM.SPRITE');
goog.require('lime.Sprite');
goog.require('goog.style');

/**
 * Display object for text
 * @param {string} txt Text contents of the label.
 * @constructor
 * @extends lime.Sprite
 */
lime.Label = function(txt) {
    lime.Sprite.call(this);

    this.setMultiline(false);
    this.setText(txt);

    this.setFontFamily(lime.Label.defaultFont);
    this.setFontSize(14);
    this.setFontColor('#000');
    this.setAlign('center');
    this.setFontWeight('400');

    this.setPadding(0);

    this.setLineHeight(1.15);

    this.setShadow(null);

    this.setFill(255, 255, 255, 0);

    this.setStyle("normal");

};
goog.inherits(lime.Label, lime.Sprite);

/**
 * Common name for label objects
 * @type {string}
 */
lime.Label.prototype.id = 'label';

/**
 * Default Font name for labels
 * @type {string}
 */
lime.Label.defaultFont = 'Arial';

/** @inheritDoc */
lime.Label.prototype.supportedRenderers = [
    lime.Renderer.DOM.SPRITE.makeSubRenderer(lime.Renderer.DOM.LABEL),
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.LABEL)
];

(function() {

var mContext;

/**
 * Measure text contents of the label
 * @return {goog.math.Size} size of the text.
 */
lime.Label.prototype.measureText = function() {
    if (!goog.isDef(mContext)) {
        var cvs = document.createElement('canvas');
        mContext = cvs.getContext('2d');
    }

    var lh = this.getLineHeight() * this.getFontSize();
    if (this.getMultiline()) {
        lh *= goog.string.trim(this.text_).split('\n').length
    }
    mContext.font = this.getStyle() + ' ' + this.getFontWeight() + ' ' + this.getFontSize() + 'px ' + this.getFontFamily();

    var metrics = mContext.measureText(this.text_);
    var w = goog.userAgent.WEBKIT ? metrics.width : metrics.width + 1;

    if (lime.userAgent.IOS5)
        w += 1;

    var stroke = this.stroke_?this.stroke_.width_:0;
    return new goog.math.Size(
        this.padding_[1] + this.padding_[3] + w + stroke*2,
        this.padding_[0] + this.padding_[2] + lh + stroke*2
    );
};
})();

/** @inheritDoc */
lime.Label.prototype.getSize = function() {
    var size = lime.Node.prototype.getSize.call(this);
    if (!size || (!size.width && !size.height)) {
        return this.measureText();
    }
    return size;
};

/**
 * Returns label text as stirng
 * @return {string} Text contents.
 */
lime.Label.prototype.getText = function() {
    return this.text_;
};

/**
 * Set label text
 * @param {string} txt New text contents.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setText = function(txt) {
    this.text_ = txt + '';
    this.setDirty(lime.Dirty.CONTENT);
    delete this.words_;
    return this;
};

/**
 * Set label text
 * @param {string} txt New style contents.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setStyle = function(style) {
    this.style_ = style;
    this.setDirty(lime.Dirty.FONT);
    return this;
};


/**
 * Returns the current font style
 * @return {string} Style name string.
 */
lime.Label.prototype.getStyle = function() {
    return this.style_;
};


/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.Label.prototype.getFontFamily = function() {
    return this.fontFamily_;
};

/**
 * Set font weight
 * @param {string} value New font weight value.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setFontWeight = function(value) {
    this.fontWeight_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.Label.prototype.getFontWeight = function() {
    return this.fontWeight_;
};

/**
 * Set font name
 * @param {string} value New font family string.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setFontFamily = function(value) {
    this.fontFamily_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns font size in pixels
 * @return {number} Font size in px.
 */
lime.Label.prototype.getFontSize = function() {
    return this.fontSize_;
};

/**
 * Set the font size in pixels
 * @param {number} value New font size in px.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setFontSize = function(value) {
    this.fontSize_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns font color as string
 * @return {string} Font color.
 */
lime.Label.prototype.getFontColor = function() {
    return this.fontColor_;
};

/**
 * Sets the font color. Accepts #hex, rgb(), rgba() or plain color name.
 * @param {string} value New color.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setFontColor = function(value) {
    this.fontColor_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Return padding box around the text contents
 * @return {goog.math.Box} padding box.
 */
lime.Label.prototype.getPadding = function() {
    return this.padding_;
};

/**
 * Set new padding box around text contents.
 * @param {number} top Top padding.
 * @param {number=} opt_right Right padding.
 * @param {number=} opt_bottom Bottom padding.
 * @param {number=} opt_left Left padding.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setPadding = function(top, opt_right,
        opt_bottom, opt_left) {

    var val = [top, top, top, top];
    if (goog.isDef(opt_right)) {
        val[1] = val[3] = opt_right;
    }
    if (goog.isDef(opt_bottom)) {
        val[2] = opt_bottom;
    }
    if (goog.isDef(opt_left)) {
        val[3] = opt_left;
    }
    this.padding_ = val;

    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Sets the line height used in multiline strings. Can be in pixels
 * or factor from font size.
 * @param {number} value Line height.
 * @param {boolean=} opt_absolute If height is in pixels.
 */
lime.Label.prototype.setLineHeight = function(value, opt_absolute) {
    this.lineHeightAbsolute_ = opt_absolute || false;
    this.lineHeight_ = value;
    return this;
};

/**
 * Return line height as a factor from font size
 * @return {number} Line height.
 */
lime.Label.prototype.getLineHeight = function() {
    var shadowExtra = Math.abs(this.getShadowOffset().y) + this.shadowBlur_ * 2;
    return this.lineHeightAbsolute_ ?
        (this.lineHeight_ + shadowExtra) / this.getFontSize() : this.lineHeight_ + shadowExtra / this.getFontSize();
};

/**
 * Returns alignment value
 * @return {string} Alignement.
 */
lime.Label.prototype.getAlign = function() {
    return this.align_;
};

/**
 * Sets label alignment. Accepts normal strings as left,center,right
 * @param {string} value New alignment value.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setAlign = function(value) {
    this.align_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

lime.Label.prototype.getMultiline = function() {
    return this.multiline_;
}

lime.Label.prototype.setMultiline = function(bool) {
    this.multiline_ = bool;
    this.setDirty(lime.Dirty.CONTENT);
    return this;
};

/**
 * Shorthand for adding shadow to a label. Calling setShadow(null) removes the shadow.
 * @param {?string} color Shadow color.
 * @param {number=} opt_blur Shadow blur radius.
 * @param {(number|goog.math.Vec2)=} opt_offsetX Shadow offset in X axis, or offset Vec2.
 * @param {number=} opt_offsetY Shadow offset in Y axis.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setShadow = function(color, opt_blur, opt_offsetX, opt_offsetY){
    // provide method to reset the shadow
    if(arguments.length == 1 && goog.isNull(color)){
        this.setShadowColor('#ccc'); //default color
        this.setShadowBlur(0);
        this.setShadowOffset(0,0);
    }
    else if(arguments.length == 2) {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(new goog.math.Vec2(0,0));
    }
    else if(arguments.length == 3) {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(/** @type {!goog.math.Vec2} */(opt_offsetX));
    }
    else {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(/** @type {!(number|goog.math.Vec2)} */(opt_offsetX), opt_offsetY);
    }
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns true if the label has a shadow.
 * @private
 */
lime.Label.prototype.hasShadow_ = function(){
    return this.shadowBlur_ || this.shadowOffset_.x || this.shadowOffset_.y;
};

/**
 * Returns shadow color
 * @return {string} shadow color.
 */
lime.Label.prototype.getShadowColor = function() {
    return this.shadowColor_;
};

/**
 * Returns shadow offset in px.
 * @return {goog.math.Vec2} shadow offset in px.
 */
lime.Label.prototype.getShadowOffset = function() {
    return this.shadowOffset_;
};

/**
 * Set the shadow color.
 * @param {string} color The shadow color.
 */
lime.Label.prototype.setShadowColor = function(color){
    this.shadowColor_ = color;
    return this;
};

/**
 * Set the shadow blur radius.
 * @param {number} radius The shadow blur radius.
 */
lime.Label.prototype.setShadowBlur = function(radius){
    this.shadowBlur_ = radius;
    return this;
};

/**
 * Sets label shadow offset in px.
 * @param {(goog.math.Vec2|number)} offset Shadow offset.
 * @param {number=} opt_offsetY Optionaly set offset using x,y.
 * @return {lime.Label} object itself.
 */
lime.Label.prototype.setShadowOffset = function(offset, opt_offsetY) {
    if (arguments.length == 2) {
        this.shadowOffset_ = new goog.math.Vec2(arguments[0], arguments[1]);
    }
    else {
        this.shadowOffset_ = offset;
    }
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns shadow blur radius in px.
 * @return {number} shadow blur radius in px.
 */
lime.Label.prototype.getShadowBlur = function() {
    return this.shadowBlur_;
};

/**
 *
 * Break text into array of line breakable words
 * @return {Array.<string>} array of words.
 */
lime.Label.prototype.calcWordsArray = function() {
  var words = [];
  var len = this.text_.length;
  var regexp = goog.userAgent.GECKO ? /[\s\.]+/g : /[\s-\.]+/g;
  var breaks = this.text_.match(regexp);
  var st = 0;
  if (breaks)
  for (var i = 0; i < breaks.length; i++) {
      var b = breaks[i];
      var ibreak = this.text_.indexOf(b, st);
      var wlen = ibreak + b.length;
      words.push(this.text_.substring(st, wlen));
      st = wlen;
  }
  if (st != len) {
      words.push(this.text_.substring(st, len));
  }
  return words;
};

/**
 * Wrap text on words array to lines based on current
 * font size and given maximum width.
 * @param {Object} context Canvas2DContext used to measure.
 * @param {number} width Maximum line width.
 * @return {Array.<string>} Lines of text.
 */
lime.Label.prototype.wrapText = function(context, width) {
    var lines = [], line = '', words = this.words_, metrics;
    for (var i = 0; i < words.length; i++) {
        var breaks = 0;
        if (this.multiline_) {
            var matches = words[i].match(/\n/g)
            if (matches) {
                breaks = matches.length
            }
        }
        if (line == '') {
            line = words[i];
        }
        else {
            metrics = context.measureText(goog.string.trim(line + words[i]));
            if (metrics.width > width) {
                lines.push(goog.string.trim(line));
                //breaks--
                line = words[i];
            }
            else {
                line += words[i];
            }
        }
        for (var j = 0; j < breaks; j++) {
            lines.push(goog.string.trim(line));
            line = ''
        }
    }
    lines.push(line);
    return lines;
};

/** @inheritDoc */
lime.Label.prototype.update = function(){

    if(this.getDirty() & lime.Dirty.CONTENT)
        delete this.lastDrawnWidth_;

    lime.Node.prototype.update.apply(this,arguments);
};


/**
 * @inheritDoc
 * @this {lime.Label}
 */
lime.Renderer.DOM.LABEL.draw = function(el) {
    lime.Renderer.DOM.SPRITE.draw.call(this, el);

    var style = el.style;
    if (this.dirty_ & lime.Dirty.CONTENT) {
        if (this.getMultiline()) {
            el.innerHTML = goog.string.htmlEscape(this.text_).replace(/\n/g, '<br/>')
        }
        else goog.dom.setTextContent(el, this.text_);
    }
    if (this.dirty_ & lime.Dirty.FONT) {
        style['lineHeight'] = this.getLineHeight();
        style['padding'] = goog.array.map(this.padding_,function(p){return p * this.getRelativeQuality();},this).join('px ') + 'px';
        style['color'] = this.getFontColor();
        style['fontFamily'] = this.getFontFamily();
        style['fontSize'] = this.getFontSize()*this.getRelativeQuality() + 'px';
        style['fontWeight'] = this.getFontWeight();
        style['textAlign'] = this.getAlign();
        style['font-style'] = this.getStyle();
        style['textShadow'] = this.hasShadow_() ? this.getShadowColor() + ' ' + this.getShadowOffset().x + 'px ' + this.getShadowOffset().y + 'px ' + this.getShadowBlur() + 'px' : '';
    }
};

/**
 * @inheritDoc
 * @this {lime.Label}
 */
lime.Renderer.CANVAS.LABEL.draw = function(context) {

    lime.Renderer.CANVAS.SPRITE.draw.call(this, context);

    var frame = this.getFrame(),
        width = -frame.left - this.padding_[3] + frame.right - this.padding_[1] + Math.abs(this.getShadowOffset().x) + Math.abs(this.getShadowBlur() * 2),
        dowrap = 0;

    if (!this.words_) {
        this.words_ = this.calcWordsArray();
        dowrap = 1;
    }

    var stroke = this.stroke_?this.stroke_.width_:0;

    context.save();
    var align = this.getAlign();
    if (align == 'left') {
        context.translate(frame.left + this.padding_[3]+stroke,
            frame.top + this.padding_[0]+stroke);
    }
    else if (align == 'right') {
        context.translate(frame.right - this.padding_[1]-stroke,
            frame.top + this.padding_[0]+stroke);
    }
    else if (align == 'center') {
        context.translate(
            (frame.left + this.padding_[3] +
                frame.right - this.padding_[1]) * .5,
            frame.top + this.padding_[0]+stroke);
    }

    var lh = this.getLineHeight();

    context.fillStyle = this.getFontColor();
    context.font = this.getStyle() + ' '+ this.getFontWeight() + ' ' + this.getFontSize() +
        'px/' + lh + ' ' + this.getFontFamily();
    context.textAlign = align;
    context.textBaseline = 'top';

    if(this.hasShadow_()){
        context.shadowColor = this.getShadowColor();
        context.shadowOffsetX = this.getShadowOffset().x;
        context.shadowOffsetY = this.getShadowOffset().y;
        context.shadowBlur = this.getShadowBlur();
    }

    if(dowrap || width!=this.lastDrawnWidth_){
        this.lines_ = this.wrapText(context, width - 2 * stroke);
        this.lastDrawnWidth_ = width;
    }

    if (this.lines_) {
        var lhpx = lh * this.getFontSize(),
            offsetY = (goog.isDef(this.getShadowBlur()) ? Math.abs(this.getShadowBlur()) : 0) +
                      (goog.isDef(this.getShadowOffset()) ? Math.abs(this.getShadowOffset().y) / 2 : 0),
            offsetX = 0;
        lhpx = goog.userAgent.WEBKIT ? Math.floor(lhpx) : Math.round(lhpx);
        for (var i = 0; i < this.lines_.length; i++) {
            context.fillText(this.lines_[i], offsetX, lhpx * i + offsetY - 0.5);
        }
    }

    context.restore();
};

/**
 * Helper function to install new font file so you can use
 * the font name as font-family.
 * @param {string} name Font name.
 * @param {string} fileurl Path to font file.
 * @param {string=} opt_format Font format.
 */
lime.Label.installFont = function(name, fileurl, opt_format) {
    var format = opt_format || 'truetype';
    goog.style.installStyles('@font-face{font-family: "' + name +
        '";src: url(' + fileurl + ') format("' + format + '");})');
};
