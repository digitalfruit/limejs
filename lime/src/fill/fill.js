goog.provide('lime.fill.Fill');

/**
 * Abstract class for adding textures to sprites
 * @constructor
 */
lime.fill.Fill = function() {
    this.sprite_ = null;
};

/**
 * Initialize connection between fill and a sprite.
 * No drawing is performed here but common setup is done.
 * @param {lime.Sprite} sprite Sprite.
 */
lime.fill.Fill.prototype.initForSprite = function(sprite) {
    //don't draw but preload
};


/**
 * Parse fill object out of mixed inputs.
 * Accepts: RGB(A) values, color strings, urls to images
 * @param {mixed} inp Mixed inputs.
 * @return {lime.fill.Fill} Fill object.
 */
lime.fill.parse = function(inp) {
    if (inp[0] instanceof lime.fill.Fill) return inp[0];

    if(!goog.isArray(inp)) inp = goog.array.toArray(arguments);

    if (inp.length > 2) {
        return new lime.fill.Color(inp);
    }
    else if (goog.isString(inp[0]) && (inp[0].substring(0, 4) == 'rgb(' ||
        inp[0].substring(0, 5) == 'rgba(' || inp[0].substring(0, 1) == '#')) {
        return new lime.fill.Color(inp[0]);
    }

    return new lime.fill.Image(inp[0]);

};

/**
 * Set color as a DOM style for dom element
 * @param {domElement} domEl DOM Element.
 */
lime.fill.Fill.prototype.setDOMStyle = goog.nullFunction;


/**
 * Set color as Canvas fillStyle
 * @param {Canvas2DContext} context Canvas context.
 */
lime.fill.Fill.prototype.setCanvasStyle = goog.nullFunction;

