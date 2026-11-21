// lib/lens-bloom.js
// The papercraft macro lens (PaperPost: tilt-shift DOF, ACES grade, warm AO, haze, vignette, grain) plus a filmic
// bloom chain on top — the "AAA" read the brief asks for: printed panes, lamp shades and the lit edges of card bleed a
// soft halo the way a photographed model does under a hot key. Bloom runs in display space AFTER the grade, so it
// never fights the paper BRDF: it only picks up what is already bright (lit paper panes, cream highlights).
import * as THREE from 'three';
import { PaperPost } from './paperkit-3d.js';

const VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`;

const BRIGHT_FRAG = /* glsl */`
uniform sampler2D tColor; uniform vec2 uTexel; uniform float uThreshold; uniform float uSoft;
varying vec2 vUv;
void main() {
  vec3 c = texture2D( tColor, vUv ).rgb;
  // a 4-tap box first: sub-pixel fibre sparkle must not seed the halo
  c = 0.25 * ( c + texture2D( tColor, vUv + vec2( uTexel.x, 0.0 ) ).rgb
                 + texture2D( tColor, vUv + vec2( 0.0, uTexel.y ) ).rgb
                 + texture2D( tColor, vUv + uTexel ).rgb );
  float l = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
  float k = smoothstep( uThreshold, uThreshold + uSoft, l );
  gl_FragColor = vec4( min( c, vec3( 6.0 ) ) * k, 1.0 );
}`;

const BLUR_FRAG = /* glsl */`
uniform sampler2D tColor; uniform vec2 uDir;   // direction in uv
varying vec2 vUv;
void main() {
  // 9-tap gaussian, linearly-spaced: wide and cheap
  vec3 acc = texture2D( tColor, vUv ).rgb * 0.227027;
  acc += ( texture2D( tColor, vUv + uDir * 1.384615 ).rgb + texture2D( tColor, vUv - uDir * 1.384615 ).rgb ) * 0.316216;
  acc += ( texture2D( tColor, vUv + uDir * 3.230769 ).rgb + texture2D( tColor, vUv - uDir * 3.230769 ).rgb ) * 0.070270;
  gl_FragColor = vec4( acc, 1.0 );
}`;

const COMPOSITE_FRAG = /* glsl */`
uniform sampler2D tBase; uniform sampler2D tBloomA; uniform sampler2D tBloomB;
uniform float uStrength; uniform float uWide; uniform vec2 uTexel; uniform float uTime;
varying vec2 vUv;
float hash12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
void main() {
  vec3 base = texture2D( tBase, vUv ).rgb;
  // a whisper of lateral fringing where the halo is strongest (a fast lens, not a filter)
  vec2 d = vUv - 0.5;
  vec2 ca = d * dot( d, d ) * uTexel * 5.0;
  vec3 bloom = texture2D( tBloomA, vUv + ca ).rgb * 0.72 + texture2D( tBloomB, vUv - ca ).rgb * uWide;
  vec3 col = base + bloom * uStrength * vec3( 1.0, 0.985, 0.955 );
  // soft shoulder above 0.86 so a lit pane blooms without clipping to a flat white hole
  vec3 over = max( col - 0.86, 0.0 );
  col -= over * over * 0.55;
  col = clamp( col, 0.0, 1.0 );
  col += ( hash12( gl_FragCoord.xy + fract( uTime ) * 91.0 ) - 0.5 ) * 0.006;   // dither the banding away
  gl_FragColor = vec4( col, 1.0 );
}`;

export class BloomPost extends PaperPost {
  /** opts: everything PaperPost takes, plus bloom (0..1), bloomThreshold, bloomSoft, bloomRadius, bloomWide */
  constructor(renderer, scene, camera, opts = {}) {
    super(renderer, scene, camera, { bloom: 0.62, bloomThreshold: 0.62, bloomSoft: 0.42, bloomRadius: 1.0, bloomWide: 0.55, ...opts });
    const half = { type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace };
    this.rtGrade = new THREE.WebGLRenderTarget(2, 2, half);
    this.rtA = new THREE.WebGLRenderTarget(2, 2, half);
    this.rtB = new THREE.WebGLRenderTarget(2, 2, half);
    this.rtC = new THREE.WebGLRenderTarget(2, 2, half);
    this.rtD = new THREE.WebGLRenderTarget(2, 2, half);
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, depthTest: false, depthWrite: false, uniforms });
    this.bright = mk(BRIGHT_FRAG, { tColor: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 0.62 }, uSoft: { value: 0.42 } });
    this.blur = mk(BLUR_FRAG, { tColor: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.comp = mk(COMPOSITE_FRAG, { tBase: { value: this.rtGrade.texture }, tBloomA: { value: this.rtA.texture }, tBloomB: { value: this.rtD.texture },
      uStrength: { value: 0.62 }, uWide: { value: 0.55 }, uTexel: { value: new THREE.Vector2() }, uTime: { value: 0 } });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.comp);
    this.quad.frustumCulled = false;
    // the grade pass of PaperPost renders to the screen; redirect exactly that call into rtGrade, once, permanently
    const orig = renderer.setRenderTarget.bind(renderer);
    this._toGrade = false;
    renderer.setRenderTarget = (t, ...a) => orig(this._toGrade && t === null ? this.rtGrade : t, ...a);
    this.apply();
  }
  apply() {
    super.apply();
    if (!this.comp) return;
    this.bright.uniforms.uThreshold.value = this.o.bloomThreshold;
    this.bright.uniforms.uSoft.value = this.o.bloomSoft;
    this.comp.uniforms.uStrength.value = this.o.bloom ?? 0.62;
    this.comp.uniforms.uWide.value = this.o.bloomWide ?? 0.55;
  }
  setSize(w, h) {
    super.setSize(w, h);
    const pr = this.renderer.getPixelRatio(), W = Math.round(w * pr), H = Math.round(h * pr);
    const w2 = Math.max(2, Math.round(W / 2)), h2 = Math.max(2, Math.round(H / 2));
    const w4 = Math.max(2, Math.round(W / 4)), h4 = Math.max(2, Math.round(H / 4));
    this.rtGrade.setSize(W, H);
    this.rtA.setSize(w2, h2); this.rtB.setSize(w2, h2); this.rtC.setSize(w4, h4); this.rtD.setSize(w4, h4);
    this.comp.uniforms.uTexel.value.set(1 / W, 1 / H);
    this.bright.uniforms.uTexel.value.set(1 / W, 1 / H);
  }
  /** One pass with a fixed material into a target (a fullscreen quad). */
  _pass(mat, target) {
    const r = this.renderer;
    this.quad.material = mat;
    r.setRenderTarget(target);
    r.render(this.quad, this.quadCam);
  }
  render(time = 0) {
    if (this.view === 1) { super.render(time); return; }     // circle of confusion debug: unpremultiplied, as the kit does
    this._toGrade = true;
    super.render(time);
    this._toGrade = false;
    const r = this.renderer, H = this.H || 1080;
    const rad = (this.o.bloomRadius ?? 1) * H / 1080;
    // bright pass at half res
    this.bright.uniforms.tColor.value = this.rtGrade.texture;
    this._pass(this.bright, this.rtA);
    // half-res gaussian
    const w2 = this.rtA.width, h2 = this.rtA.height;
    this.blur.uniforms.tColor.value = this.rtA.texture;
    this.blur.uniforms.uDir.value.set(rad * 1.4 / w2, 0);
    this._pass(this.blur, this.rtB);
    this.blur.uniforms.tColor.value = this.rtB.texture;
    this.blur.uniforms.uDir.value.set(0, rad * 1.4 / h2);
    this._pass(this.blur, this.rtA);
    // quarter-res wide halo: a second, blurrier copy reads as a lens glow rather than a glow filter
    const w4 = this.rtC.width, h4 = this.rtC.height;
    this.blur.uniforms.tColor.value = this.rtA.texture;
    this.blur.uniforms.uDir.value.set(rad * 2.2 / w4, 0);
    this._pass(this.blur, this.rtC);
    this.blur.uniforms.tColor.value = this.rtC.texture;
    this.blur.uniforms.uDir.value.set(0, rad * 2.2 / h4);
    this._pass(this.blur, this.rtD);
    this.comp.uniforms.uTime.value = time;
    this._pass(this.comp, null);
  }
}
