import { simplexNoise3D } from "./noise";

/**
 * "The Sculpture" — one parametric surface that is continuously re-shaped on
 * the GPU. Every vertex is placed from its UV coordinate, so the same mesh can
 * morph between a sphere (seed), a liquid blob, an octahedral gem (crystal)
 * and a torus (portal) without any CPU work or geometry swaps.
 */
export const sculptureVertex = /* glsl */ `
uniform float uTime;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uCrystal;
uniform float uTorus;
uniform float uTwist;
uniform float uPulse;
uniform vec3 uPulseDir;
uniform vec3 uPointerDir;
uniform float uPointerStrength;

varying vec3 vNormalV;
varying vec3 vViewPos;
varying float vDisp;
varying vec3 vSphereDir;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;

${simplexNoise3D}

// Same parameterisation as THREE.SphereGeometry, so face winding is preserved
vec3 sphereDir(vec2 st) {
  float phi = st.x * TAU;
  float theta = (1.0 - st.y) * PI;
  return vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta));
}

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 sculpt(vec2 st, out float disp, out vec3 sdir) {
  vec3 d = sphereDir(st);
  sdir = d;

  // Crystal — octahedral gem
  vec3 gem = d / (abs(d.x) + abs(d.y) + abs(d.z)) * 1.32;
  vec3 base = mix(d, gem, uCrystal);

  // Portal — continuous sphere -> torus transformation (poles open into the hole)
  float phi = st.x * TAU;
  float a = (1.0 - st.y) * TAU;
  vec3 e = vec3(-cos(phi), 0.0, sin(phi));
  const float R = 1.05;
  const float r = 0.34;
  vec3 tor = e * (R - r * cos(a)) + vec3(0.0, r * sin(a), 0.0);
  vec3 torN = -e * cos(a) + vec3(0.0, sin(a), 0.0);
  base = mix(base, tor, uTorus);
  vec3 nrm = normalize(mix(d, torN, uTorus));

  // Domain-warped, slowly flowing noise
  float t = uTime * 0.16;
  vec3 np = d * uNoiseFreq;
  vec2 warp = vec2(
    snoise(np + vec3(t, 0.0, 0.0)),
    snoise(np + vec3(0.0, t + 4.1, 1.7))
  );
  float n = snoise(np + vec3(warp * 0.55, t));
  float n2 = snoise(np * 2.6 + vec3(t * 1.6)) * 0.28;
  disp = (n + n2) * uNoiseAmp;

  // The form leans towards the visitor's cursor
  float lean = pow(max(dot(d, uPointerDir), 0.0), 9.0) * uPointerStrength;

  // A ripple that travels across the surface on interaction
  float ang = acos(clamp(dot(d, uPulseDir), -1.0, 1.0));
  float front = (1.0 - uPulse) * PI * 1.1;
  float ripple = exp(-pow((ang - front) * 5.0, 2.0)) * uPulse * 0.2;

  disp += lean * (1.0 - uTorus * 0.75) + ripple;

  vec3 p = base + nrm * disp;
  return rotateY(p, p.y * uTwist * sin(uTime * 0.35));
}

void main() {
  float disp;
  vec3 sdir;
  vec3 p0 = sculpt(uv, disp, sdir);

  // Analytic-ish normal from neighbouring samples on the parametric surface
  const float EPS = 0.0015;
  float dTmp;
  vec3 sTmp;
  vec3 pu = sculpt(uv + vec2(EPS, 0.0), dTmp, sTmp);
  vec3 pv = sculpt(uv + vec2(0.0, EPS), dTmp, sTmp);
  vec3 n = cross(pu - p0, pv - p0);
  n = dot(n, n) > 1e-14 ? normalize(n) : normalize(p0);

  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vViewPos = mv.xyz;
  vNormalV = normalize(normalMatrix * n);
  vDisp = disp;
  vSphereDir = sdir;
  gl_Position = projectionMatrix * mv;
}
`;

export const sculptureFragment = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uFacet;
uniform float uDark;
uniform float uHighlight;
uniform vec3 uDeep;
uniform vec3 uMain;
uniform vec3 uGlow;
uniform vec3 uAccent;
uniform vec3 uSheen;

varying vec3 vNormalV;
varying vec3 vViewPos;
varying float vDisp;
varying vec3 vSphereDir;

const float TAU = 6.283185307179586;

void main() {
  vec3 V = normalize(-vViewPos);
  vec3 N = normalize(vNormalV);
  N = gl_FrontFacing ? N : -N;

  // Faceted shading for the crystal form
  vec3 Nf = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  if (dot(Nf, V) < 0.0) Nf = -Nf;
  N = normalize(mix(N, Nf, uFacet));

  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - NdV, 2.6);

  // Studio lighting (view space)
  vec3 L1 = normalize(vec3(0.55, 0.75, 0.45));
  vec3 L2 = normalize(vec3(-0.85, -0.25, 0.35));
  float wrap = max((dot(N, L1) + 0.35) / 1.35, 0.0);
  float spec1 = pow(max(dot(N, normalize(L1 + V)), 0.0), 90.0);
  float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 36.0);

  // Procedural environment reflections: a softbox above and a strip light
  vec3 R = reflect(-V, N);
  float softbox = smoothstep(0.35, 0.95, R.y) * smoothstep(1.0, 0.2, abs(R.x));
  float strip = pow(max(dot(R, normalize(vec3(-1.0, 0.15, 0.25))), 0.0), 24.0);
  float bounce = smoothstep(-0.2, -0.9, R.y);

  // Thin-film iridescence, constrained to the brand palette
  float film = fres * 1.6 + vDisp * 2.2 + dot(vSphereDir, vec3(0.3, 0.6, 0.2)) * 0.6 + uTime * 0.04;
  float w = 0.5 + 0.5 * sin(film * TAU);
  vec3 irid = mix(uMain, uGlow, w);
  irid = mix(irid, uAccent, smoothstep(0.72, 1.0, 0.5 + 0.5 * sin(film * TAU + 2.1)) * 0.65);

  // Body: dark obsidian-emerald (dark theme) or polished jade (light theme)
  vec3 body = mix(uDeep, uMain, wrap * mix(0.55, 0.3, uDark));
  float cavity = smoothstep(0.25, -0.35, vDisp);
  body *= 1.0 - cavity * 0.35;
  body += uGlow * smoothstep(-0.1, 0.45, vDisp) * 0.08;

  vec3 col = body;
  col += irid * fres * mix(0.9, 1.45, uDark);
  col += uSheen * (softbox * 0.65 + strip * 0.9) * (0.25 + fres * 0.9);
  col += uMain * bounce * 0.14;
  col += vec3(1.0) * spec1 * 1.1 + uAccent * spec2 * 0.45;
  col += uAccent * (uPulse * 0.9 + uHighlight * 0.6) * fres;

  gl_FragColor = vec4(col, 1.0);
}
`;
