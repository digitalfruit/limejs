/*
 * Jukebox
 * http://github.com/zynga/jukebox
 *
 * Copyright 2011, Zynga Inc.
 * Developed by Christoph Martens (@martensms)
 *
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/jukebox/master/MIT-LICENSE.txt
 *
 */

goog.provide('jukebox.Player');

/**
 * The first parameter @settings {Map} defines the settings of
 * the created instance which overwrites the {#defaults}.
 *
 * The second optional parameter @origin {Number} is a unique id of
 * another {jukebox.Player} instance, but it is only used internally
 * by the {jukebox.Manager} for creating and managing clones.
 * @constructor
 */
jukebox.Player = function(settings, origin) {

	this.id = ++jukebox.__jukeboxId;
	this.origin = origin || null;


	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	/**
	 * #break(jukebox.Manager)
	 */

	// Pseudo-Singleton to prevent double-initializaion
	if (!jukebox.manager) {
		jukebox.manager = new jukebox.Manager();
	}


	this.isPlaying = null;
	this.resource = null;


	// Get playable resources via Feature / Codec Detection
	if (Object.prototype.toString.call(jukebox.manager) === '[object Object]') {
		this.resource = jukebox.manager.getPlayableResource(this.settings['resources']);
	} else {
		this.resource = this.settings['resources'][0] || null;
	}


	if (this.resource === null) {
		throw "Your browser can't playback the given resources - or you have missed to include jukebox.Manager";
	} else {
		this.__init();
	}


	return this;

};


/**
 * @type {jukebox.Manager}
 */
jukebox.manager = null;

jukebox.__jukeboxId = 0;

