goog.provide('lime.webgl');

goog.require('lime.webgl.GLController');
goog.require('lime.webgl.Buffer');
goog.require('lime.webgl.Program');

// many algorithms are directly ported from:
// sylvester http://sylvester.jcoglan.com/
// glMatrix http://code.google.com/p/glmatrix/
// many algorithms non optimized. not useful for production yet.

lime.webgl.PRECISION = 1e-6;

/**
 * @constructor
 */
lime.webgl.V = function(size,opt_type,opt_data){
    if(!arguments.length) return;
    if(!(this instanceof lime.webgl.V)){
        var self = new lime.webgl.V;
        lime.webgl.V.apply(self,arguments);
        return self;
    }
    this.size = size;
    var type = goog.isFunction(opt_type) ? opt_type : Float32Array;
    this.type = type;
    this.elements = new type(size);
    lime.webgl.count++;
    if(opt_data){
        var n = opt_data.length;
        while(--n>=0){
            this.elements[n] = opt_data[n];
        }
    }
    return this;
}

lime.webgl.V.prototype.set = function(data){
    this.elements.set(data);
    return this;
}

lime.webgl.V.prototype.modulus =  function() {
    return Math.sqrt(this.dot(this));
};

lime.webgl.V.prototype.dot = function(vector){
    var i, product = 0, n = this.size;
    if (n != vector.size) { return null; }
    while(--n>=0){
        product += this.elements[n] * vector.elements[n];
    }
    return product;
};

lime.webgl.V.prototype.equals = function(vector) {
    var n = this.size;
    if (n != vector.size) { return false; }
    while(--n>=0) {
        if (Math.abs(this.elements[n] - vector.elements[n]) > lime.webgl.PRECISION) { return false; }
    }
    return true;
};

lime.webgl.V.prototype.clone = function(){
    var v = new lime.webgl.V(this.size,this.type), n = this.size;
    while(--n>=0){
        v.elements[n] = this.elements[n];
    }
    return v;
};

lime.webgl.V.prototype.normalize = function() {
    var r = this.modulus(), n = this.size;
    if (r>0) while(--n>=0){
        this.element[n] /= r;
    }
    return this;
};

lime.webgl.V.prototype.difference = function(vector){
    var n = this.size, v = new lime.webgl.V(n);
    if (n != vector.size) { return null; }
    while(--n>=0) {
        v[n] = this.elements[n]-vector.elements[n];
    }
    return v;
};

lime.webgl.V.prototype.sum = function(vector){
    var n = this.size, v = new lime.webgl.V(n);
    if (n != vector.size) { return null; }
    while(--n>=0) {
        v[n] = this.elements[n]+vector.elements[n];
    }
    return v;
};

lime.webgl.V.prototype.scale = function(scale){
    var n = this.size;
    while(--n>=0) {
        this.elemnts[n] *= scale;
    }
    return this;
};

lime.webgl.V.prototype.negate = function(){
    return this.scale(-1);
};
/*
lime.webgl.V.prototype.multiply = function(vector){
    if (this.size != 3 || vector.length != 3) { return null; }
    var A = this.elements;
    return new lime.webgl.V(this.size, [
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
};*/

