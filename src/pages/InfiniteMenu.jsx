import { useEffect, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Tv2,
  Popcorn,
  GlassWater,
  Users,
  Phone,
  MessageCircle,
  X,
  MonitorPlay,
  Globe,
} from 'lucide-react';
// ─── Inline Styles ────────────────────────────────────────────────────────────

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    background: 'linear-gradient(160deg, #0b0b14 0%, #0f0c1e 50%, #0b0b14 100%)',
    color: '#f0f0f8',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '18%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(560px, 90vw)',
    height: 'min(560px, 90vw)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,60,255,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 'min(150px, 22vh)',
    background: 'linear-gradient(to bottom, rgba(6,5,12,0.55) 0%, rgba(6,5,12,0) 100%)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  scrimBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'min(240px, 36vh)',
    background: 'linear-gradient(to top, rgba(6,5,12,0.68) 0%, rgba(6,5,12,0) 100%)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  canvas: {
    position: 'relative',
    zIndex: 1,
    cursor: 'grab',
    width: '100%',
    height: '100%',
    display: 'block',
    outline: 'none',
    touchAction: 'none',
  },
  hint: {
    position: 'absolute',
    top: 'calc(14px + env(safe-area-inset-top, 0px))',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 'clamp(0.58rem, 1.6vw, 0.66rem)',
    color: 'rgba(160,150,220,0.32)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    zIndex: 3,
  },
  // Badge now stretches the full bottom bar — left side for platform info, right for actions
  badge: (isMoving, color) => ({
    position: 'absolute',
    // left: 'calc(14px + env(safe-area-inset-left, 0px))',
    right: 'calc(14px + env(safe-area-inset-right, 0px))',
    bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(10, 8, 22, 0.82)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${color ? color + '44' : 'rgba(255,255,255,0.1)'}`,
    borderLeft: `3px solid ${color || '#6c3cff'}`,
    borderRadius: 14,
    padding: 'clamp(8px,2vw,10px) clamp(10px,2.6vw,14px)',
    pointerEvents: isMoving ? 'none' : 'auto',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: isMoving ? 0 : 1,
    transform: isMoving ? 'translateY(8px)' : 'translateY(0)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    zIndex: 4,
  }),
  badgeIconWrap: (color) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: color ? color + '22' : 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  badgeText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  badgeName: {
    fontSize: '0.83rem',
    fontWeight: 600,
    color: '#f0f0f8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgeDesc: {
    fontSize: '0.68rem',
    color: 'rgba(200,190,240,0.45)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Divider between info and action buttons
  badgeDivider: {
    width: 1,
    alignSelf: 'stretch',
    background: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
    margin: '2px 4px',
  },
  // Action buttons inside the badge
  badgeActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  badgeActionBtn: (bgColor) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: bgColor + '22',
    border: `1px solid ${bgColor}55`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.15s ease, background 0.15s ease',
    flexShrink: 0,
  }),
  infoWrap: {
    position: 'absolute',
    top: 'calc(14px + env(safe-area-inset-top, 0px))',
    right: 'calc(14px + env(safe-area-inset-right, 0px))',
    zIndex: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  infoBtn: {
    position: 'relative',
    width: 'clamp(34px, 8vw, 40px)',
    height: 'clamp(34px, 8vw, 40px)',
    borderRadius: '50%',
    border: '1px solid rgba(255,195,0,0.45)',
    background: 'linear-gradient(135deg, rgba(255,195,0,0.28), rgba(255,140,0,0.14))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    boxShadow: '0 0 18px rgba(255,195,0,0.25)',
  },
  disclaimerPanel: (open) => ({
    marginTop: 10,
    width: 'min(70vw, 260px)',
    background: 'rgba(12, 10, 22, 0.94)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,195,0,0.2)',
    borderRadius: 14,
    padding: '12px 14px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
    opacity: open ? 1 : 0,
    visibility: open ? 'visible' : 'hidden',
    transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
    transformOrigin: 'top right',
    transition: 'opacity 0.22s ease, transform 0.22s ease, visibility 0.22s',
    pointerEvents: 'none',
  }),
  disclaimerPanelText: {
    fontSize: '0.72rem',
    lineHeight: 1.6,
    color: 'rgba(225, 200, 110, 0.92)',
    margin: 0,
  },
  disclaimerStrong: {
    color: '#ffd84d',
  },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const MessageIcon = ({ size = 16, color = '#25d366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);


const WhatsAppIcon = ({ size = 16, color = "#25D366" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.52 0 .2 5.32.2 11.84c0 2.08.54 4.12 1.56 5.92L0 24l6.42-1.68a11.84 11.84 0 0 0 5.62 1.44h.01c6.52 0 11.84-5.32 11.84-11.84 0-3.16-1.24-6.14-3.37-8.44z" />
    <path d="M16.74 14.44c-.24-.12-1.4-.7-1.62-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.36-1.9-1.16-.7-.62-1.18-1.38-1.32-1.62-.14-.24-.02-.38.1-.5.1-.1.24-.26.36-.38.12-.12.16-.2.24-.34.08-.14.04-.26-.02-.38-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.56 4.08 3.6.56.24 1 .38 1.34.48.56.18 1.08.16 1.48.1.46-.06 1.4-.58 1.6-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
  </svg>
);

const CallIcon = ({ size = 16, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const InfoIcon = ({ size = 14, color = 'rgba(220,190,80,0.6)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const DragIcon = ({ size = 14, color = 'rgba(160,150,220,0.3)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
  </svg>
);

// ─── Shaders ──────────────────────────────────────────────────────────────────

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;
    float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;

    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}`;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

class Face { constructor(a, b, c) { this.a = a; this.b = b; this.c = c; } }

class Vertex {
  constructor(x, y, z) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
  }
}

class Geometry {
  constructor() { this.vertices = []; this.faces = []; }
  addVertex(...args) {
    for (let i = 0; i < args.length; i += 3)
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    return this;
  }
  addFace(...args) {
    for (let i = 0; i < args.length; i += 3)
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    return this;
  }
  get lastVertex() { return this.vertices[this.vertices.length - 1]; }
  subdivide(divisions = 1) {
    const midPointCache = {};
    let f = this.faces;
    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array(f.length * 4);
      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);
        const i = ndx * 4;
        newFaces[i + 0] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });
      f = newFaces;
    }
    this.faces = f;
    return this;
  }
  spherize(radius = 1) {
    this.vertices.forEach(v => {
      vec3.normalize(v.normal, v.position);
      vec3.scale(v.position, v.normal, radius);
    });
    return this;
  }
  get data() { return { vertices: this.vertexData, indices: this.indexData, normals: this.normalData, uvs: this.uvData }; }
  get vertexData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.position))); }
  get normalData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal))); }
  get uvData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv))); }
  get indexData() { return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c])); }
  getMidPoint(ndxA, ndxB, cache) {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) return cache[cacheKey];
    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[cacheKey] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
      0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
      t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
    ).addFace(
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    steps = Math.max(4, steps);
    const alpha = (2 * Math.PI) / steps;
    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;
    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;
      if (i > 0) this.addFace(0, i, i + 1);
    }
    this.addFace(0, steps, 1);
  }
}

