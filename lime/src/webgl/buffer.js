goog.provide('lime.webgl.Buffer');


lime.webgl.Buffer = function(type,opt_data){
    if(!goog.isArray(type)) type = [type];
    this.type = type;
    
    this.items = [];
    this.length = 0;
    this.elementSize = 0;
    this.byteSize = 0;
    this.cursor = [];
    for(var j=0;j<type.length;j++){
    for(var i in type[j]){
        i = i.toLowerCase();
        var def = this.definitions_[i];
        if(!def){
            if(goog.DEBUG)
            console.warn('No definition for type '+i);
            break;
        }
        //[class,bytes,id,size,offset]
        this.items.push([def[0],def[1],def[2],type[j][i],this.byteSize]);
        this.byteSize+=def[1]*type[j][i];
        this.elementSize += type[j][i];
        this.cursor.push(null);
    }
    }
    this.dirty_ = true;
    this.size = this.length = 0;
    this.set(opt_data);
};

lime.webgl.Buffer.prototype.BUFFER_INCREMENT = 200;

lime.webgl.Buffer.prototype.definitions_ = {
  'float'   : [Float32Array,4,0x1406],
  'float32' : [Float32Array,4,0x1406],
  'int'     : [Int32Array,4,0x1404],
  'int32'   : [Int32Array,4,0x1404],
  'int16'   : [Int16Array,2,0x1402],
  'int8'    : [Int8Array,1,0x1400],
  'uint'    : [Uint32Array,4,0x1405],
  'uint32'  : [Uint32Array,4,0x1405],
  'uint16'  : [Uint16Array,2,0x1403],
  'uint8'   : [Uint8Array,1,0x1401]
};

lime.webgl.Buffer.prototype.set = function(data){
  if(!data || !data.length) return;
 
  var mod = data.length % this.elementSize;
  if(mod){
      if(goog.DEBUG)
      console.warn('Invalid number of elements passed to buffer. '+data.length+'%'+this.elementSize+' is not 0');
      return;
  }
  
  var len = this.length = data.length/this.elementSize;
  
  var buffer = new ArrayBuffer(len*this.byteSize);
  var items = this.items;
  
  //todo: should provide faster algorithm for this.items.length==1
  for(var i=0;i<len;i++){
      var l = 0;
      for(var j=0;j<items.length;j++){
          var item = items[j];
          var arr = new item[0](buffer,i*this.byteSize+item[4],item[3]);
          for(var k=0;k<item[3];k++){
              arr[k]=data[i*this.elementSize+l];
              l++;
          }
      }
  }
  this.buffer = buffer;
  
  this.dirty_ = true;
  this.length = len;
  this.size = this.length;
  
  return this;
  
};

lime.webgl.Buffer.prototype.updateIfNeeded = function(program,opt_is_element){
    var gl = program.gl,is_element = opt_is_element || false;
    
    if(this.dirty_ || is_element!=this.is_element_){
       
       if(!this.glbuffer){
           this.glbuffer = gl.createBuffer();
       }
       
       var target = is_element ?  gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
       
       gl.bindBuffer(target, this.glbuffer);
       //todo: allow other draw modes
	   gl.bufferData(target, this.buffer, gl.STATIC_DRAW);
    }
    
    this.is_element_ = is_element;
    this.dirty_ = false;
};

lime.webgl.Buffer.prototype.subBuffer = function(index){
    index = index || 0;
    if(index<0 || index>=this.items.length){
        if(goog.DEBUG)
        console.warn('Can\'t get subbuffer for index '+index+'. Buffer has '+this.items.length+' elements');
        return null;
    }
    return new lime.webgl.SubBuffer(this,index);
};

lime.webgl.Buffer.prototype.setSize = function(n){
    var buffer = new ArrayBuffer(n*this.byteSize);
    if(this.buffer){
    var uint = new Uint8Array(this.buffer,0,this.byteSize*this.length);
    var uint2 = new Uint8Array(buffer,0,n*this.byteSize);
    uint2.set(uint);
    }
    if(this.length>n){
        this.length = n;
    }
    this.size = n;
    this.dirty_ = true;
    this.buffer = buffer;
};

lime.webgl.Buffer.prototype.reset = function(){
    this.length = 0;
    this.dirty_ = true;
};

lime.webgl.Buffer.prototype.assureEmptyPositions = function(n){
    if((this.length+n)>=this.size){;
        this.setSize(this.size+this.BUFFER_INCREMENT);
    }
}

lime.webgl.Buffer.prototype.getNext = function(){
    var cursor = this.cursor,items = this.items,l = this.length,
        b = this.byteSize;
    this.assureEmptyPositions(1);
    for(var i=0;i<items.length;i++){
        var item = items[i];
        cursor[i] = new item[0](this.buffer,l*b+item[4],item[1]);
    }
    this.length++;
    return cursor;
};


lime.webgl.SubBuffer = function(buffer,index){
    this.buffer = buffer;
    this.subindex = index;
}