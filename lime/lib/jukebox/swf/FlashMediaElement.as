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

	// IMPORTANT: Include this line when you build it from source directly without having a project folder
	// import AudioElement.as;

	import flash.display.*;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
	import flash.media.*;
	import flash.net.*;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.system.*;
	import flash.text.*;
	import flash.utils.Timer;

	public class FlashMediaElement extends Sprite {

		private var _params:Object;
		private var _file:String;
		private var _autoplay:Boolean;

		private var _audioElement:AudioElement;

		public function FlashMediaElement() {
			
			// allow this player to be called from different HTML URLs
			Security.allowDomain("*");

			_params = LoaderInfo(this.root.loaderInfo).parameters;

			_file = _params['file'] || '';
			_autoplay = (_params['autoplay'] !== 'false') ? true : false;

			_audioElement = new AudioElement(_file, _autoplay);

			try {

				ExternalInterface.addCallback('play', function():void {
					_audioElement.play();
				});

				ExternalInterface.addCallback('pause', function():void {
					_audioElement.pause();
				});

				ExternalInterface.addCallback('stop', function():void {
					_audioElement.stop();
				});

				ExternalInterface.addCallback('getCurrentTime', function():Number {
					return _audioElement.getCurrentTime();
				});

				ExternalInterface.addCallback('setCurrentTime', function(pointer:Number):Boolean {
					return _audioElement.setCurrentTime(pointer);
				});

				ExternalInterface.addCallback('getVolume', function():Number {
					return _audioElement.getVolume();
				});

				ExternalInterface.addCallback('setVolume', function(value:Number):void {
					_audioElement.setVolume(value);
				});

			} catch (error:SecurityError) {
				throw "Security Error: " + error.message + "\n";
			} catch (error:Error) {
				throw "Error: " + error.message + "\n";
			}
			
		}		
	}
}

