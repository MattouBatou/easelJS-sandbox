#extension GL_EXT_Cafe : enable

attribute vec4 a_position; //normalized quad

layout(binding=0) uniform mat4 u_projMtx; // ortho projection. Scales the view matrix from pixel space to clipping space.
layout(binding=4) uniform mat4 u_viewMtx; // 2D view matrix. The values of setTransform or other ctx matrix operations change this uniform
layout(binding=10) uniform vec2 u_rasteroff; // same for every call. just a .5 pixel adjustment.
layout(binding=15) uniform vec4 u_rectScaleTrans1; // source rect
layout(binding=16) uniform vec4 u_rectScaleTrans2; // dest rect

varying vec2 v_texCoord;

void main(){
   vec4 pos = a_position;
   pos.xy *= u_rectScaleTrans1.xy;
   pos.xy += u_rectScaleTrans1.zw;
   pos.xy += u_rasteroff.xy;

   gl_Position = pos * u_viewMtx * u_projMtx;// * RotationMatrix;

   pos.xy = a_position.xy;
   pos.xy *= u_rectScaleTrans2.xy;
   pos.xy += u_rectScaleTrans2.zw;
   v_texCoord = pos.xy;
}