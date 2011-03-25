goog.provide('lime.webgl.Program');

goog.require('lime.webgl.Buffer')

lime.webgl.Program = function(gl){
    this.gl = gl;
    this.program = gl.createProgram();
}

lime.webgl.Program.prototype.setShader = function(shader){
    var gl = this.gl;
    
    this.vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(this.vshader,shader.vertex());
    gl.compileShader(this.vshader);
    if (!gl.getShaderParameter(this.vshader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(this.vshader));
          return null;
        }
    
    this.fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.fshader,shader.fragment());
    gl.compileShader(this.fshader);
    if (!gl.getShaderParameter(this.fshader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(this.fshader));
          return null;
        }
    
    
    gl.attachShader(this.program,this.vshader);
    gl.attachShader(this.program,this.fshader);    
 
    gl.linkProgram(this.program);
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
         alert("Could not initialise shaders");
     }
    gl.useProgram(this.program);
    
    this.activeBuffers_  = {};
    
   // WebGLActiveInfo(name,type,size)
    var loc,name;
    for(var i=0;1;i++){
        var info = gl.getActiveAttrib(this.program,i);
        if(!info) break;
        name = info['name'];
        loc = this.gl.getAttribLocation(this.program,name);
        this['set'+name] = this.getSetterFunction(loc,info['type'],'set'+name,1);
    }    
    for(i=0;1;i++){
        info = gl.getActiveUniform(this.program,i);
        if(!info) break;
        name = info['name'];
        loc = this.gl.getUniformLocation(this.program,name);
        this['set'+name] = this.getSetterFunction(loc,info['type'],'set'+name,0);
    }
    
    return this;
}

lime.webgl.Program.prototype.formatParam = function(type,size,isMatrix,name,inputs){
    var inp=inputs[0],type2 = type==Boolean ? Int32Array : type,size2=size;
    if(isMatrix) {
        size *=size;
    }
    if(isMatrix && inp instanceof lime.webgl.M){
       if(inp.msize!=size2 || !(inp.elements instanceof type)){
           if(goog.DEBUG){
               console.warn('Method '+name+' expects '+type.name+' matrix'+size2+'. Got '+inp.elements.constructor.name+' matrix'+inp.msize);
           }
       }
       return inp.elements;
    }
    else if(inp instanceof lime.webgl.V){
        if(inp.size!=size || !(inp.elements instanceof type)){
            if(goog.DEBUG){
                console.warn('Method '+name+' expects '+type.name+' vec'+size+'. Got '+inp.elements.constructor.name+' vec'+inp.size);
            }
        }
        return inp.elements;
    }
    else if(inp instanceof type){
        if(inp.length != size){
            if(goog.DEBUG){
                console.warn('Method '+name+' expects '+type.name+' size '+size+'. Got '+inp.constructor.name+' size'+inp.length);   
            }
        }
        return inp;
    }
    else if(goog.isArray(inp)){
        if(inp.length!=size){
            if(goog.DEBUG){
                console.warn('Method '+name+' expects array length '+size+'. Got array length'+inp.length);   
            }
        }
        return new type2(inp);
    }
    else {
        inp = goog.array.toArray(inputs);
        if(inp.length!=size){
            if(goog.DEBUG){
                console.warn('Method '+name+' expects '+size+' parameters. Got '+inp.toString()+' , length '+inp.length);   
            }
        }
        return new type2(inp);
    }
}

