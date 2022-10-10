const shaders = {
  door_frag: `
uniform float time;
uniform float selected;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec2 uv = vUv * 2.0 - 1.0;
  vec2 puv = vec2(length(uv.xy), atan(uv.x, uv.y));
  vec4 col = texture2D(tex, vec2(log(puv.x) + t / 5.0, puv.y / 3.1415926 ));
  float glow = (1.0 - puv.x) * (0.5 + (sin(t) + 2.0 ) / 4.0);
  // blue glow
  col += vec4(118.0/255.0, 144.0/255.0, 219.0/255.0, 1.0) * (0.4 + glow * 1.0);
  // white glow
  col += vec4(0.2) * smoothstep(0.0, 2.0, glow * glow);
  gl_FragColor = col;

}
`,

  zoom_frag: `
uniform float time;
uniform sampler2D tex;
uniform vec2 zoomPos;
uniform float zoomAmount;
uniform float zoomRatio;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec2 uv = vec2(vUv.x - 0.5, (1.0 - vUv.y) - 0.5);
  vec2 texUv = uv * vec2(zoomRatio, 1.0);
  vec4 col = texture2D(tex, zoomPos + texUv * zoomAmount);
  float dist = length(uv) * 2.0;
  col.a = smoothstep(0.0, 0.1, 1.0 - dist);
  float aura = smoothstep(0.80, 1.0, dist);
  col.rgb += aura * 0.3;
  gl_FragColor = col;
}
`,

  basic_vert: `
varying vec2 vUv;
varying vec3 vPosition;
void main()
{
  vUv = uv;
  vPosition = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,

  panoball_vert: `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;
uniform float time;
uniform float selected;

void main()
{
  vUv = uv;

  vPosition = position;

  vec3 offset = vec3(
    sin(position.x * 50.0 + time),
    sin(position.y * 10.0 + time * 2.0),
    cos(position.z * 40.0 + time)
  ) * 0.003;

  vPosition *= 1.0 + selected * 0.2;

  vNormal = normalize(inverse(transpose(modelMatrix)) * vec4(normalize(normal), 1.0)).xyz;
  vWorldPos = (modelMatrix * vec4(vPosition, 1.0)).xyz;

  vec4 mvPosition = modelViewMatrix * vec4(vPosition + offset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,

  panoball_frag: `
uniform sampler2D tex, texfx;
uniform float time;
uniform float selected;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;


void main( void ) {
  vec2 uv = vUv;
  //uv.y =  1.0 - uv.y;

  vec3 eye = normalize(cameraPosition - vWorldPos);
  float fresnel = abs(dot(eye, vNormal));
  float shift = pow((1.0 - fresnel), 4.0) * 0.05;

  vec3 col = vec3(
    texture2D(tex, uv - shift).r,
    texture2D(tex, uv).g,
    texture2D(tex, uv + shift).b
  );

  col = mix(col * 0.7, vec3(1.0), 0.7 - fresnel);

  col += selected * 0.3;

  float t = time * 0.4 + vPosition.x + vPosition.z;
  uv = vec2(vUv.x + t * 0.2, vUv.y + t);
  vec3 fx = texture2D(texfx, uv).rgb * 0.4;


  gl_FragColor = vec4(col + fx, 1.0);
}
`,

  beam_frag: `
uniform float time;
uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {
  float t = time;
  vec4 col = texture2D(tex, vec2(vUv.x, vUv.y * 3.0 + time * 2.0));
  col *= vUv.y;
  gl_FragColor = col;
}
`,
};

export { shaders };