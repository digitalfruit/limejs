// This file was automatically generated from plain.soy.
// Please don't edit this file by hand.

goog.provide('lime.webgl.shaders.plain');

goog.require('soy');
goog.require('soy.StringBuilder');


lime.webgl.shaders.plain.vertex = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\n\nattribute vec3 aVertexPosition;\nattribute vec4 aVertexColor;\n \nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\n\nvarying lowp vec4 color;\n \nvoid main(void) {\n\tgl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\tcolor = aVertexColor;\n}\n\n');
  if (!opt_sb) return output.toString();
};


lime.webgl.shaders.plain.fragment = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nvarying lowp vec4 color;\n\nvoid main(void) {\n  gl_FragColor = color;\n}\n\n');
  if (!opt_sb) return output.toString();
};
