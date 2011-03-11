// This file was automatically generated from brick.soy.
// Please don't edit this file by hand.

goog.provide('lime.webgl.shaders.brick');

goog.require('soy');


lime.webgl.shaders.brick.vertex = function(opt_data) {
  return '\n\nattribute vec4 position;\nattribute vec4 normal;\n\nuniform vec4 LightPosition;\nuniform mat4 modelViewMatrix;\nuniform mat4 projMatrix;\nuniform mat4 normalMatrix;\n\nconst float SpecularContribution = 0.3;\nconst float DiffuseContribution  = 1.0 - SpecularContribution;\n\nvarying float LightIntensity;\nvarying vec2  MCposition;\n\nvoid main() \n{\n\tvec3 ecPosition = (modelViewMatrix * position).xyz;\n\tvec3 tnorm      = normalize((normalMatrix * normal).xyz);\n\tvec3 lightVec   = normalize(LightPosition.xyz - ecPosition);\n\tvec3 reflectVec = reflect(-lightVec, tnorm);\t\n\tvec3 viewVec    = normalize(-ecPosition);\n\tfloat diffuse   = max(dot(lightVec, tnorm), 0.0);\n\tfloat spec      = 0.0;\n\n\tif (diffuse > 0.0) {\n\t\tspec = dot(reflectVec, viewVec);\n\t\tspec = pow(spec, 16.0);\n\t}\n\n\tLightIntensity = DiffuseContribution * diffuse ;\n\n\tMCposition  = position.xy;\n\tgl_Position = projMatrix*modelViewMatrix * position;\n}\n\n';
};


lime.webgl.shaders.brick.fragment = function(opt_data) {
  return '\n\nprecision highp float;\n\nuniform vec3 BrickColor, MortarColor;\nuniform vec2 BrickSize;\nuniform vec2 BrickPct;\n\nvarying vec2  MCposition;\nvarying float LightIntensity;\n\nvoid main() {\n\tvec3 color;\n\tvec2 position, useBrick;\n\n\tposition = MCposition / BrickSize;\n\t\n\tif (fract(position.y * 0.5) > 0.5)\n\t\tposition.x += 0.5;\n\n\tposition = fract(position);\n\n\tuseBrick = step(position, BrickPct);\n\n\tcolor    = mix(MortarColor, BrickColor, useBrick.x * useBrick.y);\n\t//color = vec3(0.7,0,0);\n\tcolor   *= LightIntensity*1.5;\n\tgl_FragColor = vec4(color, 1.0);\n//\tgl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}\n';
};
