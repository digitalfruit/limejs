goog.provide('lime.parser.JSON');

goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
goog.require('goog.math.Size');

/**
 * A JSON sprite sheet parser.
 *
 * The JSON format is as follow:
 * <code>
 *   {
 *     "frames": {
 *       "walk1": {
 *         "frame": { "x": 0, "y": 0, "w": 72, "h": 96},
 *         "spriteSourceSize": { "x": 0, "y": 0},
 *         "sourceSize": { "w": 72, "h": 96 } ,
 *         "rotated": false,
 *       },
 *       "walk2": {
 *         "frame": { "x": 73, "y": 0, "w": 72, "h": 96},
 *         "spriteSourceSize": { "x": 0, "y": 0},
 *         "sourceSize": { "w": 72, "h": 96 } ,
 *         "rotated": false,
 *       }
 *     }
 *   }
 * </code>
 *
 * @param {object} data The JSON sprite sheet.
 * @function
 */
lime.parser.JSON = function(data){
    var dict = {};

    var root = data['frames'];

    for(var i in root){
        var frame = root[i];

        var w = frame['frame']['w'], h= frame['frame']['h'];

        if(frame['rotated']){
            h=frame['frame']['w'];
            w=frame['frame']['h'];
        }
        /*
         * {goog.math.Rect|number} rect Crop frame.
         * {goog.math.Vec2=} opt_offset Frame offset.
         * {goog.math.Size=} opt_size Frame size.
         * {boolean=} opt_rotated Is frame rotated.
         */
        var rect = new goog.math.Rect(frame['frame']['x'],frame['frame']['y'],w,h),
            opt_offset = new goog.math.Vec2(frame['spriteSourceSize']['x'],frame['spriteSourceSize']['y']),
            opt_size = new goog.math.Size(frame['sourceSize']['w'],frame['sourceSize']['h']),
            opt_rotated = frame['rotated'];

        dict[i] = [rect, opt_offset, opt_size, opt_rotated];
    }

    return dict;
};