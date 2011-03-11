goog.provide('lime.webgl');

goog.require('lime.webgl.GLController');
goog.require('lime.webgl.Buffer');
goog.require('lime.webgl.Program');

// many algorithms are directly ported from sylvester
// http://sylvester.jcoglan.com/

lime.webgl.PRECISION = 1e-6;

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
    if(opt_data){
        var n = opt_data.length;
        while(--n>=0){
            this.elements[n] = opt_data[n];
        }
    }
    return this;
}

lime.webgl.V.prototype.set = function(data){
    
    var n = data.length;
    while(--n>=0){
        this.elements[n] = data[n];
    }
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

lime.webgl.V.prototype.invert = function(){
    return this.scale(-1);
};

lime.webgl.V.prototype.multiply = function(vector){
    if (this.size != 3 || vector.length != 3) { return null; }
    var A = this.elements;
    return new lime.webgl.V(this.size, [
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
};

lime.webgl.V.prototype.save = function(){
    var v = this.clone();
    if(!this.history_) this.history_ = [];
    this.history_.push(v);
};

lime.webgl.V.prototype.restore = function(){
    if(!this.history_ || !this.history_.length) return;
    var v = this.history_.pop();
    this.elements = v.elements;
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
    while(--n>=0){
        v.elements[n] = this.elements[n];
    }
    return v;
};

lime.webgl.M.prototype.Translation = function(v){
    if(v.elements) v = c.elements;
    else if (!v.length) v = goog.array.toArray(arguments);
    this.identity();
    var e = this.elements;
    if(this.msize==3){
        e[6] = v[0];
        e[7] = v[1];
    }
    else if(this.msize>3){
        e[12] = v[0];
        e[13] = v[1];
        e[14] = v[2];
    }
    return this;
};

lime.webgl.M.prototype.translate = function(){
  return this.multiply(new lime.webgl.M(this.msize).Translation(arguments));
};

lime.webgl.M.prototype.Scale = function(v){
    if(v.elements) v = c.elements;
    else if (!v.length) v = goog.array.toArray(arguments);
    this.identity();
    if(v.length==1){
        v[1]=v[2]=v[0];
    }
    var e = this.elements;
    e[0] = v[0];
    e[this.msize+1] = v[1];
    if(this.msize>3){ e[this.msize*2+2] = v[2];}
    return this;
};

lime.webgl.M.prototype.scale = function(){
    return this.multiply(new lime.webgl.M(this.msize).Scale(arguments));
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

lime.webgl.M.prototype.rotation = function(theta,a){
    if(!a || this.msize<3){
        return this.set([
            [Math.cos(theta),-Math.sin(theta)],
            [Math.sin(theta),Math.cos(theta)]]);
    }
    var axis = a.clone();
    if(axis.size!=3) return null;
    var mod = axis.modulus();
    var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    return this.identity().set([
         [t*x*x + c, t*x*y - s*z, t*x*z + s*y] ,
         [t*x*y + s*z, t*y*y + c, t*y*z - s*x] ,
         [t*x*z - s*y, t*y*z + s*x, t*z*z + c]]);
}

lime.webgl.M.prototype.rotate = function(theta,a){
   return this.multiply(new lime.webgl.M(this.msize).rotation(theta,a));
};


// Make the matrix upper (right) triangular by Gaussian elimination.
// This method only adds multiples of rows to other rows. No rows are
// scaled up or switched, and the determinant is preserved.
lime.webgl.M.prototype.toRightTriangular_ = function(array) {
  var M = array.slice(), els;
  var n = M.length, k = n, i, np, kp = M[0].length, p;
  do { i = k - n;
    if (M[i][i] == 0) {
      for (j = i + 1; j < k; j++) {
        if (M[j][i] != 0) {
          els = []; np = kp;
          do { p = kp - np;
            els.push(M[i][p] + M[j][p]);
          } while (--np);
          M[i] = els;
          break;
        }
      }
    }
    if (M[i][i] != 0) {
      for (j = i + 1; j < k; j++) {
        var multiplier = M[j][i] / M[i][i];
        els = []; np = kp;
        do { p = kp - np;
          // Elements with column numbers up to an including the number
          // of the row that we're subtracting can safely be set straight to
          // zero, since that's the point of this routine and it avoids having
          // to loop over and correct rounding errors later
          els.push(p <= i ? 0 : M[j][p] - M[i][p] * multiplier);
        } while (--np);
        M[j] = els;
      }
    }
  } while (--n);
 return M;
};

// Returns the determinant for square matrices
lime.webgl.M.prototype.determinant = function() {
  var M = this.toRightTriangular_(this.toArray());
  var det = M[0][0], n = M.length - 1, k = n, i;
  do { i = k - n + 1;
    det = det * M[i][i];
  } while (--n);
  return det;
};


// Returns true iff the matrix is singular
lime.webgl.M.prototype.isSingular = function() {
  return (this.determinant() === 0);
},

// Returns the inverse (if one exists) using Gauss-Jordan
// todo: seems buggy
lime.webgl.M.prototype.inverse = function() {
   if (this.isSingular()) { return null; }
   var ni = this.msize, ki = ni, i, j;
   var M = (this.augment_(this,new lime.webgl.M(this.msize).identity()));
   var np, kp = M[0].length, p, els, divisor;
   var inverse_elements = [], new_element;
   // Matrix is non-singular so there will be no zeros on the diagonal
   // Cycle through rows from last to first
   do { i = ni - 1;
     // First, normalise diagonal elements to 1
     els = []; np = kp;
     inverse_elements[i] = [];
     divisor = M[i][i];
     do { p = kp - np;
       new_element = M[i][p] / divisor;
       els.push(new_element);//console.log('a',p,ki)
       // Shuffle of the current row of the right hand side into the results
       // array as it will not be modified by later runs through this loop
       if (p >= ki) { /*console.log('in');*/inverse_elements[i].push(new_element); }
     } while (--np);
     M[i] = els;
     // Then, subtract this row from those above it to
     // give the identity matrix on the left hand side
     for (j = 0; j < i; j++) {
       els = []; np = kp;
       do { p = kp - np;
         els.push(M[j][p] - M[i][p] * M[j][i]);
       } while (--np);
       M[j] = els;
     }
   } while (--ni);
   return this.set(inverse_elements);
};

// Returns the result of attaching the given argument to the right-hand side of the matrix
lime.webgl.M.prototype.augment_ = function(matrix1,matrix2) {
  var M = matrix2.toArray();
  var T = matrix1.toArray(), cols = T[0].length;
  var ni = T.length, ki = ni, i, nj, kj = M[0].length, j;
  if (ni != M.length) { return null; }
  do { i = ki - ni;
    nj = kj;
    do { j = kj - nj;
      T[i][cols + j] = M[i][j];
    } while (--nj);
  } while (--ni);
  return T;
};

lime.webgl.M.prototype.multiply = function(matrix){
    //console.log(matrix);
    if(goog.isNumber(matrix)){
        return this.scale(matrix);
    }
    var returnVector = goog.isDef(matrix.msize) ? false : true;
    var M = matrix.elements || matrix;
    if(this.elements[0].length != matrix.length){
        if(goog.DEBUG){
            throw('Impossible multiply '+this.elements[0].length+' x '+ matrix.length);
        }
        return null;
    }//console.log(M);
    var ni = this.msize, ki = ni, i, nj, kj = returnVector ? matrix.size : matrix.msize, j;
    var cols = this.msize, elements = [], sum, nc, c;
    do { i = ki - ni;
      elements[i] = [];
      nj = kj;
      do { j = kj - nj;
        sum = 0;
        nc = cols;
        do { c = cols - nc;
          sum += this.elements[c*this.msize+i] * M[kj*j+c];
         // console.log('sum '+i+' '+(c*this.msize+i)+' '+this.elements[c*this.msize+i]+' '+M[kj*j+c]);
        } while (--nc);
        elements[i][j] = sum;//console.log('set '+sum)
      } while (--nj);
    } while (--ni);
    if(returnVector) return new lime.webgl.V(elements[0].length,this.type,elements[0]);
    
    return this.set(elements);
};

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

