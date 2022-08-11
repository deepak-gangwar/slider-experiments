precision mediump float;

// ${backgroundCoverUv}
vec2 backgroundCoverUv(vec2 screenSize,vec2 imageSize,vec2 uv){
  float screenRatio=screenSize.x/screenSize.y;
  float imageRatio=imageSize.x/imageSize.y;
  
  vec2 newSize=screenRatio<imageRatio
  ?vec2(imageSize.x*screenSize.y/imageSize.y,screenSize.y)
  :vec2(screenSize.x,imageSize.y*screenSize.x/imageSize.x);
  
  vec2 newOffset=(screenRatio<imageRatio
    ?vec2((newSize.x-screenSize.x)/2.,0.)
    :vec2(0.,(newSize.y-screenSize.y)/2.))/newSize;
    
  return uv*screenSize/newSize+newOffset;
}
// ${backgroundCoverUv}

uniform sampler2D uTexture;

uniform vec2 uMeshSize;
uniform vec2 uImageSize;

uniform float uVelo;
uniform float uScale;

varying vec2 vUv;

void main(){
  vec2 uv=vUv;
  
  vec2 texCenter=vec2(.5);
  vec2 texUv=backgroundCoverUv(uMeshSize,uImageSize,uv);
  vec2 texScale=(texUv-texCenter)*uScale+texCenter;
  vec4 mytexture=texture2D(uTexture,texScale);
  
  texScale.x+=.15*uVelo;
  // Uncomment this line for RGB shift effect
  //if(uv.x < 1.) mytexture.g = texture2D(uTexture, texScale).g;
  
  texScale.x+=.10*uVelo;
  // Uncomment this line for RGB shift effect
  //if(uv.x < 1.) mytexture.b = texture2D(uTexture, texScale).b;
  
  gl_FragColor=mytexture;
}