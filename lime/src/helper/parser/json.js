goog.provide('lime.parser.JSON');

goog.require('goog.math.Rect');
goog.require('goog.math.Vec2');
goog.require('goog.math.Size');

(function(){


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
        
        dict[i] = [new  goog.math.Rect(frame['frame']['x'],frame['frame']['y'],w,h),
            new goog.math.Vec2(frame['spriteSourceSize']['x'],frame['spriteSourceSize']['y']),
            new goog.math.Size(frame['sourceSize']['w'],frame['sourceSize']['h']),frame['rotated']
            ];
    }
    
    return dict;
};

})();