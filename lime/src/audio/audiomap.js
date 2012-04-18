goog.provide('lime.audio.AudioMap');

goog.require('goog.events');
goog.require('lime.userAgent');
goog.require('jukebox.Manager');
goog.require('jukebox.Player');

/**
 * AudioMap object
 * @constructor
 * @param {object} config Configuration object.
 */
lime.audio.AudioMap = function(config) {
	if (config.data && goog.isFunction(config.data)) {
		config = config.data();
	}
	this.config = config;
	
	if (lime.userAgent.IOS || lime.userAgent.WINPHONE) {
		goog.events.listenOnce(window, lime.userAgent.SUPPORTS_TOUCH ? 'touchstart' : 'mousedown', this._initPlayer, true, this);
	}
	else {
		this._initPlayer();
	}
};

lime.audio.AudioMap.prototype._initPlayer = function() {
	this.player = new jukebox.Player(this.config);
}

/**
 * Start playing the audio
 * @param {string} sprite Sprite name to play. 
 */
lime.audio.AudioMap.prototype.play = function(sprite) {
	if (this.player && this.config.spritemap[sprite]) {
		this.player.play(sprite);
	}
};

/**
 * Stop playing the audio
 */
lime.audio.AudioMap.prototype.stop = function() {
	if (this.player) {
		this.player.pause();
	}
};


