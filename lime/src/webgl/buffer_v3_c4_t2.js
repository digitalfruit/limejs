goog.provide('lime.webgl.BufferV3C4T2');

lime.webgl.BufferV3C4T2 = function(type,opt_data){
    
    lime.webgl.Buffer.call(this,[{'float':3},{'float':4},{'float':2}]);
    
};
goog.inherits(lime.webgl.BufferV3C4T2,lime.webgl.Buffer);


