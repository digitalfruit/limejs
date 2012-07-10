goog.provide('lime.audio.Audio');

goog.require('goog.events');

// Notice. Real problems for audio in iOS. Works only for one sound
// and needs to be initialized from user event. No solutions found.

/**
 * Audio stream object
 * @constructor
 * @param {string} filePath Path to audio file.
 */
lime.audio.Audio = function(filePath) {

    
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
        this.prepareContext_();
        this.loadBuffer(filePath, goog.bind(this.bufferLoadedHandler_, this));
    }
    else {
        /**
         * Internal audio element
         * @type {audio}
         */
        this.baseElement = document.createElement('audio');
        this.baseElement.preload = true;
        this.baseElement.loop = false;

        this.baseElement.src = filePath;
        this.baseElement.load();
        var self = this;
        this.baseElement.addEventListener('ended', function() {
            self.playing_ = false;
        });
        this.loadInterval = setInterval(goog.bind(this.loadHandler_, this), 10);

        this.loaded_ = false;
    }
};

lime.audio.AudioContext = goog.global['AudioContext'] || goog.global['webkitAudioContext'];
lime.audio._buffers = {};

lime.audio.Audio.prototype.prepareContext_ = function() {
    if (lime.audio.context) return;
    var context = lime.audio.context = new lime.audio.AudioContext();
    var gain = lime.audio.masterGain = context.createGainNode();
    gain.connect(context.destination);
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
            lime.audio.context.decodeAudioData(req.response, function(buffer) {
               if (!buffer) {
                   return console.error('Error decoding file:', path);
               }
               var cbArray = buffers[path];
               buffers[path] = buffer;
               for (var i=0; i < cbArray.length; i++) {
                   cbArray[i](buffer, path);
               }
            });
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
    console.log(this.buffer.duration, lime.audio.context.currentTime);
};

/**
 * Handle loading the audio file. Event handlers seem to fail
 * on lot of browsers.
 * @private
 */
lime.audio.Audio.prototype.loadHandler_ = function() {
    if (this.baseElement.readyState > 2) {
        this.loaded_ = true;
        clearTimeout(this.loadInterval);
    }
    if (this.baseElement.error)clearTimeout(this.loadInterval);

    if (lime.userAgent.IOS && this.baseElement.readyState == 0) {
        //ios hack do not work any more after 4.2.1 updates
        // no good solutions that i know
        this.loaded_ = true;
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
    return lime.audio.AudioContext && this.source ? this.source.playbackState == this.source.PLAYING_STATE : this.playing_;
};

/**
 * Start playing the audio
 */
lime.audio.Audio.prototype.play = function() {
    if (this.isLoaded() && !this.isPlaying() && !lime.audio.getMute()) {
        if (lime.audio.AudioContext) {
            if (this.source && this.source.playbackState == this.source.FINISHED_STATE) {
                this.playPosition_ = 0;
            }
            this.source = lime.audio.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(lime.audio.masterGain);
            this.playTime_ = lime.audio.context.currentTime;
            if (this.playPosition_ > 0) {
                this.source.noteGrainOn(0, this.playPosition_, this.buffer.duration - this.playPosition_);
            }
            else {
                this.source.noteOn(0);
            }
        }
        else {
            this.baseElement.play();
        }
        this.playing_ = true;
        if (lime.audio._playQueue.indexOf(this) == -1) {
          lime.audio._playQueue.push(this);
        }
    }
};

/**
 * Stop playing the audio
 */
lime.audio.Audio.prototype.stop = function() {
    if (this.isPlaying()) {
        if (lime.audio.AudioContext) {
            this.playPosition_ = lime.audio.context.currentTime - this.playTime_ + (this.playPosition_ || 0);
            if (this.playPosition_ > this.buffer.duration) {
                this.playPosition_ = 0;
            }
            this.source.noteOff(0);
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