// ─── WebGL helpers ────────────────────────────────────────────────────────────

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl, shaderSources, tfVaryings, attribLocations) {
  const program = gl.createProgram();
  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx]);
    if (shader) gl.attachShader(program, shader);
  });
  if (tfVaryings) gl.transformFeedbackVaryings(program, tfVaryings, gl.SEPARATE_ATTRIBS);
  if (attribLocations) {
    for (const attrib in attribLocations)
      gl.bindAttribLocation(program, attribLocations[attrib], attrib);
  }
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeVertexArray(gl, bufLocNumElmPairs, indices) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);
  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }
  if (indices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return va;
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio);
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) { canvas.width = displayWidth; canvas.height = displayHeight; }
  return needResize;
}

function makeBuffer(gl, sizeOrData, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function createAndSetupTexture(gl, minFilter, magFilter, wrapS, wrapT) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  return texture;
}

// ─── Arcball control ──────────────────────────────────────────────────────────

class ArcballControl {
  isPointerDown = false;
  orientation = quat.create();
  pointerRotation = quat.create();
  rotationVelocity = 0;
  rotationAxis = vec3.fromValues(1, 0, 0);
  snapDirection = vec3.fromValues(0, 0, -1);
  snapTargetDirection;
  EPSILON = 0.1;
  IDENTITY_QUAT = quat.create();