jukebox.Player.prototype = {

	/*
	 * The defaults which are overwritten by the {#constructor}'s
	 * settings parameter.
	 *
	 * @resources contains an {Array} of File URL {String}s
	 * @spritemap is a Hashmap containing multiple @sprite-entry {Object}
	 *
	 * @autoplay is an optional {String} that autoplays a @sprite-entry
	 *
	 * @flashMediaElement is an optional setting that contains the
	 * relative URL {String} to the FlashMediaElement.swf for flash fallback.
	 *
	 * @timeout is a {Number} in milliseconds that is used if no "canplaythrough"
	 * event is fired on the Audio Node.
	 */
	defaults: {
		resources: [],
		autoplay: false,
		spritemap: {},
		flashMediaElement: './swf/FlashMediaElement.swf',
		timeout: 1000
	},


	/*
	 * PRIVATE API
	 */
	__addToManager: function(event) {

		if (this.__wasAddedToManager !== true) {
			jukebox.manager.add(this);
			this.__wasAddedToManager = true;
		}

	},

	/*
	__log: function(title, desc) {

		if (!this.__logElement) {
			this.__logElement = document.createElement('ul');
			document.body.appendChild(this.__logElement);
		}

		var that = this;
		window.setTimeout(function() {
			var item = document.createElement('li');
			item.innerHTML = '<b>' + title + '</b>: ' + (desc ? desc : '');
			that.__logElement.appendChild(item);
		}, 0);

	},

	__updateBuffered: function(event) {

		var buffer = this.context.buffered;

		if (buffer) {

			for (var b = 0; b < buffer.length; b++) {
				this.__log(event.type, buffer.start(b).toString() + ' / ' + buffer.end(b).toString());
			}

		}

	},
	*/


	__init: function() {

		var that = this,
			settings = this.settings,
			features = {},
			api;


		if (jukebox.manager && jukebox.manager.features !== undefined) {
			features = jukebox.manager.features;
		}

		// HTML5 Audio
		if (features.html5audio === true) {

			this.context = new Audio();
			this.context.src = this.resource;

			if (this.origin === null) {

				// This will add the stream to the manager's stream cache,
				// there's a fallback timeout if the canplaythrough event wasn't fired
				var addFunc = function(event){ that.__addToManager(event); };
				this.context.addEventListener('canplaythrough', addFunc, true);

				// Uh, Oh, What is it good for? Uh, Oh ...
				/*
					var bufferFunc = function(event) { that.__updateBuffered(event); };
					this.context.addEventListener('loadedmetadata', bufferFunc, true);
					this.context.addEventListener('progress', bufferFunc, true);
				*/

				// This is the timeout, we will penetrate the currentTime anyways.
				window.setTimeout(function(){
					that.context.removeEventListener('canplaythrough', addFunc, true);
					addFunc('timeout');
				}, settings.timeout);

			}

			// old WebKit
			this.context.autobuffer = true;

			// new WebKit
			this.context.preload = true;


			// FIXME: This is the hacky API, but got no more generic idea for now =/
			for (api in this.HTML5API) {
				this[api] = this.HTML5API[api];
			}

			if (features.channels > 1) {

				if (settings['autoplay'] === true) {
					this.context.autoplay = true;
				} else if (settings['spritemap'][settings['autoplay']] !== undefined) {
					this.play(settings['autoplay']);
				}

			} else if (features.channels === 1 && settings['spritemap'][settings['autoplay']] !== undefined) {

				this.backgroundMusic = settings['spritemap'][settings['autoplay']];
				this.backgroundMusic.started = Date.now ? Date.now() : +new Date();

				// Initial playback will do the trick for iOS' security model
				this.play(settings['autoplay']);

			}

			// Pause audio on screen timeout because it can't be controlled then.
			if (features.channels == 1 && settings.canPlayBackground !== true) {
				// This does not work in iOS < 5.0 and Windows Phone.
				// Calling audio.pause() after onbeforeunload event on Windows Phone may
				// remove all audio from the browser until you restart the device.
				window.addEventListener('pagehide', function() {
					if (that.isPlaying !== null) {
						that.pause();
						that.__wasAutoPaused = true;
					}
				});
				window.addEventListener('pageshow', function() {
					if (that.__wasAutoPaused) {
						that.resume();
						delete that._wasAutoPaused;
					}
				});
			}


		// Flash Audio
		} else if (features.flashaudio === true) {

			// FIXME: This is the hacky API, but got no more generic idea for now =/
			for (api in this.FLASHAPI) {
				this[api] = this.FLASHAPI[api];
			}

			var flashVars = [
				'id=jukebox-flashstream-' + this.id,
				'autoplay=' + settings['autoplay'],
				'file=' + goog.global['encodeURIComponent'](this.resource)
			];

			// Too much crappy code, have this in a crappy function instead.
			this.__initFlashContext(flashVars);

			if (settings['autoplay'] === true) {
				this.play(0);
			} else if (settings['spritemap'][settings['autoplay']]) {
				this.play(settings['autoplay']);
			}

		} else {

			throw "Your Browser does not support Flash Audio or HTML5 Audio.";

		}

	},

	/*
	 * This is not that simple, better code structure with a helper function
	 */
	__initFlashContext: function(flashVars) {

		var context,
			url = this.settings.flashMediaElement,
			p;

		var params = {
			'flashvars': flashVars.join('&'),
			'quality': 'high',
			'bgcolor': '#000000',
			'wmode': 'transparent',
			'allowscriptaccess': 'always',
			'allowfullscreen': 'true'
		};

		/*
		 * IE will only render a Shockwave Flash file if there's this crappy outerHTML used.
		 */
		if (navigator.userAgent.match(/MSIE/)) {

			context = document.createElement('div');

			// outerHTML only works in IE when context is already in DOM
			document.getElementsByTagName('body')[0].appendChild(context);


			var object = document.createElement('object');

			object.id = 'jukebox-flashstream-' + this.id;
			object.setAttribute('type', 'application/x-shockwave-flash');
			object.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
			object.setAttribute('width', '0');
			object.setAttribute('height', '0');


			// IE specific params
			params.movie = url + '?x=' + (Date.now ? Date.now() : +new Date());
			params.flashvars = flashVars.join('&amp;');



			for (p in params) {

				var element = document.createElement('param');
				element.setAttribute('name', p);
				element.setAttribute('value', params[p]);
				object.appendChild(element);

			}

			context.outerHTML = object.outerHTML;

			this.context = document.getElementById('jukebox-flashstream-' + this.id);


		/*
		 * This is the case for a cool, but outdated Browser
		 * ... like Netscape or so ;)
		 */
		} else {

			context = document.createElement('embed');
			context.id = 'jukebox-flashstream-' + this.id;
			context.setAttribute('type', 'application/x-shockwave-flash');
			context.setAttribute('width', '100');
			context.setAttribute('height', '100');

			params.play = false;
			params.loop = false;
			params.src = url + '?x=' + (Date.now ? Date.now() : +new Date());

			for (p in params) {
				context.setAttribute(p, params[p]);
			}

			document.getElementsByTagName('body')[0].appendChild(context);

			this.context = context;

		}

	},

	/*
	 * This is the background hack for iOS and other single-channel systems
	 * It allows playback of a background music, which will be overwritten by playbacks
	 * of other sprite entries. After these entries, background music continues.
	 *
	 * This allows us to trick out the iOS Security Model after initial playback =)
	 */
	backgroundHackForiOS: function() {

		if (this.backgroundMusic === undefined) {
			return;
		}

		var now = Date.now ? Date.now() : +new Date();

		if (this.backgroundMusic.started === undefined) {

			this.backgroundMusic.started = now;
			this.setCurrentTime(this.backgroundMusic['start']);

		} else {

			this.backgroundMusic.lastPointer = (( now - this.backgroundMusic.started) / 1000) % (this.backgroundMusic['end'] - this.backgroundMusic['start']) + this.backgroundMusic['start'];
			this.play(this.backgroundMusic.lastPointer);

		}

	},



	/*
	 * PUBLIC API
	 */

	/*
	 * This method will try to playback a given @pointer position of the stream.
	 * The @pointer position can be either a {String} of a sprite entry inside
	 * {#settings.spritemap} or a {Number} in seconds.
	 *
	 * The optional parameter @enforce is a {Boolean} that enforces the stream
	 * playback and avoids queueing or work delegation to a free clone.
	 */
	play: function(pointer, enforce) {

		if (this.isPlaying !== null && enforce !== true) {

			if (jukebox.manager !== undefined) {
				jukebox.manager.addToQueue(pointer, this.id);
			}

			return;

		}

		var spritemap = this.settings['spritemap'],
			newPosition;
		// Spritemap Entry Playback
		if (spritemap[pointer] !== undefined) {

			newPosition = spritemap[pointer]['start'];

		// Seconds-Position Playback (find out matching spritemap entry)
		} else if (typeof pointer === 'number') {

			newPosition = pointer;

			for (var s in spritemap) {

				if (newPosition >= spritemap[s]['start'] && newPosition <= spritemap[s]['end']) {
					pointer = s;
					break;
				}

			}

		}

		if (newPosition !== undefined && Object.prototype.toString.call(spritemap[pointer]) === '[object Object]') {

			this.isPlaying = this.settings['spritemap'][pointer];

			// Start Playback, stream position will be corrected by jukebox.Manager
			if (this.context.play) {
				this.context.play();
			}

			// Locking due to slow Implementation on Mobile Devices
			this.wasReady = this.setCurrentTime(newPosition);

		}

	},

	/*
	 * This method will stop the current playback and resets the pointer that is
	 * cached by {#pause} method calls.
	 *
	 * It automatically starts the backgroundMusic for single-stream environments.
	 */
	stop: function() {

		this.__lastPosition = 0; // reset pointer
		this.isPlaying = null;

		// Was a Background Music played already?
		if (this.backgroundMusic) {
			this.backgroundHackForiOS();
		} else {
			this.context.pause();
		}

		return true;

	},

	/*
	 * {Number} This method will pause the current playback and cache the current position
	 * that is used by {#resume} on its next call.
	 *
	 * It returns the last position {Number} in seconds, so that you can optionally
	 * use it in the {#resume} method call.
	 */
	pause: function() {

		this.isPlaying = null;

		this.__lastPosition = this.getCurrentTime();
		this.context.pause();

		return this.__lastPosition;

	},

	/*
	 * {Boolean} This method will resume playback. If the optional parameter @position
	 * {Number} is not used, it will try to playback the last cached position from the
	 * last {#pause} method call.
	 *
	 * If no @position and no cached position is available, it will start playback - no
	 * matter where the stream is currently at.
	 *
	 * It returns {True} if a cached position was used. If no given and no cached
	 * position was used for playback, it will return {False}
	 */
	resume: function(position) {

		position = typeof position === 'number' ? position : this.__lastPosition;

		if (position !== null) {

			this.play(position);
			this.__lastPosition = null;
			return true;

		} else {

			this.context.play();
			return false;

		}

	},



	/*
	 * HTML5 Audio API abstraction layer
	 */
	HTML5API: {

		/*
		 * {Number} This method will return the current volume as a {Number}
		 * from 0 to 1.0.
		 */
		getVolume: function() {
			return this.context.volume || 1;
		},

		/*
		 * This method will set the volume to a given @value that is a {Number}
		 * from 0 to 1.0.
		 */
		setVolume: function(value) {

			this.context.volume = value;

			// This is apparently only for mobile implementations
			if (Math.abs(this.context.volume - value) < 0.0001) {
				return true;
			}


			return false;

		},

		/*
		 * {Number} This method will return the current pointer position in
		 * the stream in seconds.
		 */
		getCurrentTime: function() {
			return this.context.currentTime || 0;
		},

		/*
		 * {Boolean} This method will set the current pointer position to a
		 * new @value {Number} in seconds.
		 *
		 * It returns {True} on success, {False} if the stream wasn't ready
		 * at the given stream position @value.
		 */
		setCurrentTime: function(value) {

			try {
				// DOM Exceptions are fired when Audio Element isn't ready yet.
				this.context.currentTime = value;
				return true;
			} catch(e) {
				return false;
			}

		}

	},



	/*
	 * Flash Audio API abstraction layer
	 */
	FLASHAPI: {

		/*
		 * {Number} This method will return the current volume of the stream as
		 * a {Number} from 0 to 1.0, considering the Flash JavaScript API is
		 * ready for access.
		 */
		getVolume: function() {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.getVolume === 'function') {
				return this.context.getVolume();
			}

			return 1;

		},

		/*
		 * {Boolean} This method will set the volume to a given @value which is
		 * a {Number} from 0 to 1.0. It will return {True} if the Flash
		 * JavaScript API is ready for access. It returns {False} if the Flash
		 * JavaScript API wasn't ready.
		 */
		setVolume: function(value) {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.setVolume === 'function') {
				this.context.setVolume(value);
				return true;
			}

			return false;

		},

		/*
		 * {Number} This method will return the pointer position in the stream in
		 * seconds.
		 *
		 * If the Flash JavaScript API wasn't ready, the pointer position is 0.
		 */
		getCurrentTime: function() {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.getCurrentTime === 'function') {
				return this.context.getCurrentTime();
			}

			return 0;

		},

		/*
		 * {Boolean} This method will set the pointer position to a given @value {Number}
		 * in seconds.
		 *
		 * It will return {True} if the Flash JavaScript API was ready. If not, it
		 * will return {False}.
		 */
		setCurrentTime: function(value) {

			// Avoid stupid exceptions, wait for JavaScript API to be ready
			if (this.context && typeof this.context.setCurrentTime === 'function') {
				return this.context.setCurrentTime(value);
			}

			return false;

		}

	}

};