lime.webgl.V.prototype.multiply = function(m){
    var vec = this.elements,x = vec[0], y = vec[1], z = vec[2],mat = m.elements;

    vec[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
    vec[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
    vec[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];

    return this;
}

lime.webgl.V.prototype.save = function(){
    if(!this.history_){
        this.history_ = [];
        this.h_index_ = 0;
    }
    if(this.history_.length<=this.h_index_){
        this.history_.push(new this.type(this.elements));
    }
    else {
        this.history_[this.h_index_].set(this.elements);
    }
    
    this.h_index_++;
    return this;
};

lime.webgl.V.prototype.restore = function(){
    if(!this.history_ || !this.history_.length) return;
    this.h_index_--;
    var temp = this.elements;
    this.elements = this.history_[this.h_index_];
    this.history_[this.h_index_] = temp;
};

lime.webgl.V.prototype.toArray = function(){
    var arr = [], n=this.size, i;
    for(i=0;i<n;i++){
        arr[i] = this.elements[i];
    }
    return arr;
}

lime.webgl.V.makeSubVector = function(parent,size,type){
    var constructor = function(){
        if(arguments.length==1 && arguments[0]==-1) return;
        if(!(this instanceof constructor)){
            var self = new constructor(-1);
            constructor.apply(self,arguments);
            return self;
        }
        var param = goog.array.toArray(arguments);
        parent.call(this,size,type,param);
        return this;
    };
    goog.inherits(constructor,parent);
    return constructor;
}

lime.webgl.V2 = lime.webgl.V.makeSubVector(lime.webgl.V,2);
lime.webgl.V3 = lime.webgl.V.makeSubVector(lime.webgl.V,3);
lime.webgl.V4 = lime.webgl.V.makeSubVector(lime.webgl.V,4);


lime.webgl.M = function(size,opt_type,opt_data){
    if(!arguments.length) return;
    if(!(this instanceof lime.webgl.M)){
        var self = new lime.webgl.M;
        lime.webgl.M.apply(self,arguments);
        return self;
    }
    
    lime.webgl.V.call(this,size*size,opt_type);
    this.msize = size;
    
    this.set(opt_data);
    
    return this;
    
};
goog.inherits(lime.webgl.M,lime.webgl.V);

lime.webgl.M.prototype.set = function(opt_data){
    var r,c,size = this.msize;
    if(opt_data && opt_data.length){
        if(goog.isArray(opt_data[0])){
            for(r=0;r<size;r++){
                if(goog.isArray(opt_data[r]))
                for(c=0;c<size;c++){
                    if(goog.isDef(opt_data[r][c])){
                        this.elements[c*size+r] = opt_data[r][c];
                    }
                }
            }
        }
        else {
            for(r=0;r<size;r++){
            for(c=0;c<size;c++){
                if(goog.isDef(opt_data[r*size+c])){
                    this.elements[c*size+r] = opt_data[r*size+c];
                }
            }
            }
        }
        
    }
    return this;
}

lime.webgl.M.prototype.identity = function(){
    var n = this.msize;
    for(var c = 0;c<n; c++){
        for(var r=0;r<n; r++){
            this.elements[c*n+r] = c==r?1:0;
        }
    }
    return this;
};

lime.webgl.M.prototype.clone = function(){
    var v = new lime.webgl.M(this.msize,this.type), n = this.size;
    v.elements.set(this.elements);
    return v;
};


lime.webgl.M.prototype.translate = function(vec){
    if(vec.elements) vec = vec.elements;
    else if (!vec.length) vec = goog.array.toArray(arguments);
    
    var x = vec[0], y = vec[1], z = vec[2];
    var mat = this.elements;
    
    mat[12] += mat[0]*x + mat[4]*y + mat[8]*z;
	mat[13] += mat[1]*x + mat[5]*y + mat[9]*z;
	mat[14] += mat[2]*x + mat[6]*y + mat[10]*z;
	mat[15] += mat[3]*x + mat[7]*y + mat[11]*z;
    
    return this;
};

lime.webgl.M.prototype.scale = function(vec){
    if(vec.elements) vec = vec.elements;
    else if (!vec.length) vec = goog.array.toArray(arguments);
    
    var x = vec[0], y = vec[1] || x, z = vec[2] || 1;
    
    var mat = this.elements;
    mat[0]*=x;
	mat[1]*=x;
	mat[2]*=x;
	mat[3]*=x;
	mat[4]*=y;
	mat[5]*=y;
	mat[6]*=y;
	mat[7]*=y;
	mat[8]*=z;
	mat[9]*=z;
	mat[10]*=z;
	mat[11]*=z;
    return this;

}

lime.webgl.M.prototype.toArray = function(){
    var arr = [], n=this.msize, i,j;
    for(i=0;i<n;i++){
        arr.push([]);
        for(j=0;j<n;j++){
            arr[i].push(this.elements[j*n+i]);  
        }
    }
    return arr;
};



lime.webgl.M.prototype.rotate = function(theta,axis){
    if(this.msize<3){
           return this.set([
               [Math.cos(theta),-Math.sin(theta)],
               [Math.sin(theta),Math.cos(theta)]]);
     }
     if(axis.elements)
    axis = axis.elements; 
 	var x = axis[0], y = axis[1], z = axis[2];
    var len = x*x + y*y + z*z;
    if(len!=1){ // non normalized
        len = 1 / Math.sqrt(len);
        x *= len;
        y *= len;
        z *= len;
    }
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    
	var mat = this.elements;
	
    // Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	// Construct the elements of the rotation matrix
	var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
	var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
	var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;
	
	mat[0] = a00*b00 + a10*b01 + a20*b02;
	mat[1] = a01*b00 + a11*b01 + a21*b02;
	mat[2] = a02*b00 + a12*b01 + a22*b02;
	mat[3] = a03*b00 + a13*b01 + a23*b02;
	
	mat[4] = a00*b10 + a10*b11 + a20*b12;
	mat[5] = a01*b10 + a11*b11 + a21*b12;
	mat[6] = a02*b10 + a12*b11 + a22*b12;
	mat[7] = a03*b10 + a13*b11 + a23*b12;
	
	mat[8] = a00*b20 + a10*b21 + a20*b22;
	mat[9] = a01*b20 + a11*b21 + a21*b22;
	mat[10] = a02*b20 + a12*b21 + a22*b22;
	mat[11] = a03*b20 + a13*b21 + a23*b22;
	
	return this;
};



// Returns the determinant for square matrices
lime.webgl.M.prototype.determinant = function() {
    // Cache the matrix values (makes for huge speed increases!)
    var mat = this.elements;
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

    return  a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
            a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
            a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
            a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
            a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
            a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
};


// Returns true iff the matrix is singular
lime.webgl.M.prototype.isSingular = function() {
  return (this.determinant() === 0);
},

// Returns the inverse (if one exists) using Gauss-Jordan
// todo: seems buggy
lime.webgl.M.prototype.inverse = function() {
    // Cache the matrix values (makes for huge speed increases!)
    var mat = this.elements;
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

    var b00 = a00*a11 - a01*a10;
    var b01 = a00*a12 - a02*a10;
    var b02 = a00*a13 - a03*a10;
    var b03 = a01*a12 - a02*a11;
    var b04 = a01*a13 - a03*a11;
    var b05 = a02*a13 - a03*a12;
    var b06 = a20*a31 - a21*a30;
    var b07 = a20*a32 - a22*a30;
    var b08 = a20*a33 - a23*a30;
    var b09 = a21*a32 - a22*a31;
    var b10 = a21*a33 - a23*a31;
    var b11 = a22*a33 - a23*a32;

    // Calculate the determinant (inlined to avoid double-caching)
    var invDet = 1/(b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);

    mat[0] = (a11*b11 - a12*b10 + a13*b09)*invDet;
    mat[1] = (-a01*b11 + a02*b10 - a03*b09)*invDet;
    mat[2] = (a31*b05 - a32*b04 + a33*b03)*invDet;
    mat[3] = (-a21*b05 + a22*b04 - a23*b03)*invDet;
    mat[4] = (-a10*b11 + a12*b08 - a13*b07)*invDet;
    mat[5] = (a00*b11 - a02*b08 + a03*b07)*invDet;
    mat[6] = (-a30*b05 + a32*b02 - a33*b01)*invDet;
    mat[7] = (a20*b05 - a22*b02 + a23*b01)*invDet;
    mat[8] = (a10*b10 - a11*b08 + a13*b06)*invDet;
    mat[9] = (-a00*b10 + a01*b08 - a03*b06)*invDet;
    mat[10] = (a30*b04 - a31*b02 + a33*b00)*invDet;
    mat[11] = (-a20*b04 + a21*b02 - a23*b00)*invDet;
    mat[12] = (-a10*b09 + a11*b07 - a12*b06)*invDet;
    mat[13] = (a00*b09 - a01*b07 + a02*b06)*invDet;
    mat[14] = (-a30*b03 + a31*b01 - a32*b00)*invDet;
    mat[15] = (a20*b03 - a21*b01 + a22*b00)*invDet;
    return this;
};


lime.webgl.M.prototype.multiply = function(matrix){
    if(goog.isNumber(matrix)){
        return this.scale(matrix);
    }
    var mat = this.elements,mat2=matrix.elements;
    
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
	
	mat[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
	mat[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
	mat[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
	mat[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
	mat[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
	mat[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
	mat[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
	mat[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
	mat[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
	mat[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
	mat[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
	mat[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
	mat[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
	mat[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
	mat[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
	mat[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
	return this;
};

//2d skew
lime.webgl.M.prototype.skew = function(sx,sy){
    
    
    var mat = this.elements;
    
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var b00 = 1, b01 = Math.tan(sy), b02 = 0, b03 = 0;
    var b10 = Math.tan(sx), b11 = 1, b12 = 0, b13 = 0;
    var b20 = 0, b21 = 0, b22 = 1, b23 = 0;
    var b30 = 0, b31 = 0, b32 = 0, b33 = 1;
    
    mat[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
	mat[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
	mat[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
	mat[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
	mat[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
	mat[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
	mat[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
	mat[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
	mat[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
	mat[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
	mat[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
	mat[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
	mat[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
	mat[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
	mat[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
	mat[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;
	
	return this;
    
}

lime.webgl.M.prototype.transpose = function(){
    return  new lime.webgl.M(this.msize,this.type,this.elements);
};

lime.webgl.M2 = lime.webgl.V.makeSubVector(lime.webgl.M,2);
lime.webgl.M3 = lime.webgl.V.makeSubVector(lime.webgl.M,3);
lime.webgl.M4 = lime.webgl.V.makeSubVector(lime.webgl.M,4);


//
// gluLookAt
//
lime.webgl.lookAt = function(ex, ey, ez,
                    cx, cy, cz,
                    ux, uy, uz)
{
    var eye = lime.webgl.V3(ex, ey, ez);
    var center = lime.webgl.V3(cx, cy, cz);
    var up = lime.webgl.V3(ux, uy, uz);

    var z = eye.difference(center).normalize();
    var x = up.multiply(z).normalize();
    var y = z.multiply(x).normalize();

    var m = lime.webgl.M4(
                x.elements[0], x.elements[1], x.elements[2], 0,
                y.elements[0], y.elements[1], y.elements[2], 0,
                z.elements[0], z.elements[1], z.elements[2], 0,
                0,      0,      0,      1
            );

    var t = lime.webgl.M4(
                1, 0, 0, -ex,
                0, 1, 0, -ey,
                0, 0, 1, -ez,
                0, 0, 0, 1
            );
            
    return m.multiply(t);
}

//
// gluPerspective
//
lime.webgl.perspective = function(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return lime.webgl.frustum(xmin, xmax, ymin, ymax, znear, zfar);
};

//
// glFrustum
//
lime.webgl.frustum = function(left, right,bottom, top, znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);
    return lime.webgl.M4(
            X,  0,  A,  0,
            0,  Y,  B,  0,
            0,  0,  C,  D,
            0,  0,  -1, 0 );
}

//
// glOrtho
//
lime.webgl.ortho = function(left, right, bottom, top, znear, zfar)
{
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return lime.webgl.M4(
            2 / (right - left), 0, 0, tx,
            0, 2 / (top - bottom), 0, ty,
            0, 0, -2 / (zfar - znear), tz,
            0, 0, 0, 1 );
}