  constructor(canvas, updateCallback) {
    this.canvas = canvas;
    this.updateCallback = updateCallback || (() => null);
    this.pointerPos = vec2.create();
    this.previousPointerPos = vec2.create();
    this._rotationVelocity = 0;
    this._combinedQuat = quat.create();

    const onDown = e => {
      const pos = this._getPos(e);
      vec2.set(this.pointerPos, pos[0], pos[1]);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      this.isPointerDown = true;
    };
    const onUp = () => { this.isPointerDown = false; };
    const onMove = e => {
      if (this.isPointerDown) {
        const pos = this._getPos(e);
        vec2.set(this.pointerPos, pos[0], pos[1]);
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0]); }, { passive: false });
    canvas.style.touchAction = 'none';
  }

  _getPos(e) {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  update(deltaTime, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    let snapRotation = quat.create();

    if (this.isPointerDown) {
      const INTENSITY = 0.3 * timeScale;
      const ANGLE_AMPLIFICATION = 5 / timeScale;
      const midPointerPos = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
      vec2.scale(midPointerPos, midPointerPos, INTENSITY);

      if (vec2.sqrLen(midPointerPos) > this.EPSILON) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos);
        const p = this.#project(midPointerPos);
        const q = this.#project(this.previousPointerPos);
        const a = vec3.normalize(vec3.create(), p);
        const b = vec3.normalize(vec3.create(), q);
        vec2.copy(this.previousPointerPos, midPointerPos);
        angleFactor *= ANGLE_AMPLIFICATION;
        this.quatFromVectors(a, b, this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);
      }
    } else {
      const INTENSITY = 0.1 * timeScale;
      quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);
      if (this.snapTargetDirection) {
        const SNAPPING_INTENSITY = 0.2;
        const a = this.snapTargetDirection;
        const b = this.snapDirection;
        const sqrDist = vec3.squaredDistance(a, b);
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= SNAPPING_INTENSITY * distanceFactor;
        this.quatFromVectors(a, b, snapRotation, angleFactor);
      }
    }

    const combinedQuat = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), combinedQuat, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    const RA_INTENSITY = 0.8 * timeScale;
    quat.slerp(this._combinedQuat, this._combinedQuat, combinedQuat, RA_INTENSITY);
    quat.normalize(this._combinedQuat, this._combinedQuat);

    const rad = Math.acos(this._combinedQuat[3]) * 2.0;
    const s = Math.sin(rad / 2.0);
    let rv = 0;
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI);
      this.rotationAxis[0] = this._combinedQuat[0] / s;
      this.rotationAxis[1] = this._combinedQuat[1] / s;
      this.rotationAxis[2] = this._combinedQuat[2] / s;
    }

    const RV_INTENSITY = 0.5 * timeScale;
    this._rotationVelocity += (rv - this._rotationVelocity) * RV_INTENSITY;
    this.rotationVelocity = this._rotationVelocity / timeScale;
    this.updateCallback(deltaTime);
  }

  quatFromVectors(a, b, out, angleFactor = 1) {
    const axis = vec3.cross(vec3.create(), a, b);
    vec3.normalize(axis, axis);
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    const angle = Math.acos(d) * angleFactor;
    quat.setAxisAngle(out, axis, angle);
    return { q: out, axis, angle };
  }

  #project(pos) {
    const r = 2;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const s = Math.max(w, h) - 1;
    const x = (2 * pos[0] - w - 1) / s;
    const y = (2 * pos[1] - h - 1) / s;
    let z = 0;
    const xySq = x * x + y * y;
    const rSq = r * r;
    if (xySq <= rSq / 2.0) z = Math.sqrt(rSq - xySq);
    else z = rSq / Math.sqrt(xySq);
    return vec3.fromValues(-x, y, z);
  }
}

// ─── Core WebGL scene ─────────────────────────────────────────────────────────

class InfiniteGridMenu {
  TARGET_FRAME_DURATION = 1000 / 60;
  SPHERE_RADIUS = 2;
  #time = 0; #deltaTime = 0; #deltaFrames = 0; #frames = 0;

  camera = {
    matrix: mat4.create(), near: 0.1, far: 40, fov: Math.PI / 4, aspect: 1,
    position: vec3.fromValues(0, 0, 3), up: vec3.fromValues(0, 1, 0),
    matrices: { view: mat4.create(), projection: mat4.create(), inversProjection: mat4.create() }
  };

  nearestVertexIndex = null;
  smoothRotationVelocity = 0;
  scaleFactor = 1.0;
  movementActive = false;

  constructor(canvas, items, onActiveItemChange, onMovementChange, onInit = null, scale = 1.0) {
    this.canvas = canvas;
    this.items = items || [];
    this.onActiveItemChange = onActiveItemChange || (() => { });
    this.onMovementChange = onMovementChange || (() => { });
    this.scaleFactor = scale;
    this.camera.position[2] = 3 * scale;
    this.#init(onInit);
  }

  resize() {
    this.viewportSize = vec2.set(this.viewportSize || vec2.create(), this.canvas.clientWidth, this.canvas.clientHeight);
    const gl = this.gl;
    const needsResize = resizeCanvasToDisplaySize(gl.canvas);
    if (needsResize) gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    this.#updateProjectionMatrix(gl);
  }

  setScale(scale) {
    this.scaleFactor = scale;
  }