lime.webgl.Program.prototype.SETTERS = {
    0x1406 : ['uniform1fv','vertexAttrib1fv',Float32Array,1], // FLOAT
    0x8B50 : ['uniform2fv','vertexAttrib2fv',Float32Array,2], // FLOAT_VEC2
    0x8B51 : ['uniform3fv','vertexAttrib3fv',Float32Array,3], // FLOAT_VEC3
    0x8B52 : ['uniform4fv','vertexAttrib4fv',Float32Array,4], // FLOAT_VEC4
    0x1404 : ['uniform1iv','vertexAttrib1iv',Int32Array,1], // INT
    0x8B53 : ['uniform2iv','vertexAttrib2iv',Int32Array,2], // INT_VEC2
    0x8B54 : ['uniform3iv','vertexAttrib3iv',Int32Array,3], // INT_VEC3
    0x8B55 : ['uniform4iv','vertexAttrib4iv',Int32Array,4], // INT_VEC4
    0x8B56 : ['uniform1iv','vertexAttrib1iv',Boolean,1], // BOOL
    0x8B57 : ['uniform2iv','vertexAttrib2iv',Boolean,2], // BOOL_VEC2
    0x8B58 : ['uniform3iv','vertexAttrib3iv',Boolean,3], // BOOL_VEC3
    0x8B59 : ['uniform4iv','vertexAttrib4iv',Boolean,4], // BOOL_VEC4
    0x8B5A : ['uniformMatrix2fv','',Float32Array,2,true], // FLOAT_MAT2
    0x8B5B : ['uniformMatrix3fv','',Float32Array,3,true], // FLOAT_MAT3
    0x8B5C : ['uniformMatrix4fv','',Float32Array,4,true],  // FLOAT_MAT4
    0x8B5E : ['uniform1iv','vertexAttrib1iv',Int32Array,1], // SAMPLER_2D
};


lime.webgl.Program.prototype.getSetterFunction = function(location,type,name,findex){
    var param = this.SETTERS[type],func = this.gl[param[findex]],type = param[2],size = param[3],
        isMatrix = param[4] || false,f;
    
    f = isMatrix ? 
        function(){
            this.use();
            var p = this.formatParam(type,size,isMatrix,name,arguments);
            func.call(this.gl,location,false,p);
        } :
        function(buffer){
            this.use();
            var isbuf = buffer instanceof lime.webgl.Buffer,
                issubbuf = buffer instanceof lime.webgl.SubBuffer;
            
            if(findex && buffer===null){
                delete this.activeBuffers_[name];
                this.gl.disableVertexAttribArray(location);
            }
            else if(findex && (isbuf || issubbuf)){
                var stride = 0, offset = 0;
                if(isbuf && buffer.items.length>1){
                    console.warn('Can\'t pass multi item buffer to '+name+'. Please make a subBuffer first');
                    return;
                }
                
                if(issubbuf){
                    stride = buffer.buffer.byteSize;
                    offset = buffer.buffer.items[buffer.subindex][4];
                    buffer = buffer.buffer;
                }
                this.activeBuffers_[name]=buffer;
                buffer.updateIfNeeded(this);
                this.gl.enableVertexAttribArray(location);
			    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.glbuffer);
			    this.gl.vertexAttribPointer(location,buffer.items[0][3],buffer.items[0][2], false, stride,offset);
            }
            else {
                if(this.activeBuffers_[name]){
                    delete this.activeBuffers_[name];
                    this.gl.disableVertexAttribArray(location);
                }
                func.call(this.gl,location,this.formatParam(type,size,isMatrix,name,arguments));
            }
            
        };         
    f.name = 'set'+name;
    return f;
}

lime.webgl.Program.prototype.use = function(){
    if(this.gl.usedProgram_==this) return;
    
    this.gl.useProgram(this.program);
    this.gl.usedProgram_ = this;
}
/*
lime.webgl.Program.prototype.addAttribute = function(name){
    this[name] = this.gl.getAttribLocation(this.program, name);
    
};

lime.webgl.Program.prototype.addUniform = function(name){
    this[name] = this.gl.getUniformLocation(this.program, name);
};*/

lime.webgl.Program.prototype.draw = function(mode,opt_offset,opt_length){
    var offset = opt_offset || 0,
        length = opt_length || 0,
        mode = mode || 0x0004; //GL_TRIANGLES
    this.use();
    if(!length){
		for(var i in this.activeBuffers_){
		    if(!length || this.activeBuffers_[i].length<length)
		        length= this.activeBuffers_[i].length;
		}
    }
    this.gl.drawArrays(mode,offset,length);
};

lime.webgl.Program.prototype.drawElements = function(buffer,mode,opt_offset,opt_length){
    buffer.updateIfNeeded(this,true);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer.glbuffer);

    this.gl.drawElements(mode,buffer.length,buffer.items[0][2],0);
 
};