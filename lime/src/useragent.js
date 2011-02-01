goog.provide('lime.userAgent');

goog.require('goog.userAgent');


(function() {


var ua = goog.userAgent.getUserAgentString();

lime.userAgent.IOS = goog.userAgent.WEBKIT && goog.userAgent.MOBILE && (/(ipod|iphone|ipad)/i).test(ua);

lime.userAgent.ANDROID = goog.userAgent.WEBKIT && goog.userAgent.MOBILE && (/(android)/i).test(ua);


lime.userAgent.IPAD = lime.userAgent.IOS && (/(ipad)/i).test(ua);

lime.userAgent.IPHONE4 = lime.userAgent.IOS && goog.global['devicePixelRatio'] >= 2;

lime.userAgent.SUPPORTS_TOUCH = goog.isDef(document['ontouchmove']);


})();
