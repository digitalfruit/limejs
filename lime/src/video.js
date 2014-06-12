goog.provide('lime.Video');
goog.provide('lime.Renderer.DOM.VIDEO');
goog.provide('lime.Renderer.CANVAS.VIDEO');

goog.require('lime.Node');
goog.require('goog.dom');


lime.Video = function () {
    goog.base(this);

    this.url_ = null;
    this.videoElement_ = null;
    this.isPlaying_ = false;
    this._urlIsDirty = false;
};

goog.inherits(lime.Video, lime.Node);

lime.Video.prototype.id = 'video';

lime.Video.prototype.setVideoUrl = function (url) {
    this.url_ = url;
    this._urlIsDirty = true;

    this.setDirty(lime.Dirty.CONTENT, 0);
    return this;
};

lime.Video.prototype.getVideoUrl = function () {
    return this.url_;
};

lime.Video.prototype.playVideo = function () {
    this._shouldPlayNextFrame = true;
    this.setDirty(lime.Dirty.CONTENT, 0);
};

lime.Video.prototype.loadVideo_ = function () {
    console.log("VIDEO - PLAYING VIDEO");

    this.makeVideoElement_();
};

lime.Video.prototype.makeVideoElement_ = function () {

    if (!this.videoElement_) {
        this.videoElement_ = goog.dom.htmlToDocumentFragment('<video webkit-playsinline autobuffer preload="auto" width="320" height="240" />');

        this.videoElement_.muted = this.muted_;

        if (this.muted_) {
            this.videoElement_.muted = true;
            this.videoElement_.volume = 0;
        }
        else {
            this.videoElement_.muted = false;
            this.videoElement_.volume = 1;
        }

        this._addVideoListeners();

    }
};


