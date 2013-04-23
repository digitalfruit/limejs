goog.provide('lime.audio.AudioMap');

goog.require('goog.events');
goog.require('lime.audio.Audio');
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
    this.tracks = {};

    if (lime.audio.AudioContext) {
        var path;
        for (var i = 0; i < config['resources'].length; i++) {
            if ((lime.userAgent.IOS?/\.caf/i:/\.mp3/i).test(config['resources'][i])) {
                path = config['resources'][i];
                continue;
            }
        }
        this.sprites = {};
        this.numSprites = 0;
        var loadedSprites = 0;
        var self = this;
        var keys = Object.keys(config['spritemap']);
        for (i = 0; i < keys.length; i++) {
            if (keys[i] === 'silence') continue;
            this.numSprites++;
            var spritePath = path.replace(/(.*)\.(.*?$)/,'$1_' + goog.string.padNumber(this.numSprites, 3) + '.$2');
            var audio = new lime.audio.Audio(spritePath);
            this.sprites[keys[i]] = {path: spritePath, audio: audio};
        }
    }
    else if (lime.userAgent.IOS || lime.userAgent.WINPHONE) {
        goog.events.listenOnce(goog.global, lime.userAgent.SUPPORTS_TOUCH ? 'touchstart' : 'mousedown', this._initPlayer, true, this);
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
 * @param {boolean=} opt_loop Loop the sound.
 * @param {number} opt_after Only start playing after this track has finished.
 */
lime.audio.AudioMap.prototype.play = function(sprite, opt_loop, opt_after) {
    if (lime.audio.AudioContext) {
        var spriteObj = this.sprites[sprite];
        if (spriteObj) {
            if (!goog.isDef(opt_loop) && this.config['spritemap'][sprite]['loop']) {
                opt_loop = true;
            }
            var delay = 0;
            var after;
            var audio = new lime.audio.Audio(spriteObj.path);

            if (opt_after && (after = this.tracks[opt_after])) {
                if (!after.next_) after.next_ = [];
                after.next_.push([audio, opt_loop]);
            }
            else {
                audio.play(opt_loop);
            }
            var id = (Math.random() * 1e6) | 0;
            this.tracks[id] = audio;
            goog.events.listen(audio, 'ended', function(e) {
                if (!audio.loop_) {
                    delete this.tracks[id];
                };
            }, false, this);
            return id;
        }
    }
    else if (this.player && this.config['spritemap'][sprite] && !lime.audio.getMute()) {
        this.player.play(sprite, true);
        var ctx = (this.player.context);
        if (!ctx.duration || ctx.buffered.end(0) | 0 < ctx.duration | 0) return;
        if (lime.audio._playQueue.indexOf(this) == -1) {
          lime.audio._playQueue.push(this);
        }
    }
};

/**
 * Stop playing the audio
 */
lime.audio.AudioMap.prototype.stop = lime.audio.AudioMap.prototype.pause = function(opt_playId) {
    if (lime.audio.AudioContext) {
        for (var i in this.tracks) {
            if (!opt_playId || i == opt_playId) {
                this.tracks[i].stop();
                delete this.tracks[i];
            }
        }
    }
    else if (this.player) {
        this.player.pause();
    }
};


