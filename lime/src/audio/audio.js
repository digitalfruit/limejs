goog.provide('lime.audio.Audio');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('lime.userAgent');

/**
 * Audio stream object
 * @constructor
 * @param {string} filePath Path to audio file.
 */
lime.audio.Audio = function(filePath) {
    goog.events.EventTarget.call(this);

    if(filePath && goog.isFunction(filePath.data)){
        filePath = filePath.data();
    }

    /**
     * @type bBoolean}
     * @private
     */
    this.loaded_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.playing_ = false;

    if (goog.userAgent.GECKO && (/\.mp3$/).test(filePath)) {
        filePath = filePath.replace(/\.mp3$/, '.ogg');
    }

    if (lime.audio.AudioContext) {
        this.volume_ = 1;
        this.prepareContext_();
        this.loadBuffer(filePath, goog.bind(this.bufferLoadedHandler_, this));
    }
    else {
        /**
         * Internal audio element
         * @type {audio}
         */
        this.baseElement = document.createElement('audio');
        this.baseElement['preload'] = true;
        this.baseElement['loop'] = false;
        this.baseElement.src = filePath;
        this.baseElement.load();
        this.baseElement.addEventListener('ended', goog.bind(this.onEnded_, this));
        this.loadInterval = setInterval(goog.bind(this.loadHandler_, this), 10);

        this.loaded_ = false;
    }
};
goog.inherits(lime.audio.Audio, goog.events.EventTarget);

lime.audio.AudioContext = goog.global['AudioContext'] || goog.global['webkitAudioContext'];
lime.audio._buffers = {};

lime.audio.supportsMultiChannel = lime.audio.AudioContext || !(lime.userAgent.IOS || lime.userAgent.WINPHONE);

lime.audio.Audio.prototype.prepareContext_ = function() {
    if (lime.audio.context) return;
    var context = lime.audio.context = new lime.audio.AudioContext();
    var gain = lime.audio.masterGain = context['createGainNode']();
    gain['connect'](context['destination']);
};

lime.audio.Audio.prototype.loadBuffer = function (path, cb) {
    var buffers = lime.audio._buffers;
    if (buffers[path] && buffers[path].buffer) {
        cb(buffers[path].buffer, path);
    }
    else if (buffers[path]) {
        buffers[path].push(cb);
    }
    else {
        buffers[path] = [cb];
        var req = new XMLHttpRequest();
        req.open('GET', path, true);
        req.responseType = 'arraybuffer';
        req.onload = function() {
            lime.audio.context['decodeAudioData'](req.response, function(buffer) {
               if (!buffer) {
                   return console.error('Error decoding file:', path);
               }
               var cbArray = buffers[path];
               buffers[path] = {buffer: buffer};
               for (var i=0; i < cbArray.length; i++) {
                   cbArray[i](buffer, path);
               }
            }, function(e){console.error('Error decoding file',e);});
        };
        req.onerror = function() {
          console.error('XHR error loading file:', path);
        };
        req.send();
    }
};

lime.audio.Audio.prototype.bufferLoadedHandler_ = function (buffer, path) {
    this.buffer = buffer;
    this.loaded_ = true;
    var ev = new goog.events.Event('loaded');
    ev.event = null;
    this.dispatchEvent(ev);
    if (this.autoplay_) {
        this.play.apply(this, this.autoplay_);
    }
};

lime.audio.Audio.prototype.onEnded_ = function (e) {
    this.playing_ = false;
    var ev = new goog.events.Event('ended');
    ev.event = e;
    this.dispatchEvent(ev);
    this.playPosition_ = 0;
    var delay = lime.audio.AudioContext ? this.playTime_ + this.buffer.duration - this.playPositionCache - 0.05 : 0;
    if (this.next_) {
        for (var i = 0; i < this.next_.length; i++) {
            this.next_[i][0].play(this.next_[i][1], delay);
        }
    }
    else if (ev.returnValue_ !== false && this.loop_) {
        this.play(this.loop_, delay);
    }
}

/**
 * Handle loading the audio file. Event handlers seem to fail
 * on lot of browsers.
 * @private
 */