  run(time = 0) {
    this.#deltaTime = Math.min(32, time - this.#time);
    this.#time = time;
    this.#deltaFrames = this.#deltaTime / this.TARGET_FRAME_DURATION;
    this.#frames += this.#deltaFrames;
    this.#animate(this.#deltaTime);
    this.#render();
    this._rafId = requestAnimationFrame(t => this.run(t));
  }

  destroy() { if (this._rafId) cancelAnimationFrame(this._rafId); }

  #init(onInit) {
    this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: true });
    const gl = this.gl;
    if (!gl) throw new Error('No WebGL 2 context!');

    this.viewportSize = vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
    this.drawBufferSize = vec2.clone(this.viewportSize);

    this.discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, {
      aModelPosition: 0, aModelNormal: 1, aModelUvs: 2, aInstanceMatrix: 3
    });

    this.discLocations = {
      aModelPosition: gl.getAttribLocation(this.discProgram, 'aModelPosition'),
      aModelUvs: gl.getAttribLocation(this.discProgram, 'aModelUvs'),
      aInstanceMatrix: gl.getAttribLocation(this.discProgram, 'aInstanceMatrix'),
      uWorldMatrix: gl.getUniformLocation(this.discProgram, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(this.discProgram, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(this.discProgram, 'uProjectionMatrix'),
      uCameraPosition: gl.getUniformLocation(this.discProgram, 'uCameraPosition'),
      uRotationAxisVelocity: gl.getUniformLocation(this.discProgram, 'uRotationAxisVelocity'),
      uTex: gl.getUniformLocation(this.discProgram, 'uTex'),
      uFrames: gl.getUniformLocation(this.discProgram, 'uFrames'),
      uItemCount: gl.getUniformLocation(this.discProgram, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(this.discProgram, 'uAtlasSize'),
    };

    this.discGeo = new DiscGeometry(56, 1);
    this.discBuffers = this.discGeo.data;
    this.discVAO = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition, 3],
        [makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW), this.discLocations.aModelUvs, 2],
      ],
      this.discBuffers.indices
    );

    this.icoGeo = new IcosahedronGeometry();
    this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
    this.instancePositions = this.icoGeo.vertices.map(v => v.position);
    this.DISC_INSTANCE_COUNT = this.icoGeo.vertices.length;
    this.#initDiscInstances(this.DISC_INSTANCE_COUNT);

    this.worldMatrix = mat4.create();
    this.#initTexture();

    this.control = new ArcballControl(this.canvas, deltaTime => this.#onControlUpdate(deltaTime));
    this.#updateCameraMatrix();
    this.#updateProjectionMatrix(gl);
    this.resize();

    if (onInit) onInit(this);
  }

  #initTexture() {
    const gl = this.gl;
    this.tex = createAndSetupTexture(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

    const itemCount = Math.max(1, this.items.length);
    this.atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = 512;

    canvas.width = this.atlasSize * cellSize;
    canvas.height = this.atlasSize * cellSize;

    Promise.all(
      this.items.map(
        item => new Promise(resolve => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fc = document.createElement('canvas');
            fc.width = fc.height = cellSize;
            const fctx = fc.getContext('2d');
            const grad = fctx.createRadialGradient(cellSize / 2, cellSize / 2, 0, cellSize / 2, cellSize / 2, cellSize / 1.5);
            grad.addColorStop(0, (item.color || '#1a1a2e') + 'dd');
            grad.addColorStop(1, '#0a0815');
            fctx.fillStyle = grad;
            fctx.fillRect(0, 0, cellSize, cellSize);
            fctx.strokeStyle = (item.color || '#6c3cff') + '55';
            fctx.lineWidth = 12;
            fctx.beginPath();
            fctx.arc(cellSize / 2, cellSize / 2, cellSize / 2 - 20, 0, Math.PI * 2);
            fctx.stroke();
            fctx.fillStyle = '#fff';
            fctx.font = `bold ${Math.floor(cellSize * 0.13)}px -apple-system, sans-serif`;
            fctx.textAlign = 'center';
            fctx.textBaseline = 'middle';
            fctx.fillText(item.title || '', cellSize / 2, cellSize * 0.55);
            const imgEl = new Image();
            imgEl.src = fc.toDataURL();
            imgEl.onload = () => resolve(imgEl);
          };
          img.src = item.image;
        })
      )
    ).then(images => {
      images.forEach((img, i) => {
        const x = (i % this.atlasSize) * cellSize;
        const y = Math.floor(i / this.atlasSize) * cellSize;
        ctx.drawImage(img, x, y, cellSize, cellSize);
      });
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  #initDiscInstances(count) {
    const gl = this.gl;
    this.discInstances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [],
      buffer: gl.createBuffer()
    };
    for (let i = 0; i < count; ++i) {
      const instanceMatrixArray = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(mat4.create());
      this.discInstances.matrices.push(instanceMatrixArray);
    }
    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    const mat4AttribSlotCount = 4;
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < mat4AttribSlotCount; ++j) {
      const loc = this.discLocations.aInstanceMatrix + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  #animate(deltaTime) {
    const gl = this.gl;
    this.control.update(deltaTime, this.TARGET_FRAME_DURATION);
    const positions = this.instancePositions.map(p =>
      vec3.transformQuat(vec3.create(), p, this.control.orientation)
    );
    const scale = 0.25;
    const SCALE_INTENSITY = 0.6;
    positions.forEach((p, ndx) => {
      const s = (Math.abs(p[2]) / this.SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY);
      const finalScale = s * scale;
      const matrix = mat4.create();
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)));
      mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]));
      mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -this.SPHERE_RADIUS]));
      mat4.copy(this.discInstances.matrices[ndx], matrix);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.smoothRotationVelocity = this.control.rotationVelocity;
  }

  #render() {
    const gl = this.gl;
    gl.useProgram(this.discProgram);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix, false, this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix, false, this.camera.matrices.projection);
    gl.uniform3f(this.discLocations.uCameraPosition, ...this.camera.position);
    gl.uniform4f(this.discLocations.uRotationAxisVelocity,
      this.control.rotationAxis[0], this.control.rotationAxis[1], this.control.rotationAxis[2],
      this.smoothRotationVelocity * 1.1
    );
    gl.uniform1i(this.discLocations.uItemCount, this.items.length);
    gl.uniform1i(this.discLocations.uAtlasSize, this.atlasSize);
    gl.uniform1f(this.discLocations.uFrames, this.#frames);
    gl.uniform1i(this.discLocations.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);

    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.DISC_INSTANCE_COUNT);
  }

  #updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  #updateProjectionMatrix(gl) {
    this.camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const height = this.SPHERE_RADIUS * 0.35;
    const distance = this.camera.position[2];
    if (this.camera.aspect > 1) {
      this.camera.fov = 2 * Math.atan(height / distance);
    } else {
      this.camera.fov = 2 * Math.atan(height / this.camera.aspect / distance);
    }
    mat4.perspective(this.camera.matrices.projection, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far);
    mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
  }

  #onControlUpdate(deltaTime) {
    const timeScale = deltaTime / this.TARGET_FRAME_DURATION + 0.0001;
    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;

    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;
    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving;
      this.onMovementChange(isMoving);
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.#findNearestVertexIndex();
      const itemIndex = nearestVertexIndex % Math.max(1, this.items.length);
      this.onActiveItemChange(itemIndex);
      const snapDirection = vec3.normalize(vec3.create(), this.#getVertexWorldPosition(nearestVertexIndex));
      this.control.snapTargetDirection = snapDirection;
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
      damping = 7 / timeScale;
    }

    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / damping;
    this.#updateCameraMatrix();
  }

  #findNearestVertexIndex() {
    const n = this.control.snapDirection;
    const inversOrientation = quat.conjugate(quat.create(), this.control.orientation);
    const nt = vec3.transformQuat(vec3.create(), n, inversOrientation);
    let maxD = -1, nearestVertexIndex;
    for (let i = 0; i < this.instancePositions.length; ++i) {
      const d = vec3.dot(nt, this.instancePositions[i]);
      if (d > maxD) { maxD = d; nearestVertexIndex = i; }
    }
    return nearestVertexIndex;
  }

  #getVertexWorldPosition(index) {
    return vec3.transformQuat(vec3.create(), this.instancePositions[index], this.control.orientation);
  }
}

