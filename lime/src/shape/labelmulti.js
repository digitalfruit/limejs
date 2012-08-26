goog.provide('lime.LabelMulti');
goog.provide('lime.Renderer.CANVAS.LABELMULTI');
goog.provide('lime.Renderer.DOM.LABELMULTI');


goog.require('lime.Sprite');
goog.require('lime.Label');

/**
 * Display object for text
 * @param {string} txt Text contents of the label.
 * @constructor
 * @extends lime.Sprite
 */

lime.LabelMulti = function(txt) {
    lime.Sprite.call(this);
    
    this.padding_ = [0, 0, 0, 0];
    this.align_ = 'center';
    this.fontSize_ = 14;
    this.lineHeight_ = 1.15;
    
    this.setText(txt);
    this.setFontFamily(lime.Label.defaultFont);
    this.setFontColor('#000');
    this.setFontWeight('400');


    this.setLineHeight(1.15);
};

goog.inherits(lime.LabelMulti, lime.Sprite);


/** @inheritDoc */
lime.LabelMulti.prototype.supportedRenderers = [
    lime.Renderer.DOM.SPRITE.makeSubRenderer(lime.Renderer.DOM.LABELMULTI),
    lime.Renderer.CANVAS.SPRITE.makeSubRenderer(lime.Renderer.CANVAS.LABELMULTI)
];

(function() {

var mContext;

/**
 * Measure text contents of the labelMulti
 * @return {goog.math.Size} size of the text.
 */
lime.LabelMulti.prototype.measureText = function() {
    var maxWidth = 0;
    var height = 0;
    for(var i = 0; i < this.getNumberOfChildren(); i++)
    {
        var childWidth = this.getChildAt(i).getSize().width;
        if (childWidth > maxWidth)
            maxWidth = childWidth;
        height += this.getChildAt(i).getSize().height;
    }
    return new goog.math.Size(
        maxWidth,
        height
    );
}
})();

/** @inheritDoc */
lime.LabelMulti.prototype.getSize = function() {
    return this.measureText();
};

/**
 * Returns label text as stirng
 * @return {string} Text contents.
 */
lime.LabelMulti.prototype.getText = function() {
    return this.text_;
};

/**
 * Set label text
 * @param {string} txt New text contents.
 * @return {lime.LabelMulti} object itself.
 */

lime.LabelMulti.prototype.pushLine_ = function(str) {
    var label = new lime.Label(str)
            .setAnchorPoint(0, 0);
    this.appendChild(label);
}


lime.LabelMulti.prototype.setText = function(txt) {
    this.removeAllChildren();
    if (!goog.isDef(txt) || txt.length == 0)
    {
        this.appendChild(new lime.Label());
        this.text_ = '';
        return this;
    }
    
    this.text_ = txt || '';
    var startPos = 0;
    var pos;
    var labels = new Array();
    while(-1 != (pos = txt.indexOf('\n', startPos)))
    {
        // Push the line
        this.pushLine_(txt.substr(startPos, pos - startPos));
        startPos = pos + 1;
    }
    if (startPos < txt.length - 1)
        this.pushLine_(txt.substr(startPos, txt.length - startPos));
        
        
    this.setFontSize(this.fontSize_);
    this.setLineHeight(this.lineHeight_, this.lineHeightAbsolute_);
    this.setPadding(this.padding_[0], this.padding_[1], this.padding_[2], this.padding_[3]);
    return this;
};


/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.LabelMulti.prototype.getFontFamily = function() {
    return this.getChildAt(0).fontFamily_;
};

/**
 * Set font name
 * @param {string} value New font family string.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setFontFamily = function(value) {
    for(var i = 0; i < this.getNumberOfChildren(); i++)
        this.getChildAt(i).setFontFamily(value);
    this.updateLinesPosition_();
    return this;
};

/**
 * Set font weight
 * @param {string} value New font weight value.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setFontWeight = function(value) {
    for(var i = 0; i < this.getNumberOfChildren(); i++)
    {
        this.getChildAt(i).setFontWeight(value);
    }
    return this;
};

/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.LabelMulti.prototype.getFontWeight = function() {
    return this.getChildAt(0).fontWeight_;
};

/**
 * Returns font size in pixels
 * @return {number} Font size in px.
 */
lime.LabelMulti.prototype.getFontSize = function() {
    return this.fontSize_;
};


