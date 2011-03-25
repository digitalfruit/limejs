goog.provide('lime.webgl.GLController');

goog.require('lime.webgl.Program');

lime.webgl.GLController = function(opt_element){
    var element = opt_element;
    if(!element){
        element = document.createElement('canvas');
        element.width = 400;
        element.height = 400;
    }
    else if(goog.isString(element)){
        element = document.getElementById(element);
    }
    
    this.element = element;
    
    var gl;
    try {
      gl = element.getContext("webgl");
    } catch(e) {}
    if (!gl) {
        try {
        gl = element.getContext("experimental-webgl");
        } catch(e) {}
    }
    if(!gl){   
        console.warn("Could not initialise WebGL, sorry :-(");
        this.gl = null;
        return;
    }
    
    
    this.element.glcontroller_ = this;
    this.gl = gl;
    this.setSize(element.width,element.height);

};

lime.webgl.GLController.forCanvas = function(element){
    if(goog.isString(element)) element = document.getElementById(element);
    
    return element.glcontroller_ || new lime.webgl.GLController(element);
};

lime.webgl.GLController.prototype.getSize = function(){
    return this.size_;
}

lime.webgl.GLController.prototype.setSize = function(value){
    if (arguments.length == 2) {
        value = new goog.math.Size(arguments[0], arguments[1]);
    }
    this.size_ = value;
    if(this.element.width!=value.width || this.element.height!=value.height){
        this.element.width = value.width;
        this.element.height = value.height;
        /* this.gl.canvas.width = value.width;
        this.gl.canvas.height = value.height;*/
        this.gl.viewport(0, 0, value.width, value.height);
    }
};

lime.webgl.GLController.prototype.aspectRatio = function(){
    return this.getSize().aspectRatio();
}

lime.webgl.GLController.prototype.makeProgram = function(){
    var p = new lime.webgl.Program(this.gl);
    return p;
};
lime.webgl.GLController.prototype.flush = function(){
   // this.element.getContext('2d').clearColor(0,0,0,0);

     //this.element.getContext('2d').drawImage(this.gl.canvas,0,0,this.gl.canvas.width,this.gl.canvas.height);
}