// ─── OTT Items ────────────────────────────────────────────────────────────────

const OTT_ITEMS = [
  { title: 'Netflix', description: 'Movies & Series', color: '#E50914', link: 'https://netflix.com', image: '/ott/Netflix.jpg' },
  { title: 'Prime Video', description: 'Amazon Originals', color: '#00A8E0', link: 'https://primevideo.com', image: '/ott/prime_video.png' },
  { title: 'Disney+', description: 'Disney · Marvel · Star Wars', color: '#113CCF', link: 'https://disneyplus.com', image: '/ott/disnep.webp' },
  { title: 'Apple TV+', description: 'Apple Originals', color: '#555555', link: 'https://tv.apple.com', image: '/ott/appletv.png' },
  { title: 'Hotstar', description: 'Live · Sports · Shows', color: '#1F80E0', link: 'https://hotstar.com', image: '/ott/hotstar.jpg' },
  { title: 'Zee5', description: 'Indian Content', color: '#7B2D8B', link: 'https://zee5.com', image: '/ott/zee5.jpg' },
  { title: 'SonyLIV', description: 'Sports & Shows', color: '#003087', link: 'https://sonyliv.com', image: '/ott/sonyliv.webp' },
  { title: 'YouTube', description: 'Video & Live', color: '#FF0000', link: 'https://youtube.com', image: '/ott/youtube.avif' },
  { title: 'Max', description: 'Premium Originals', color: '#9747FF', link: 'https://max.com', image: '/ott/max.webp' },
  { title: 'Hulu', description: 'TV · Movies · Live', color: '#1CE783', link: 'https://hulu.com', image: '/ott/hulu.jpg' },
  { title: 'Twitch', description: 'Live Streaming', color: '#9146FF', link: 'https://twitch.tv', image: '/ott/twitch.png' },
  { title: 'Spotify', description: 'Music & Podcasts', color: '#1DB954', link: 'https://spotify.com', image: '/ott/spotify.jpg' },
  { title: 'Jio Cinema', description: 'Movies & Series', color: '#b91dae', link: 'https://jio.com', image: '/ott/jio_cinema.webp' },
  { title: 'Other Activities', description: 'Chill-Out & Other activities', color: '#b91dae', link: 'https://dqdgaming.com', image: '/ott/gathering.jpg' },
];

