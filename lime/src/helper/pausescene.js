goog.provide('lime.helper.PauseScene');

goog.require('lime.Label');
goog.require('lime.Scene');
goog.require('lime.Sprite');

/**
 * PauseScene. This scene appears when director is paused.
 * @constructor
 * @extends lime.Scene
 */
lime.helper.PauseScene = function() {
    lime.Scene.call(this);

    this.domElement.style.cssText = 'background:rgba(255,255,255,.8)';

    /*
    var label = new lime.Label().setText('Paused').setPosition(100,100);
    this.appendChild(label);
    */
};
goog.inherits(lime.helper.PauseScene, lime.Scene);
