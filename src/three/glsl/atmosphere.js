import { simplexNoise3D } from "./noise";

// Full-screen backdrop: gradient + halo that follows the sculpture + faint
// aurora ribbons + an engineering-paper dot grid.
export const backdropVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const backdropFragment = /* glsl */ `
uniform vec3 uBgTop;
uniform vec3 uBgBottom;
uniform vec3 uGlowA;
uniform vec3 uGlowB;
uniform vec3 uGrid;
uniform float uGridAlpha;
uniform float uGlowStrength;
uniform vec2 uFocus;
uniform float uAspect;
uniform float uTime;
uniform float uDpr;
varying vec2 vUv;

${simplexNoise3D}

void main() {
  vec2 p = vUv;
  vec3 col = mix(uBgBottom, uBgTop, smoothstep(0.0, 1.0, p.y));

  vec2 q = p - uFocus;
  q.x *= uAspect;
  float halo = exp(-dot(q, q) * 3.0);

  float n1 = snoise(vec3(p.x * 1.4 * uAspect, p.y * 2.0, uTime * 0.035));
  float n2 = snoise(vec3(p.x * 2.8 * uAspect + 7.0, p.y * 1.3, uTime * 0.05 + 3.0));
  float aurora = smoothstep(0.15, 0.95, n1 * 0.6 + n2 * 0.4 + 0.15);

  col += uGlowA * halo * uGlowStrength;
  col += mix(uGlowA, uGlowB, n2 * 0.5 + 0.5) * aurora * 0.06 * uGlowStrength * (0.35 + halo);

  vec2 g = fract(gl_FragCoord.xy / (36.0 * uDpr)) - 0.5;
  float dotMask = smoothstep(0.075, 0.0, length(g));
  col = mix(col, uGrid, dotMask * uGridAlpha * (1.0 - halo * 0.6));

  gl_FragColor = vec4(col, 1.0);
}
`;

// Orbiting dust shell around the sculpture
export const dustVertex = /* glsl */ `
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uPulse;
uniform float uSpread;
varying float vAlpha;
varying float vSeed;

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
  vec3 p = rotateY(position, uTime * (0.03 + aSeed * 0.06));
  p.y += sin(uTime * 0.3 + aSeed * 20.0) * 0.08;
  p *= uSpread + uPulse * 0.3 * aSeed;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aSize * uPixelRatio / -mv.z;

  vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.2 + aSeed * 40.0));
  vSeed = aSeed;
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vAlpha;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.6);
  vec3 col = mix(uColorA, uColorB, step(0.86, vSeed));
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}
`;

// Final lens pass (runs after OutputPass, so it works on display-ready colors)
export const lensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.05 },
    uVignette: { value: 0.45 },
    uAberration: { value: 0.012 },
    uResolution: { value: null },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uAberration;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 off = c * r2 * uAberration;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;

      col *= 1.0 - smoothstep(0.12, 0.6, r2) * uVignette;
      col += (hash(vUv * uResolution + fract(uTime * 7.0) * 100.0) - 0.5) * uGrain;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
