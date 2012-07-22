goog.provide('lime.Template');

goog.require('goog.dom');
goog.require('lime.Node');

/**
 * Renders HTML Strings
 * @constructor
 * @extends lime.Node
 */
lime.Template = function (templateFunc) {
    lime.Node.call(this);

    this.templateFunc_ = templateFunc;
    this.domClassName = goog.getCssName('lime-template');

};

goog.inherits(lime.Template, lime.Node);

/**
 * Supported renderers for Node
 * @type {Array.<lime.Renderer>}
 */
lime.Template.prototype.supportedRenderers = [
    lime.Renderer.DOM
];

/**
 * @private
 */
lime.Template.prototype.templateFunc_ = null;

/**
 * @private
 */
lime.Template.prototype.hasRenderedTemplate_ = false;

lime.Template.prototype.update = function () {
    goog.base(this, 'update');

    // only render once
    if(!this.hasRenderedTemplate_ && this.templateFunc_) {
        var temp = this.templateFunc_();

        if(this.rootElement && temp) {
            goog.dom.append(this.rootElement, goog.dom.htmlToDocumentFragment(temp));
            this.hasRenderedTemplate_ = true;
        }
    }
};