goog.provide('lime.audio.Audio');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('lime.userAgent');



/**
 * Audio stream object.
 * @constructor
 * @param {string} filePath without extension.
 * @param {Array.<string>} exts file extensions.
 * @param {number=} opt_volume loop the sound.
 * @param {boolean=} opt_loop loop the sound.
 * @extends {goog.Disposable}
 */
lime.audio.Audio = function(filePath, exts, opt_volume, opt_loop) {
  goog.base(this);
  /**
   * audio volume
   * @type {number}
   */
  this.volume = goog.isDef(opt_volume) ? opt_volume : 1;

  /**
   * Internal audio element
   * @type {HTMLAudioElement}
   * @protected
   */
  this.audio = /** @type {HTMLAudioElement} */ (document.createElement(
      'audio'));
  var codecs = {// Chart from jPlayer
    ogg: 'audio/ogg; codecs="vorbis"', //OGG
    wav: 'audio/wav; codecs="1"', // PCM
    webma: 'audio/webm; codecs="vorbis"', // WEBM
    mp3: 'audio/mpeg; codecs="mp3"', //MP3
    m4a: 'audio/mp4; codecs="mp4a.40.2"'// AAC / MP4
  };
  var ext;
  for (var i = 0; i < exts.length; ++i) {
    var codec = codecs[exts[i]];
    if (goog.DEBUG && !codec) {
      throw new Error('Invalid extension "' + exts[i] + '"');
    }
    if (this.audio.canPlayType(codec)) {
      ext = exts[i];
      break;
    }
  }
  if (ext) {
    this.audio.preload = 'auto';
    if (opt_loop) {
      this.audio.loop = true;
      // this.audio.autoplay = true;
    }
    this.audio.src = filePath + '.' + ext;
    this.audio.load();
    goog.events.listen(this.audio, 'ended', function(e) {
      this.dispatch_();
    }, false, this);
  } else {
    this.logger.warning('Audio codecs ' + JSON.stringify(exts) +
        ' not supported');
    this.audio = null;
  }

  /**
   * @type {Array.<Function, scope>}
   * @private
   */
  this.listeners_ = [];

};
goog.inherits(lime.audio.Audio, goog.Disposable);


/**
 * @protected
 * @type {goog.debug.Logger} logger.
 */
lime.audio.Audio.prototype.logger =
    goog.debug.Logger.getLogger('lime.audio.Audio');


/**
 * Dispatch listeners.
 * @private
 */
lime.audio.Audio.prototype.dispatch_ = function() {
  var listener = this.listeners_.shift();
  while (listener) {
    var fn = listener[0];
    var scope = listener[1];
    fn.call(scope);
    listener = this.listeners_.shift();
  }
};


/**
 * Play repeat.
 * @param {number} count number of times to play.
 * @param {number=} opt_volume volume.
 * @param {function(this: T)=} opt_cb callback on finish.
 * @param {T=} opt_scope scope to invoke cb in.
 * @template T
 */
lime.audio.Audio.prototype.repeat = function(count, opt_volume, opt_cb,
                                             opt_scope) {
  if (count < 1) {
    if (opt_cb) {
      opt_cb.call(opt_scope);
    }
  } else if (count == 1) {
    this.play(opt_volume, function() {
      if (opt_cb) {
        opt_cb.call(opt_scope);
      }
    });
  } else {
    this.play(opt_volume, function() {
      this.repeat(count - 1, opt_volume, opt_cb, opt_scope);
    }, this);
  }
};


/**
 * Play audio.
 * @param {number=} opt_volume volume.
 * @param {function(this: T)=} opt_cb callback on finish.
 * @param {T=} opt_scope scope to invoke cb in.
 * @template T
 */
lime.audio.Audio.prototype.play = function(opt_volume, opt_cb, opt_scope) {
  if (!this.audio) {
    if (opt_cb) {
      opt_cb.call(opt_scope);
    }
  } else {
    this.audio.volume = goog.isDef(opt_volume) ? opt_volume : this.volume;
    if (opt_cb) {
      this.listeners_.push([opt_cb, opt_scope]);
    }
    if (this.audio.loaded) {
      this.audio.currentTime = 0;
      this.audio.play();
    } else {
      this.audio.autoplay = true;
    }
  }
};


/**
 * Stop current playing audio.
 */
lime.audio.Audio.prototype.stop = function() {
  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
};


/**
 * @inheritDoc
 */
lime.audio.Audio.prototype.disposeInternal = function() {
  this.dispatch_();
  this.audio = null;
};


/**
 * List of audio objects.
 * @type {Object.<Array.<lime.audio.Audio>>}
 * @private
 */
lime.audio.Audio.audios_ = {};


/**
 * @define {number} maximun number of parallel audio elements.
 */
lime.audio.Audio.MAX_AUDIO = 5;


/**
 * Get an non-playing audio element from the pools.
 * @param {string} file_path without extension.
 * @param {Array.<string>} exts file extensions.
 * @param {number=} opt_volume loop the sound.
 * @return {lime.audio.Audio}
 */
lime.audio.Audio.get = function(file_path, exts, opt_volume) {
  if (!lime.audio.Audio.audios_[file_path]) {
    lime.audio.Audio.audios_[file_path] = [];
  }
  var audios = lime.audio.Audio.audios_[file_path];
  var idx = 0;
  var max = 0;
  for (var i = 0; i < audios.length; ++i) {
    var audio = audios[i];
    var ct = audio.audio.currentTime;
    if (ct == 0) {
      if (goog.isDef(opt_volume)) {
        audio.volume = opt_volume;
      }
      return audio;
    } else {
      if (ct > max) {
        idx = i;
        max = ct;
      }
    }
  }
  if (audios.length > lime.audio.Audio.MAX_AUDIO) {
    audios[idx].logger.warning('Maximum number of audio elements reach ' +
        'for ' + file_path + ', reusing a playing element.');
    if (goog.isDef(opt_volume)) {
      audios[idx].volume = opt_volume;
    }
    return audios[idx];
  } else {
    var audio = new lime.audio.Audio(file_path, exts, opt_volume);
    audios.push(audio);
    return audio;
  }
};