lime.Video.prototype._addVideoListeners = function () {
    var self = this;

    if (goog.isDefAndNotNull(this.videoElement_)) {

        goog.events.listen(this.videoElement_, 'abort', function () {

            self.dispatchEvent({type: 'VideoAbort'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'canplay', function () {

            self.dispatchEvent({type: 'VideoCanPlay'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'canplaythrough', function () {

            self.dispatchEvent({type: 'VideoCanPlayThrough'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'durationchange', function () {

            self.dispatchEvent({type: 'VideoDurationChange'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'emptied', function () {

            self.dispatchEvent({type: 'VideoEmptied'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'ended', function () {

            self.isPlaying_ = false;
            self.dispatchEvent({type: 'VideoEnded'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'error', function () {

            self.dispatchEvent({type: 'VideoError'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'loadeddata', function () {

            self.dispatchEvent({type: 'VideoLoadedData'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'loadedmetadata', function () {

            self.dispatchEvent({type: 'VideoLoadedMetaData'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'loadstart', function () {

            self.dispatchEvent({type: 'VideoLoadStart'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'pause', function () {

            self.dispatchEvent({type: 'VideoPause'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'play', function () {

            this.setDirty(lime.Dirty.CONTENT, 0);
            self.isPlaying_ = true;

            self.dispatchEvent({type: 'VideoPlay'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'playing', function () {

            self.isPlaying_ = true;

            self.dispatchEvent({type: 'VideoPlaying'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'progress', function () {

            self.dispatchEvent({type: 'VideoProgress'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'ratechange', function () {

            self.dispatchEvent({type: 'VideoRateChange'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'seeked', function () {

            self.dispatchEvent({type: 'VideoSeeked'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'seeking', function () {

            self.dispatchEvent({type: 'VideoSeeking'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'stalled', function () {

            self.dispatchEvent({type: 'VideoStalled'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'suspend', function () {

            self.dispatchEvent({type: 'VideoSuspend'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'timeupdate', function () {

            self.dispatchEvent({type: 'VideoTimeUpdate'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'volumechange', function () {

            self.dispatchEvent({type: 'VideoVolumeChange'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'waiting', function () {

            self.dispatchEvent({type: 'VideoWaiting'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'webkitbeginfullscreen', function () {

            self.dispatchEvent({type: 'VideoWebkitBeginFullScreen'});
        }, false, self);

        goog.events.listen(this.videoElement_, 'webkitendfullscreen', function () {

            self.dispatchEvent({type: 'VideoWebkitEndFullScreen'});
        }, false, self);

    }
};

lime.Video.prototype._failed = function (e) {
    // video playback failed - log the reason
    switch (e.target.error.code) {
        case e.target.error.MEDIA_ERR_ABORTED:
            console.log('Video playback aborted.', 'VIDEO');
            break;
        case e.target.error.MEDIA_ERR_NETWORK:
            console.log('A network error caused the video download to fail. (partial download)', 'VIDEO');
            break;
        case e.target.error.MEDIA_ERR_DECODE:
            console.log('The video playback was aborted due to a corruption or because the video used features which are not supported.', 'VIDEO');
            break;
        case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.log('The video could not be loaded, either because the server or network failed or because the format is not supported.', 'VIDEO');
            break;
        default:
            console.log('An unknown error occurred.', 'VIDEO');
            break;
    }
};

lime.Video.prototype.supportedRenderers = [
    lime.Renderer.DOM.makeSubRenderer(lime.Renderer.DOM.VIDEO),
    lime.Renderer.CANVAS.makeSubRenderer(lime.Renderer.CANVAS.VIDEO)
];

lime.Renderer.DOM.VIDEO.draw = function (el) {

    if (!this.videoElement_) {
        this.makeVideoElement_();

        this.rootElement.appendChild(this.videoElement_);
    }


    if (this._urlIsDirty) {

        if (!this.iosSource) {
            this.iosSource = goog.dom.createElement('source');
            this.iosSource.type = 'video/mp4';
            this.iosSource.src = this.url_;
            this.videoElement_.appendChild(this.iosSource);
        }
        else if (this._urlIsDirty) {
            this.iosSource.src = this.url_;
        }

        if (this.androidSource) {
            this.androidSource = goog.dom.createElement('source');
            this.androidSource.src = this.url_;

            this.videoElement_.appendChild(this.androidSource);
        }

        this._urlIsDirty = false;

        // load the video
        this.videoElement_.load();
    }

    if (this._shouldPlayNextFrame && !this.isPlaying_) {
        this._shouldPlayNextFrame = false;
        this.videoElement_.play();
    }

    if (this.dirty_ && lime.Dirty.SCALE) {
        if (this.videoElement_) {
            console.log("Size is set");
            this.videoElement_.width = this.size_.width;
            this.videoElement_.height = this.size_.height;
        }

    }
};

lime.Renderer.CANVAS.VIDEO.draw = function (context) {

    if (!this.videoElement_) {
        this.makeVideoElement_();
    }

    if (this.videoElement_ && this._urlIsDirty) {


        if (!this.iosSource) {
            this.iosSource = goog.dom.createElement('source');
            this.iosSource.type = 'video/mp4';
            this.iosSource.src = this.url_;
            this.videoElement_.appendChild(this.iosSource);
        }
        else if (this._urlIsDirty) {
            this.iosSource.src = this.url_;
        }

        if (this.androidSource) {
            this.androidSource = goog.dom.createElement('source');
            this.androidSource.src = this.url_;

            this.videoElement_.appendChild(this.androidSource);
        }

        this._urlIsDirty = false;

        // load the video
        this.videoElement_.load();
    }

    if (this._shouldPlayNextFrame && !this.isPlaying_) {
        this._shouldPlayNextFrame = false;
        this.videoElement_.play();
    }

    if (this.videoElement_ && context) {

        var anchor = this.getAnchorPoint();
        var posX = - (anchor.x) * this.size_.width;
        var posY = - (anchor.y) * this.size_.height;

        context.drawImage(this.videoElement_, posX, posY, this.size_.width, this.size_.height);
    }

    if (this.isPlaying_) {
        this.setDirty(lime.Dirty.CONTENT, 0);
    }

};