// Desktop gets a 1.25× pullback so the globe reads smaller and less cramped on
// a large monitor. Mobile stays at its existing responsive multipliers.
function getResponsiveScale() {
  const w = window.innerWidth;
  if (w <= 420) return 1.55;
  if (w <= 640) return 1.3;
  if (w <= 960) return 1.12;
  return 1.25; // ← desktop: pull back 25% more than before
}


// ─── Welcome Popup ────────────────────────────────────────────────────────────

const POPUP_DURATION = 10; // seconds

function WelcomePopup({ onClose }) {
  const [countdown, setCountdown] = useState(POPUP_DURATION);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); onClose(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onClose]);

  const progress = (countdown / POPUP_DURATION) * 100;

  const features = [
  { icon: <MonitorPlay size={15} color="#a78bfa" />, label: 'Big Screen Experience' },
  { icon: <Popcorn size={15} color="#a78bfa" />,     label: 'Snacks Included' },
  { icon: <GlassWater size={15} color="#a78bfa" />,  label: 'Cool Drinks Included' },
  { icon: <Users size={15} color="#a78bfa" />,        label: 'Groups Welcome' },
];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={popupStyles.overlay}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.9 }}
        style={popupStyles.card}
      >
        {/* Glow orbs */}
        <div style={popupStyles.glowA} />
        <div style={popupStyles.glowB} />

        {/* Countdown ring + close */}
        <div style={popupStyles.topRow}>
          {/* Countdown circle */}
          <div style={popupStyles.countdownWrap} title={`Auto-closes in ${countdown}s`}>
            <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(108,60,255,0.18)" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="url(#cdGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15 * (1 - progress / 100)}`}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
              <defs>
                <linearGradient id="cdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6c3cff" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
            </svg>
            <span style={popupStyles.countdownNum}>{countdown}</span>
          </div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.12, backgroundColor: 'rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            style={popupStyles.closeBtn}
            aria-label="Close welcome message"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(200,190,240,0.7)" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </motion.button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={popupStyles.header}
        >
          <div style={popupStyles.eyebrow}>DQD StreamSpace</div>
          <h2 style={popupStyles.title}>Your Group's<br />Private Cinema</h2>
        </motion.div>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={popupStyles.body}
        >
          Welcome to a shared entertainment space where friends, family, colleagues, or any group
          can enjoy their favourite movies and shows together on the big screen.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={popupStyles.pills}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.38 + i * 0.07, type: 'spring', stiffness: 300, damping: 20 }}
              style={popupStyles.pill}
            >
              <span style={{ fontSize: '1rem' }}>{f.icon}</span>
              <span style={popupStyles.pillLabel}>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div style={popupStyles.divider} />

        {/* CTA instruction */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={popupStyles.cta}
        >
          <div style={popupStyles.ctaStep}>
            <span style={popupStyles.ctaNum}>1</span>
            <span style={popupStyles.ctaText}>Spin the globe and pick your streaming platform</span>
          </div>
          <div style={popupStyles.ctaStep}>
            <span style={popupStyles.ctaNum}>2</span>
           <span style={popupStyles.ctaText}>
  Tap{' '}
  <span style={{ ...popupStyles.ctaHighlight, display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'middle' }}>
    <Phone size={12} color="#3da9ff" /> 
  </span>
  {' '}or{' '}
  <span style={{ ...popupStyles.ctaHighlightGreen, display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'middle' }}>
    <WhatsAppIcon size={12} color="#25d366" /> 
  </span>
  {' '}to book
</span>
          </div>
          <div style={popupStyles.ctaStep}>
            <span style={popupStyles.ctaNum}>3</span>
            <span style={popupStyles.ctaText}>Tell us your total members & any special requirements</span>
          </div>
        </motion.div>

        {/* Bottom progress bar */}
        <div style={popupStyles.progressTrack}>
          <motion.div
            style={popupStyles.progressBar}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

const popupStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(4, 3, 12, 0.72)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 'clamp(12px, 4vw, 24px)',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    background: 'linear-gradient(145deg, rgba(14,10,30,0.98) 0%, rgba(10,8,22,0.99) 100%)',
    border: '1px solid rgba(108,60,255,0.28)',
    borderRadius: 20,
    padding: 'clamp(20px, 5vw, 28px)',
    boxShadow: '0 0 0 1px rgba(0,212,255,0.06), 0 24px 60px rgba(0,0,0,0.55), 0 0 80px rgba(108,60,255,0.12)',
    overflow: 'hidden',
  },
  glowA: {
    position: 'absolute', top: -60, left: -40, width: 220, height: 220,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,60,255,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowB: {
    position: 'absolute', bottom: -50, right: -30, width: 180, height: 180,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  topRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 18,
  },
  countdownWrap: {
    position: 'relative', width: 36, height: 36,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'default',
  },
  countdownNum: {
    position: 'absolute',
    fontSize: '0.65rem', fontWeight: 700,
    color: '#00d4ff',
    fontFamily: "'Share Tech Mono', monospace",
    lineHeight: 1,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    flexShrink: 0,
  },
  header: { marginBottom: 12 },
  eyebrow: {
    fontSize: '0.62rem', letterSpacing: '2.5px', textTransform: 'uppercase',
    color: '#6c3cff', fontWeight: 600, marginBottom: 6,
    fontFamily: "'Orbitron', sans-serif",
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.35rem, 5vw, 1.7rem)',
    fontWeight: 800, lineHeight: 1.18,
    fontFamily: "'Orbitron', sans-serif",
    background: 'linear-gradient(120deg, #ffffff 30%, #a78bfa 70%, #00d4ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  body: {
    margin: '0 0 16px',
    fontSize: 'clamp(0.78rem, 2.4vw, 0.86rem)',
    lineHeight: 1.65,
    color: 'rgba(200,190,240,0.72)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  pills: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18,
  },
  pill: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(108,60,255,0.12)',
    border: '1px solid rgba(108,60,255,0.25)',
    borderRadius: 50,
    padding: '5px 11px',
  },
  pillLabel: {
    fontSize: '0.72rem', fontWeight: 600,
    color: 'rgba(210,200,255,0.85)',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    whiteSpace: 'nowrap',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(108,60,255,0.3), rgba(0,212,255,0.2), transparent)',
    marginBottom: 16,
  },
  cta: {
    display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20,
  },
  ctaStep: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  ctaNum: {
    flexShrink: 0,
    width: 20, height: 20, borderRadius: 6,
    background: 'linear-gradient(135deg, #6c3cff, #00d4ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.62rem', fontWeight: 800, color: '#fff',
    fontFamily: "'Orbitron', sans-serif",
    marginTop: 1,
  },
  ctaText: {
    fontSize: 'clamp(0.75rem, 2.3vw, 0.82rem)',
    color: 'rgba(200,190,240,0.75)',
    lineHeight: 1.5,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  ctaHighlight: {
    color: '#3da9ff', fontWeight: 600,
  },
  ctaHighlightGreen: {
    color: '#25d366', fontWeight: 600,
  },
  progressTrack: {
    height: 3, borderRadius: 2,
    background: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%', borderRadius: 2,
    background: 'linear-gradient(90deg, #6c3cff, #00d4ff)',
  },
};

