#extension GL_EXT_Cafe : enable

layout(binding =  0) uniform vec3 fillRGB;
layout(binding =  3) uniform vec2 fillScale;
layout(binding =  5) uniform float fillTexture;

void main(){
   float fillFormula = 1.0;

   switch(int(fillTexture)){
      case 1: //diagonal / lines
         fillFormula = sin(dot(gl_FragCoord.xy, fillScale));
         break;
      case 2: //diagonal \ lines
         fillFormula = cos(dot(vec2(-gl_FragCoord.x,gl_FragCoord.y), fillScale));
         break;
      case 3: //vertical lines
         fillFormula = sin(gl_FragCoord.x*fillScale.x);
         break;
      case 4: //horizontal lines
         fillFormula = sin(gl_FragCoord.y*fillScale.y);
         break;
      case 5: //X lines
         fillFormula = (sin(dot(gl_FragCoord.xy, fillScale))+cos(dot(vec2(-gl_FragCoord.x,gl_FragCoord.y), fillScale)))/2;
         break;
      case 6: //+ lines
         fillFormula = (sin(gl_FragCoord.x*fillScale.x)+sin(gl_FragCoord.y*fillScale.y))/2;
         break;
      case 7: //mosaic
         fillFormula = fract(cos(gl_FragCoord.x*fillScale.x) + sin(gl_FragCoord.y*fillScale.y));
         break;
      case 8: //checker
         fillFormula = fract(sin(dot(gl_FragCoord.xy, fillScale))+cos(dot(vec2(-gl_FragCoord.x,gl_FragCoord.y), fillScale)));
         break;
      default:
         break;
   }

   float rand = 0.10 + 0.10 * fillFormula;
   gl_FragColor = vec4(fillRGB.r*0.80 + rand, fillRGB.g*0.80 + rand, fillRGB.b*0.80 + rand, 1.0);
}