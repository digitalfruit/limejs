/*
 * Jukebox
 * http://github.com/zynga/jukebox
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/jukebox/master/MIT-LICENSE.txt
 *
 */


package
{

	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.TimerEvent;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundLoaderContext;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	import flash.utils.Timer;

	public class AudioElement {
		
		private var _sound:Sound;
		private var _soundTransform:SoundTransform;
		private var _soundChannel:SoundChannel;
		private var _soundLoaderContext:SoundLoaderContext;
		
		private var _file:String = "";
		private var _autoplay:Boolean = true;
		private var _currentTime:Number = 0;
		private var _isPlaying:Boolean = false;



		public function AudioElement(file:String, autoplay:Boolean) {

			_file = file;
			_autoplay = autoplay;

			_sound = new Sound();
			_sound.load(new URLRequest(_file));

			_soundTransform = new SoundTransform();
			_soundLoaderContext = new SoundLoaderContext();

			if (autoplay) {
				this.play();
			}

		}

		/*
		 * PRIVATE API and EVENT HANDLER
		 */
		private function soundCompleteHandler(e:Event):void {
			_currentTime = 0;
			_isPlaying = false;			
		}



		/*
		 * PUBLIC API
		 */
		public function play():void {
			// Only Single Channel Mode.
			// Otherwise multiple play() calls will cause a difference to HTML5 Audio API
			// ... and start multiple playbacks that won't be able to be stopped.
			if (_soundChannel === null) {
				_soundChannel = _sound.play(_currentTime, 0, _soundTransform);
				_soundChannel.removeEventListener(Event.SOUND_COMPLETE, soundCompleteHandler);
				_soundChannel.addEventListener(Event.SOUND_COMPLETE, soundCompleteHandler);	
			}
			_isPlaying = true;
		}

		public function pause():void {
			if (_soundChannel !== null) {
				_currentTime = _soundChannel.position;
				_soundChannel.stop();
			}
			_isPlaying = false;
		}
		
		public function stop():void {
			if (_soundChannel !== null) {
				_soundChannel.stop();
				_soundChannel = null;
			}
			_isPlaying = false;
		}

		public function getCurrentTime():Number {
			var retValue:Number = _currentTime;
			if (_soundChannel !== null) {
				retValue = _soundChannel.position / 1000;
			}
			return retValue;
		}
		
		public function setCurrentTime(pointer:Number):Boolean {
			if (_sound !== null) {
				
				_currentTime = Math.min(_sound.length, pointer * 1000);
				
				if (_isPlaying) {
					this.stop();
					this.play();
				}
			
			}

			return true;
		}

		public function setVolume(value:Number):void {
			// HTML5 Audio can't have more than 100% loudness. Flash can.
			_soundTransform.volume = Math.min(1.0, value);

			if (_soundChannel !== null) {
				_soundChannel.soundTransform = _soundTransform;
			}
		}

		public function getVolume():Number {
		
			if (_soundTransform !== null) {
				return _soundTransform.volume;
			}

			return 1;

		}

	}
	
}

