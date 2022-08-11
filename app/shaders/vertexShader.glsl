precision mediump float;

uniform float uVelo;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main(){
  vec3 pos = position;
  // THE LAST CONSTANT IS CHANGED FROM 0.125 TO 0.9
  pos.y = pos.y + ((sin(uv.x * M_PI) * uVelo) * 0.9);

  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
}