lime.LabelMulti.prototype.updateLinesPosition_ = function()
{
    // Top padding
    this.getChildAt(0).setPadding(this.padding_[0], this.padding_[1], 0, this.padding_[3]);
    
    var currentHeight = this.getChildAt(0).getSize().height;
    for (var i = 1; i < this.getNumberOfChildren(); i++)
    {
        this.getChildAt(i).setPosition(0, currentHeight);
        currentHeight += this.getChildAt(i).getSize().height;
        
        // Left and right padding
        this.getChildAt(i).setPadding(0, this.padding_[1], 0, this.padding_[3]);
    }
    // Bottom padding
    this.getChildAt(this.getNumberOfChildren() - 1).setPadding(0, this.padding_[1], this.padding_[2], this.padding_[3]);
    
    
    // Realign
    if (this.align_ == 'center')
    {
        var pos = this.getSize().width / 2;
        for (var i = 0; i < this.getNumberOfChildren(); i++)
        {
            var child = this.getChildAt(i);
            child.setPosition(pos, child.getPosition().y);
            child.setAnchorPoint(.5, 0);
        }
    }
    else if (this.align_ == 'left')
    {
        for (var i = 0; i < this.getNumberOfChildren(); i++)
        {
            var child = this.getChildAt(i);
            child.setPosition(0, child.getPosition().y);
            child.setAnchorPoint(0, 0);
        }
    }
    else if (this.align_ == 'right')
    {
        var pos = this.getSize().width;
        for (var i = 0; i < this.getNumberOfChildren(); i++)
        {
            var child = this.getChildAt(i);
            child.setPosition(pos, child.getPosition().y);
            child.setAnchorPoint(1, 0);
        }
    }
}

/**
 * Set the font size in pixels
 * @param {number} value New font size in px.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setFontSize = function(value) {
    this.fontSize_ = value;
    for(var i = 0; i < this.getNumberOfChildren(); i++)
    {
        this.getChildAt(i).setFontSize(value);
    }
    this.updateLinesPosition_();
    return this;
};

/**
 * Returns font color as string
 * @return {string} Font color.
 */
lime.LabelMulti.prototype.getFontColor = function() {
    return this.getChildAt(0).fontColor_;
};

/**
 * Sets the font color. Accepts #hex, rgb(), rgba() or plain color name.
 * @param {string} value New color.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setFontColor = function(value) {
    for(var i = 0; i < this.getNumberOfChildren(); i++)
        this.getChildAt(i).setFontColor(value);
    return this;
};

/**
 * Return padding box around the text contents
 * @return {goog.math.Box} padding box.
 */
lime.LabelMulti.prototype.getPadding = function() {
    return this.padding_;
};

/**
 * Set new padding box around text contents.
 * @param {number} top Top padding.
 * @param {number=} opt_right Right padding.
 * @param {number=} opt_bottom Bottom padding.
 * @param {number=} opt_left Left padding.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setPadding = function(top, opt_right,
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
    this.updateLinesPosition_();
    return this;
};

/**
 * Sets the line height used in multiline strings. Can be in pixels
 * or factor from font size.
 * @param {number} value Line height.
 * @param {boolean=} opt_absolute If height is in pixels.
 */
lime.LabelMulti.prototype.setLineHeight = function(value, opt_absolute) {
    this.lineHeight_ = value;
    this.lineHeightAbsolute_ = opt_absolute || false;
    for(var i = 0; i < this.getNumberOfChildren(); i++)
    {
        this.getChildAt(i).setLineHeight(this.lineHeight_, this.lineHeightAbsolute_);
    }
    this.updateLinesPosition_();
    return this;
};

/**
 * Return line height as a factor from font size
 * @return {number} Line height.
 */
lime.LabelMulti.prototype.getLineHeight = function() {
    return this.getChildAt(0).getLineHeight();
};

/**
 * Returns alignment value
 * @return {string} Alignement.
 */
lime.LabelMulti.prototype.getAlign = function() {
    return this.align_;
};

/**
 * Sets label alignment. Accepts normal strings as left,center,right
 * @param {string} value New alignment value.
 * @return {lime.LabelMulti} object itself.
 */
lime.LabelMulti.prototype.setAlign = function(value) {
    this.align_ = value;
    for(var i = 0; i < this.getNumberOfChildren(); i++)
    {
        this.getChildAt(i).setAlign(value);
    }
    this.updateLinesPosition_();
    return this;
};