// ─── React Component ──────────────────────────────────────────────────────────

export default function InfiniteMenu({ items, scale = 1.0 }) {
  const canvasRef = useRef(null);
  const sketchRef = useRef(null);
  const disclaimerTimerRef = useRef(null);
  const resolvedItems = items && items.length ? items : OTT_ITEMS;
  const [showWelcome, setShowWelcome] = useState(true);   
  
  const [activeItem, setActiveItem] = useState(resolvedItems[0]);
  const [isMoving, setIsMoving] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleActiveItem = index => {
      setActiveItem(resolvedItems[index % resolvedItems.length]);
    };

    const sketch = new InfiniteGridMenu(canvas, resolvedItems, handleActiveItem, setIsMoving, sk => sk.run(), scale);
    sketchRef.current = sketch;

    const handleResize = () => {
      sketch.resize();
      sketch.setScale(scale * getResponsiveScale());
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      sketch.destroy();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (disclaimerTimerRef.current) clearTimeout(disclaimerTimerRef.current);
    };
  }, []);

  const triggerDisclaimer = () => {
    setShowDisclaimer(true);
    if (disclaimerTimerRef.current) clearTimeout(disclaimerTimerRef.current);
    disclaimerTimerRef.current = setTimeout(() => setShowDisclaimer(false), 5000);
  };

  // Build a WhatsApp message that names the active platform so the recipient
  // knows exactly which service the user wants to watch together on.
  const whatsappMsg = activeItem
    ? `Hey! I want to watch book on DQD StreamSpace using ${activeItem.title}. Let's sync up! 🎬`
    : `Hey! Let's watch together on StreamSpace`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="ism-root" style={styles.root}>
        {/* Welcome popup */}
      <AnimatePresence>
        {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>
      {/* Ambient glow orb */}
      <div style={styles.glow} />

      {/* Globe */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Top/bottom scrims */}
      <div style={styles.scrimTop} />
      <div style={styles.scrimBottom} />

      {/* Drag hint */}
      <div style={styles.hint}>
        <DragIcon size={12} />
        <span>Drag to explore</span>
      </div>

      {/* Disclaimer info button, top right */}
      <div style={styles.infoWrap}>
        <button
          type="button"
          aria-label="Important disclaimer"
          aria-describedby="ism-disclaimer-panel"
          className="ism-info-btn"
          style={styles.infoBtn}
          onMouseEnter={triggerDisclaimer}
          onTouchStart={triggerDisclaimer}
          onFocus={triggerDisclaimer}
          onClick={triggerDisclaimer}
        >
          <span className="ism-info-aura" aria-hidden="true" />
          <span className="ism-info-aura ism-info-aura-2" aria-hidden="true" />
          <InfoIcon size={16} color="#fff" />
        </button>
        <div id="ism-disclaimer-panel" role="tooltip" style={styles.disclaimerPanel(showDisclaimer)}>
          <p style={styles.disclaimerPanelText}>
            <strong style={styles.disclaimerStrong}>Disclaimer: </strong>
            StreamSpace does not distribute OTT subscriptions. Users must bring their own
            subscriptions. We only provide a shared virtual space for watching together.
          </p>
        </div>
      </div>

      {/* Active platform badge — now full-width with call + WhatsApp actions on the right */}
      {activeItem && (
        <div style={styles.badge(isMoving, activeItem.color)}>
          {/* Platform dot icon */}
          <div style={styles.badgeIconWrap(activeItem.color)}>
            <img
              src={activeItem.image}
              alt={activeItem.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </div>

          {/* Platform name + description */}
          <div style={styles.badgeText}>
            <span style={styles.badgeName}>{activeItem.title}</span>
            <span style={styles.badgeDesc}>{activeItem.description}</span>
          </div>

          {/* Separator */}
          <div style={styles.badgeDivider} />

          {/* Call + WhatsApp actions */}
          <div style={styles.badgeActions}>
            <a
              href="tel:+917736953003" /* TODO: replace with your real support number */
              aria-label="Call us"
              className="ism-badge-action-btn"
              style={styles.badgeActionBtn('#3da9ff')}
            >
              <CallIcon size={16} color="#3da9ff" />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat on WhatsApp about ${activeItem.title}`}
              className="ism-badge-action-btn"
              style={styles.badgeActionBtn('#25d366')}
            >
              <WhatsAppIcon size={16} color="#25d366" />
            </a>
          </div>
        </div>
      )}

      <style>{`
        .ism-root {
          height: 100%;
          height: 100vh;
          height: 100dvh;
        }
        .ism-info-btn { animation: ism-info-breathe 2.4s ease-in-out infinite; }
        .ism-info-aura {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 195, 0, 0.55);
          animation: ism-aura-ping 2.4s cubic-bezier(0.4, 0, 0.3, 1) infinite;
          pointer-events: none;
        }
        .ism-info-aura-2 { animation-delay: 1.2s; }
        @keyframes ism-aura-ping {
          0% { transform: scale(0.9); opacity: 0.55; }
          70% { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes ism-info-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .ism-info-btn:focus-visible {
          outline: 2px solid rgba(255, 216, 77, 0.85);
          outline-offset: 3px;
        }
        .ism-badge-action-btn:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.85);
          outline-offset: 3px;
          border-radius: 10px;
        }
        .ism-badge-action-btn:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
        @media (prefers-reduced-motion: reduce) {
          .ism-info-btn { animation: none; }
          .ism-info-aura { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}