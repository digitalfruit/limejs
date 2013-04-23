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

goog.provide('jukebox.Manager');
goog.require('jukebox.Player');

/**
 * This is the transparent jukebox.Manager that runs in the background.
 * You shouldn't have to call this constructor, only if you want to overwrite the
 * defaults for having an own gameloop.
 *
 * The first parameter @settings {Map} overwrites the {#defaults}.
 * @constructor
 */
jukebox.Manager = function(settings) {

	this.features = {};
	this.codecs = {};

	// Correction, Reset & Pause
	this.__players = {};
	this.__playersLength = 0;

	// Queuing functionality
	this.__clones = {};
	this.__queue = [];


	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}


	this.__detectFeatures();


	// If you don't want to use an own game loop
	if (this.settings.useGameLoop === false) {

		jukebox.Manager.__initialized = window.setInterval(function() {
			jukebox.manager.loop();
		}, 20);

	} else {
		jukebox.Manager.__initialized = true;
	}

};

jukebox.Manager.prototype = {

	/*
	 * The defaults {Map} consist of two different flags.
	 *
	 * The @useFlash {Boolean} which is available for enforcing flash
	 * usage and the @useGameLoop {Boolean} that allows you to use your
	 * own game loop for avoiding multiple intervals inside the Browser.
	 *
	 * If @useGameLoop is set to {True} you will have to call the
	 * {#jukebox.Manager.loop} method everytime in your gameloop.
	 */
	defaults: {
		useFlash: false,
		useGameLoop: false
	},
	__detectFeatures: function() {

		/*
		 * HTML5 Audio Support
		 */
		var audio = goog.global['Audio'] && new goog.global['Audio']();
		if (audio && audio['canPlayType'] && this.settings.useFlash === false) {
			// Codec Detection MIME List
			var mimeList = [
				// e = extension, m = mime type
				{ e: '3gp', m: [ 'audio/3gpp', 'audio/amr' ] },
				// { e: 'avi', m: 'video/x-msvideo' }, // avi container allows pretty everything, impossible to detect -.-
				{ e: 'aac', m: [ 'audio/aac', 'audio/aacp' ] },
				{ e: 'amr', m: [ 'audio/amr', 'audio/3gpp' ] },
				// iOS aiff container that uses IMA4 (4:1 compression) on diff
				{ e: 'caf', m: [ 'audio/IMA-ADPCM', 'audio/x-adpcm', 'audio/x-aiff; codecs="IMA-ADPCM, ADPCM"' ] },
				{ e: 'm4a', m: [ 'audio/mp4', 'audio/mp4; codecs="mp4a.40.2,avc1.42E01E"', 'audio/mpeg4', 'audio/mpeg4-generic', 'audio/mp4a-latm', 'audio/MP4A-LATM', 'audio/x-m4a' ] },
				{ e: 'mp3', m: [ 'audio/mp3', 'audio/mpeg', 'audio/mpeg; codecs="mp3"', 'audio/MPA', 'audio/mpa-robust' ] }, // mpeg was name for mp2 and mp3! avi container was mp4/m4a
				{ e: 'mpga', m: [ 'audio/MPA', 'audio/mpa-robust', 'audio/mpeg', 'video/mpeg' ] },
				{ e: 'mp4', m: [ 'audio/mp4', 'video/mp4' ] },
				{ e: 'ogg', m: [ 'application/ogg', 'audio/ogg', 'audio/ogg; codecs="theora, vorbis"', 'video/ogg', 'video/ogg; codecs="theora, vorbis"' ] },
				{ e: 'wav', m: [ 'audio/wave', 'audio/wav', 'audio/wav; codecs="1"', 'audio/x-wav', 'audio/x-pn-wav' ] },
				{ e: 'webm', m: [ 'audio/webm', 'audio/webm; codecs="vorbis"', 'video/webm' ] }
			];

			var mime, extension;
			for (var m = 0, l = mimeList.length; m < l; m++) {

				extension = mimeList[m].e;

				if (mimeList[m].m.length && typeof mimeList[m].m === 'object') {

					for (var mm = 0, mml = mimeList[m].m.length; mm < mml; mm++) {

						mime = mimeList[m].m[mm];

						// Supported Codec was found for Extension, so skip redundant checks
						if (audio['canPlayType'](mime) !== "") {
							this.codecs[extension] = mime;
							break;

						// Flag the unsupported extension (that it is also not supported for Flash Fallback)
						} else if (!this.codecs[extension]) {
							this.codecs[extension] = false;
						}

					}

				}

				// Go, GC, Go for it!
				mime = null;
				extension = null;

			}

			// Browser supports HTML5 Audio API theoretically, but support depends on Codec Implementations
			this.features.html5audio = !!(this.codecs['mp3'] || this.codecs['ogg'] || this.codecs['webm'] || this.codecs['wav']);

			// Default Channel Amount is 8, known to work with all Browsers
			this.features.channels = 8;

			// Detect Volume support
			audio.volume = 0.1337;
			this.features.volume = !!(Math.abs(audio.volume - 0.1337) < 0.0001);


			// FIXME: HACK, but there's no way to detect these crappy implementations
			if (
				// navigator.userAgent.match(/MSIE 9\.0/) ||
				navigator.userAgent.match(/iPhone|iPod|iPad|IEMobile/i)) {
				this.features.channels = 1;
				// Resetting volume because Windows Phone uses single control for all Audio elements.
				audio.volume = 1;
			}

		}



		/*
		 * Flash Audio Support
		 * Hint: All Android devices support Flash, even Android 1.6 ones
		 */
		this.features.flashaudio = !!navigator.mimeTypes['application/x-shockwave-flash'] || !!navigator.plugins['Shockwave Flash'] || false;

		// Internet Explorer
		if (window.ActiveXObject){
			try {
				var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.10');
				this.features.flashaudio = true;
			} catch(e) {
				// Throws an error if the version isn't available
			}
		}

		// Allow enforce of Flash Usage
		if (this.settings.useFlash === true) {
			this.features.flashaudio = true;
		}

		if (this.features.flashaudio === true) {

			// Overwrite Codecs only if there's no HTML5 Audio support
			if (!this.features.html5audio) {

				// Known to work with every Flash Implementation
				this.codecs['mp3'] = 'audio/mp3';
				this.codecs['mpga'] = 'audio/mpeg';
				this.codecs['mp4'] = 'audio/mp4';
				this.codecs['m4a'] = 'audio/mp4';


				// Flash Runtime on Android also supports GSM codecs, but impossible to detect
				this.codecs['3gp'] = 'audio/3gpp';
				this.codecs['amr'] = 'audio/amr';


				// TODO: Multi-Channel support on ActionScript-side
				this.features.volume = true;
				this.features.channels = 1;

			}

		}

	},


	__getPlayerById: function(id) {

		if (this.__players && this.__players[id] !== undefined) {
			return this.__players[id];
		}

		return null;

	},

	__getClone: function(origin, settings) {

		// Search for a free clone
		for (var cloneId in this.__clones) {

			var clone = this.__clones[cloneId];
			if (
				clone.isPlaying === null
				&& clone.origin === origin
			) {
				return clone;
			}

		}


		// Create a new clone
		if (Object.prototype.toString.call(settings) === '[object Object]') {

			var cloneSettings = {};
			for (var s in settings) {
				cloneSettings[s] = settings[s];
			}

			// Clones just don't autoplay. Just don't :)
			cloneSettings.autoplay = false;

			var newClone = new jukebox.Player(cloneSettings, origin);
			newClone.isClone = true;
			newClone.wasReady = false;

			this.__clones[newClone.id] = newClone;

			return newClone;

		}

		return null;

	},



	/*
	 * PUBLIC API
	 */

	/*
	 * This method is the stream-correction sound loop.
	 *
	 * In case you have overwritten the {jukebox.Manager} instance
	 * by yourself (with calling the constructor) and in case you
	 * have set the #settings.useGameLoop to {True}, you will have to
	 * call this method every time inside your gameloop.
	 */
	loop: function() {

		// Nothing to do
		if (
			this.__playersLength === 0
			// || jukebox.Manager.__initialized !== true
		) {
			return;
		}


		// Queue Functionality for Clone-supporting environments
		if (
			this.__queue.length
			&& this.__playersLength < this.features.channels
		) {

			var queueEntry = this.__queue[0],
				originPlayer = this.__getPlayerById(queueEntry.origin);

			if (originPlayer !== null) {

				var freeClone = this.__getClone(queueEntry.origin, originPlayer.settings);

				// Use free clone for playback
				if (freeClone !== null) {

					if (this.features.volume === true) {
						var originPlayer = this.__players[queueEntry.origin];
						originPlayer && freeClone.setVolume(originPlayer.getVolume());
					}

					this.add(freeClone);
					freeClone.play(queueEntry.pointer, true);

				}

			}

			// Remove Queue Entry. It's corrupt if nothing happened.
			this.__queue.splice(0, 1);

			return;


		// Queue Functionality for Single-Mode (iOS)
		} else if (
			this.__queue.length
			&& this.features.channels === 1
		) {

			var queueEntry = this.__queue[0],
				originPlayer = this.__getPlayerById(queueEntry.origin);

			if (originPlayer !== null) {
				originPlayer.play(queueEntry.pointer, true);
			}

			// Remove Queue Entry. It's corrupt if nothing happened
			this.__queue.splice(0, 1);

		}



		for (var id in this.__players) {

			var player = this.__players[id],
				playerPosition = player.getCurrentTime() || 0;


			// Correction
			if (player.isPlaying && player.wasReady === false) {

				player.wasReady = player.setCurrentTime(player.isPlaying['start']);

			// Reset / Stop
			} else if (player.isPlaying && player.wasReady === true){

				if (playerPosition > player.isPlaying['end']) {

					if (player.isPlaying['loop'] === true) {
						player.play(player.isPlaying['start'], true);
					} else {
						player.stop();
					}

				}


			// Remove Idling Clones
			} else if (player.isClone && player.isPlaying === null) {

				this.remove(player);
				continue;


			// Background Music for Single-Mode (iOS)
			} else if (player.backgroundMusic !== undefined && player.isPlaying === null) {

				if (playerPosition > player.backgroundMusic['end']) {
					player.backgroundHackForiOS();
				}

			}

		}


	},

	/*
	 * {String|Null} This method will check a @resources {Array} for playable resources
	 * due to codec and feature detection.
	 *
	 * It will return a {String} containing the preferred resource and {Null} if no
	 * playable resources was found.
	 *
	 * Hint: The highest preferred is the 0-index in the @resources {Array}. The latest
	 * index is the one with lowest preference.
	 */
	getPlayableResource: function(resources) {

		if (Object.prototype.toString.call(resources) !== '[object Array]') {
			resources = [ resources ];
		}


		for (var r = 0, l = resources.length; r < l; r++) {

			var resource = resources[r],
				extension = resource.match(/\.([^\.]*)$/)[1];

			// Yay! We found a supported resource!
			if (extension && !!this.codecs[extension]) {
				return resource;
			}

		}

		return null;

	},

	/*
	 * {Boolean} This method will add a @player {jukebox.Player} instance to the stream-correction
	 * sound loop.
	 *
	 * It will return {True} if the {jukebox.Player} instance was successfully added
	 * and {False} if the @player was an invalid parameter.
	 */
	add: function(player) {

		if (
			player instanceof jukebox.Player
			&& this.__players[player.id] === undefined
		) {
			this.__playersLength++;
			this.__players[player.id] = player;
			return true;
		}

		return false;

	},

	/*
	 * {Boolean} This method will remove a @player {jukebox.Player} instance from
	 * the stream-correction sound loop.
	 *
	 * It will return {True} if the {jukebox.Player} instance was successfully removed
	 * and {False} if the @player was an invalid parameter.
	 */
	remove: function(player) {

		if (
			player instanceof jukebox.Player
			&& this.__players[player.id] !== undefined
		) {
			this.__playersLength--;
			delete this.__players[player.id];
			return true;
		}

		return false;

	},

	/*
	 * This method is kindof public, but only used internally
	 *
	 * DON'T USE IT!
	 */
	addToQueue: function(pointer, playerId) {

		if (
			(typeof pointer === 'string' || typeof pointer === 'number')
			&& this.__players[playerId] !== undefined
		) {

			this.__queue.push({
				pointer: pointer,
				origin: playerId
			});

			return true;

		}

		return false;

	}

};

