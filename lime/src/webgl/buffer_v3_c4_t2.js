goog.provide('lime.webgl.BufferV3C4T2');

lime.webgl.BufferV3C4T2 = function(type,opt_data){
    
    lime.webgl.Buffer.call(this,[{'float':3},{'float':4},{'float':2}]);
    
};
goog.inherits(lime.webgl.BufferV3C4T2,lime.webgl.Buffer);

lime.webgl.BufferV3C4T2.prototype.setSize = function(s){
    lime.webgl.Buffer.prototype.setSize.call(this,s);
    
    this.vct = new Float32Array(this.buffer,0,this.size*this.elementSize);
}

