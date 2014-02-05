goog.provide('lime.dom');
goog.require('goog.dom');

lime.dom.isDOMSupported = function() {
    if (goog.global['CocoonJS_ENV'] === true) return false;
    // This works for Ejecta. Probably not for others. Pull request!
    return !!document.head.parentNode;
}

var old = goog.dom.getOwnerDocument;
goog.dom.getOwnerDocument = function() {
    return old.apply(goog.dom, arguments) || document;
}