lime.audio.Audio.prototype.loadHandler_ = function() {
    if (this.baseElement['readyState'] > 2) {
        this.bufferLoadedHandler_();
        clearTimeout(this.loadInterval);
    }
    if (this.baseElement['error'])clearTimeout(this.loadInterval);

    if (lime.userAgent.IOS && this.baseElement['readyState'] == 0) {
        //ios hack do not work any more after 4.2.1 updates
        // no good solutions that i know
        this.bufferLoadedHandler_();
        clearTimeout(this.loadInterval);
        // this means that ios audio anly works if called from user action
    }
};

/**
 * Returns true if audio file has been loaded
 * @return {boolean} Audio has been loaded.
 */
lime.audio.Audio.prototype.isLoaded = function() {
    return this.loaded_;
};

/**
 * Returns true if audio file is playing
 * @return {boolean} Audio is playing.
 */
lime.audio.Audio.prototype.isPlaying = function() {
    return this.playing_;
};

/**
 * Start playing the audio
 * @param {number=} opt_loop Loop the sound.
 */
lime.audio.Audio.prototype.play = function(opt_loop) {
    if (!this.isLoaded()) {
        this.autoplay_ = goog.array.toArray(arguments);
    }
    if (this.isLoaded() && !this.isPlaying() && !lime.audio.getMute()) {
        if (lime.audio.AudioContext) {
            if (this.source && this.source['playbackState'] == this.source['FINISHED_STATE']) {
                this.playPosition_ = 0;
            }
            this.source = lime.audio.context['createBufferSource']();
            this.source.buffer = this.buffer;
            this.gain = lime.audio.context['createGainNode']();
            this.gain['connect'](lime.audio.masterGain);
            this.gain['gain']['value'] = this.volume_;
            this.source['connect'](this.gain);

            this.playTime_ = lime.audio.context['currentTime'];
            var delay = arguments[1] || 0

            if (this.playPosition_ > 0) {
                this.source['noteGrainOn'](delay, this.playPosition_, this.buffer.duration - this.playPosition_);
            }
            else {
                this.source['noteOn'](delay);
            }
            this.playPositionCache = this.playPosition_;
            this.endTimeout_ = setTimeout(goog.bind(this.onEnded_, this),
                (this.buffer.duration - (this.playPosition_ || 0)) * 1000 - 150);
        }
        else {
            this.baseElement.play();
        }
        this.playing_ = true;
        this.loop_ = !!opt_loop;
        if (lime.audio._playQueue.indexOf(this) == -1) {
          lime.audio._playQueue.push(this);
        }
    }
};

/**
 * Stop playing the audio
 */
lime.audio.Audio.prototype.stop = function() {
    if (!this.isLoaded()) {
        this.autoplay_ = null;
    }
    if (this.isPlaying()) {
        if (lime.audio.AudioContext) {
            clearTimeout(this.endTimeout_);
            this.playPosition_ = lime.audio.context.currentTime - this.playTime_ + (this.playPosition_ || 0);
            if (this.playPosition_ > this.buffer.duration) {
                this.playPosition_ = 0;
            }
            this.source['noteOff'](0);
            this.gain['disconnect'](lime.audio.masterGain);
            this.source = null;
        }
        else {
            this.baseElement.pause();
        }
        this.playing_ = false;
    }
};

lime.audio._isMute = false;
lime.audio._playQueue = [];

lime.audio.getMute = function() {
  return lime.audio._isMute;
};

lime.audio.setMute = function(bool) {
  if (bool && !lime.audio._isMute) {
    for (var i = 0; i < lime.audio._playQueue.length; i++) {
      lime.audio._playQueue[i].stop();
    }
    lime.audio._playQueue = [];
  }
  lime.audio._isMute = bool;
};

lime.audio.Audio.prototype.setVolume = function(value) {
    if (lime.audio.AudioContext) {
        this.volume_ = value;
        if (this.gain) this.gain['gain']['value'] = value;
    }
    else {
        this.baseElement.volume = value;
    }
};
lime.audio.Audio.prototype.getVolume = function() {
    if (lime.audio.AudioContext) {
        return this.volume_;
    }
    else {
        return this.baseElement.volume;
    }
};
