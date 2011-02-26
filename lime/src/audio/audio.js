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

    /**
     * Internal audio element
     * @type {audio}
     */
    this.baseElement = document.createElement('audio');
    this.baseElement.preload = true;
    this.baseElement.loop = false;

    if (goog.userAgent.GECKO && (/\.mp3$/).test(filePath)) {
        filePath = filePath.replace(/\.mp3$/, '.ogg');
    }

    this.baseElement.src = filePath;
    this.baseElement.load();

    this.loadInterval = setInterval(goog.bind(this.loadHandler_, this), 10);

    this.loaded_ = false;
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
    return this.playing_;
};

/**
 * Start playing the audio
 */
lime.audio.Audio.prototype.play = function() {
    if (this.isLoaded() && !this.isPlaying()) {
        this.baseElement.play();
        this.playing_ = true;
    }
};

/**
 * Stop playing the audio
 */
lime.audio.Audio.prototype.stop = function() {
    if (this.isPlaying()) {
        this.baseElement.pause();
        this.playing_ = false;
    }
};


