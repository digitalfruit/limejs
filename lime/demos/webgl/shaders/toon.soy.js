// This file was automatically generated from toon.soy.
// Please don't edit this file by hand.

goog.provide('lime.webgl.shaders.toon');

goog.require('soy');


lime.webgl.shaders.toon.vertex = function(opt_data) {
  return '\n\nattribute vec4 position;\nattribute vec4 normal;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projMatrix;\nuniform mat4 normalMatrix;\n\nvarying vec3 currentNormal;\n\nvoid main(void)\n{\n\tcurrentNormal = normalize((normalMatrix * normal).xyz);\n\tgl_Position = projMatrix * modelViewMatrix * position;\n}\n\n';
};


lime.webgl.shaders.toon.fragment = function(opt_data) {
  return '\n\nprecision highp float;\n\nuniform vec3 DiffuseColor;\nuniform vec3 PhongColor;\nuniform float Edge;\nuniform float Phong;\nvarying vec3 currentNormal;\n\nvoid main (void)\n{\n\tvec3 color = DiffuseColor;\n\tfloat f = dot(vec3(0,0,1),currentNormal);\n\tif (abs(f) < Edge)\n\t\tcolor = vec3(0);\n\tif (f > Phong)\n\t\tcolor = PhongColor;\n\n\tgl_FragColor = vec4(color, 1);\n}\n\n\n';
};
