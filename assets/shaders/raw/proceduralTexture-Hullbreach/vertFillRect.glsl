#extension GL_EXT_Cafe : enable

attribute vec3 a_position;
layout(binding=0) uniform mat4 u_projMtx;
layout(binding=4) uniform mat4 u_viewMtx;

 void main() // all vertex shaders define a main() function
 {
	gl_Position = vec4(a_position, 1.0)*u_viewMtx*u_projMtx;
 }