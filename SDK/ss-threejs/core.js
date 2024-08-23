var xi = Object.defineProperty;
var wi = (b, e, i) => e in b ? xi(b, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : b[e] = i;
var le = (b, e, i) => (wi(b, typeof e != "symbol" ? e + "" : e, i), i), Ft = (b, e, i) => {
  if (!e.has(b))
    throw TypeError("Cannot " + i);
};
var ee = (b, e, i) => (Ft(b, e, "read from private field"), i ? i.call(b) : e.get(b)), rt = (b, e, i) => {
  if (e.has(b))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(b) : e.set(b, i);
}, Ze = (b, e, i, t) => (Ft(b, e, "write to private field"), t ? t.call(b, i) : e.set(b, i), i);
import * as L from "three";
import { EventDispatcher as Si, Vector3 as _, MOUSE as qe, TOUCH as Ke, Quaternion as Me, Spherical as jt, Vector2 as Z, DataTextureLoader as Mi, HalfFloatType as Je, FloatType as yt, DataUtils as pt, LinearSRGBColorSpace as Ct, LinearFilter as et, Loader as _i, CubeTexture as Ti, FileLoader as Ei, DataTexture as Ci, Mesh as E, ShaderMaterial as Te, UniformsUtils as dt, BackSide as Pi, BoxGeometry as ye, Raycaster as Oi, Object3D as ut, Euler as Ri, Matrix4 as Ee, MeshBasicMaterial as At, LineBasicMaterial as Di, CylinderGeometry as xe, BufferGeometry as Pt, Float32BufferAttribute as wt, OctahedronGeometry as mt, Line as je, SphereGeometry as Li, TorusGeometry as nt, PlaneGeometry as Ai, DoubleSide as St, OrthographicCamera as Bi, WebGLRenderTarget as Ce, Clock as Ii, Color as me, AdditiveBlending as di, MeshDepthMaterial as zi, RGBADepthPacking as ki, NoBlending as Nt, Vector4 as ui, Box3 as Ht, Frustum as Fi, Matrix3 as fi, Box2 as Ut, Camera as ji } from "three";
import { S as Ni, a as de, s as Ne, b as Ot, c as Ue, d as ot, e as Hi, f as Ui, g as Gi, L as Wi, h as Qi, i as Vi, P as Yi, j as Xi, k as Gt, l as Zi, m as qi } from "./three.path.module-01d54a3c.js";
import Ki from "lil-gui";
import $i from "./tool/file.js";
class Ji {
  static isWebGLAvailable() {
    try {
      const e = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (e.getContext("webgl") || e.getContext("experimental-webgl")));
    } catch {
      return !1;
    }
  }
  static isWebGL2Available() {
    try {
      const e = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && e.getContext("webgl2"));
    } catch {
      return !1;
    }
  }
  static getWebGLErrorMessage() {
    return this.getErrorMessage(1);
  }
  static getWebGL2ErrorMessage() {
    return this.getErrorMessage(2);
  }
  static getErrorMessage(e) {
    const i = {
      1: "WebGL",
      2: "WebGL 2"
    }, t = {
      1: window.WebGLRenderingContext,
      2: window.WebGL2RenderingContext
    };
    let s = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';
    const n = document.createElement("div");
    return n.id = "webglmessage", n.style.fontFamily = "monospace", n.style.fontSize = "13px", n.style.fontWeight = "normal", n.style.textAlign = "center", n.style.background = "#fff", n.style.color = "#000", n.style.padding = "1.5em", n.style.width = "400px", n.style.margin = "5em auto 0", t[e] ? s = s.replace("$0", "graphics card") : s = s.replace("$0", "browser"), s = s.replace("$1", i[e]), n.innerHTML = s, n;
  }
}
const Wt = Ji, Qt = { type: "change" }, _t = { type: "start" }, Vt = { type: "end" };
class Rt extends Si {
  constructor(e, i) {
    super(), this.object = e, this.domElement = i, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new _(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: qe.ROTATE, MIDDLE: qe.DOLLY, RIGHT: qe.PAN }, this.touches = { ONE: Ke.ROTATE, TWO: Ke.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
      return o.phi;
    }, this.getAzimuthalAngle = function() {
      return o.theta;
    }, this.getDistance = function() {
      return this.object.position.distanceTo(this.target);
    }, this.listenToKeyEvents = function(a) {
      a.addEventListener("keydown", q), this._domElementKeyEvents = a;
    }, this.stopListenToKeyEvents = function() {
      this._domElementKeyEvents.removeEventListener("keydown", q), this._domElementKeyEvents = null;
    }, this.saveState = function() {
      t.target0.copy(t.target), t.position0.copy(t.object.position), t.zoom0 = t.object.zoom;
    }, this.reset = function() {
      t.target.copy(t.target0), t.object.position.copy(t.position0), t.object.zoom = t.zoom0, t.object.updateProjectionMatrix(), t.dispatchEvent(Qt), t.update(), n = s.NONE;
    }, this.update = function() {
      const a = new _(), O = new Me().setFromUnitVectors(e.up, new _(0, 1, 0)), J = O.clone().invert(), ce = new _(), ue = new Me(), Se = 2 * Math.PI;
      return function() {
        const kt = t.object.position;
        a.copy(kt).sub(t.target), a.applyQuaternion(O), o.setFromVector3(a), t.autoRotate && n === s.NONE && R(Y()), t.enableDamping ? (o.theta += l.theta * t.dampingFactor, o.phi += l.phi * t.dampingFactor) : (o.theta += l.theta, o.phi += l.phi);
        let Be = t.minAzimuthAngle, Ie = t.maxAzimuthAngle;
        return isFinite(Be) && isFinite(Ie) && (Be < -Math.PI ? Be += Se : Be > Math.PI && (Be -= Se), Ie < -Math.PI ? Ie += Se : Ie > Math.PI && (Ie -= Se), Be <= Ie ? o.theta = Math.max(Be, Math.min(Ie, o.theta)) : o.theta = o.theta > (Be + Ie) / 2 ? Math.max(Be, o.theta) : Math.min(Ie, o.theta)), o.phi = Math.max(t.minPolarAngle, Math.min(t.maxPolarAngle, o.phi)), o.makeSafe(), o.radius *= c, o.radius = Math.max(t.minDistance, Math.min(t.maxDistance, o.radius)), t.enableDamping === !0 ? t.target.addScaledVector(d, t.dampingFactor) : t.target.add(d), a.setFromSpherical(o), a.applyQuaternion(J), kt.copy(t.target).add(a), t.object.lookAt(t.target), t.enableDamping === !0 ? (l.theta *= 1 - t.dampingFactor, l.phi *= 1 - t.dampingFactor, d.multiplyScalar(1 - t.dampingFactor)) : (l.set(0, 0, 0), d.set(0, 0, 0)), c = 1, f || ce.distanceToSquared(t.object.position) > r || 8 * (1 - ue.dot(t.object.quaternion)) > r ? (t.dispatchEvent(Qt), ce.copy(t.object.position), ue.copy(t.object.quaternion), f = !1, !0) : !1;
      };
    }(), this.dispose = function() {
      t.domElement.removeEventListener("contextmenu", M), t.domElement.removeEventListener("pointerdown", T), t.domElement.removeEventListener("pointercancel", H), t.domElement.removeEventListener("wheel", I), t.domElement.removeEventListener("pointermove", D), t.domElement.removeEventListener("pointerup", H), t._domElementKeyEvents !== null && (t._domElementKeyEvents.removeEventListener("keydown", q), t._domElementKeyEvents = null);
    };
    const t = this, s = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let n = s.NONE;
    const r = 1e-6, o = new jt(), l = new jt();
    let c = 1;
    const d = new _();
    let f = !1;
    const k = new Z(), u = new Z(), g = new Z(), p = new Z(), h = new Z(), S = new Z(), P = new Z(), m = new Z(), x = new Z(), y = [], A = {};
    function Y() {
      return 2 * Math.PI / 60 / 60 * t.autoRotateSpeed;
    }
    function j() {
      return Math.pow(0.95, t.zoomSpeed);
    }
    function R(a) {
      l.theta -= a;
    }
    function W(a) {
      l.phi -= a;
    }
    const N = function() {
      const a = new _();
      return function(J, ce) {
        a.setFromMatrixColumn(ce, 0), a.multiplyScalar(-J), d.add(a);
      };
    }(), oe = function() {
      const a = new _();
      return function(J, ce) {
        t.screenSpacePanning === !0 ? a.setFromMatrixColumn(ce, 1) : (a.setFromMatrixColumn(ce, 0), a.crossVectors(t.object.up, a)), a.multiplyScalar(J), d.add(a);
      };
    }(), ge = function() {
      const a = new _();
      return function(J, ce) {
        const ue = t.domElement;
        if (t.object.isPerspectiveCamera) {
          const Se = t.object.position;
          a.copy(Se).sub(t.target);
          let ft = a.length();
          ft *= Math.tan(t.object.fov / 2 * Math.PI / 180), N(2 * J * ft / ue.clientHeight, t.object.matrix), oe(2 * ce * ft / ue.clientHeight, t.object.matrix);
        } else
          t.object.isOrthographicCamera ? (N(J * (t.object.right - t.object.left) / t.object.zoom / ue.clientWidth, t.object.matrix), oe(ce * (t.object.top - t.object.bottom) / t.object.zoom / ue.clientHeight, t.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), t.enablePan = !1);
      };
    }();
    function se(a) {
      t.object.isPerspectiveCamera ? c /= a : t.object.isOrthographicCamera ? (t.object.zoom = Math.max(t.minZoom, Math.min(t.maxZoom, t.object.zoom * a)), t.object.updateProjectionMatrix(), f = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), t.enableZoom = !1);
    }
    function $(a) {
      t.object.isPerspectiveCamera ? c *= a : t.object.isOrthographicCamera ? (t.object.zoom = Math.max(t.minZoom, Math.min(t.maxZoom, t.object.zoom / a)), t.object.updateProjectionMatrix(), f = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), t.enableZoom = !1);
    }
    function ve(a) {
      k.set(a.clientX, a.clientY);
    }
    function Q(a) {
      P.set(a.clientX, a.clientY);
    }
    function X(a) {
      p.set(a.clientX, a.clientY);
    }
    function re(a) {
      u.set(a.clientX, a.clientY), g.subVectors(u, k).multiplyScalar(t.rotateSpeed);
      const O = t.domElement;
      R(2 * Math.PI * g.x / O.clientHeight), W(2 * Math.PI * g.y / O.clientHeight), k.copy(u), t.update();
    }
    function ne(a) {
      m.set(a.clientX, a.clientY), x.subVectors(m, P), x.y > 0 ? se(j()) : x.y < 0 && $(j()), P.copy(m), t.update();
    }
    function Pe(a) {
      h.set(a.clientX, a.clientY), S.subVectors(h, p).multiplyScalar(t.panSpeed), ge(S.x, S.y), p.copy(h), t.update();
    }
    function Oe(a) {
      a.deltaY < 0 ? $(j()) : a.deltaY > 0 && se(j()), t.update();
    }
    function We(a) {
      let O = !1;
      switch (a.code) {
        case t.keys.UP:
          a.ctrlKey || a.metaKey || a.shiftKey ? W(2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(0, t.keyPanSpeed), O = !0;
          break;
        case t.keys.BOTTOM:
          a.ctrlKey || a.metaKey || a.shiftKey ? W(-2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(0, -t.keyPanSpeed), O = !0;
          break;
        case t.keys.LEFT:
          a.ctrlKey || a.metaKey || a.shiftKey ? R(2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(t.keyPanSpeed, 0), O = !0;
          break;
        case t.keys.RIGHT:
          a.ctrlKey || a.metaKey || a.shiftKey ? R(-2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(-t.keyPanSpeed, 0), O = !0;
          break;
      }
      O && (a.preventDefault(), t.update());
    }
    function Le() {
      if (y.length === 1)
        k.set(y[0].pageX, y[0].pageY);
      else {
        const a = 0.5 * (y[0].pageX + y[1].pageX), O = 0.5 * (y[0].pageY + y[1].pageY);
        k.set(a, O);
      }
    }
    function Xe() {
      if (y.length === 1)
        p.set(y[0].pageX, y[0].pageY);
      else {
        const a = 0.5 * (y[0].pageX + y[1].pageX), O = 0.5 * (y[0].pageY + y[1].pageY);
        p.set(a, O);
      }
    }
    function Ae() {
      const a = y[0].pageX - y[1].pageX, O = y[0].pageY - y[1].pageY, J = Math.sqrt(a * a + O * O);
      P.set(0, J);
    }
    function Qe() {
      t.enableZoom && Ae(), t.enablePan && Xe();
    }
    function v() {
      t.enableZoom && Ae(), t.enableRotate && Le();
    }
    function G(a) {
      if (y.length == 1)
        u.set(a.pageX, a.pageY);
      else {
        const J = be(a), ce = 0.5 * (a.pageX + J.x), ue = 0.5 * (a.pageY + J.y);
        u.set(ce, ue);
      }
      g.subVectors(u, k).multiplyScalar(t.rotateSpeed);
      const O = t.domElement;
      R(2 * Math.PI * g.x / O.clientHeight), W(2 * Math.PI * g.y / O.clientHeight), k.copy(u);
    }
    function w(a) {
      if (y.length === 1)
        h.set(a.pageX, a.pageY);
      else {
        const O = be(a), J = 0.5 * (a.pageX + O.x), ce = 0.5 * (a.pageY + O.y);
        h.set(J, ce);
      }
      S.subVectors(h, p).multiplyScalar(t.panSpeed), ge(S.x, S.y), p.copy(h);
    }
    function C(a) {
      const O = be(a), J = a.pageX - O.x, ce = a.pageY - O.y, ue = Math.sqrt(J * J + ce * ce);
      m.set(0, ue), x.set(0, Math.pow(m.y / P.y, t.zoomSpeed)), se(x.y), P.copy(m);
    }
    function F(a) {
      t.enableZoom && C(a), t.enablePan && w(a);
    }
    function B(a) {
      t.enableZoom && C(a), t.enableRotate && G(a);
    }
    function T(a) {
      t.enabled !== !1 && (y.length === 0 && (t.domElement.setPointerCapture(a.pointerId), t.domElement.addEventListener("pointermove", D), t.domElement.addEventListener("pointerup", H)), U(a), a.pointerType === "touch" ? fe(a) : te(a));
    }
    function D(a) {
      t.enabled !== !1 && (a.pointerType === "touch" ? z(a) : he(a));
    }
    function H(a) {
      V(a), y.length === 0 && (t.domElement.releasePointerCapture(a.pointerId), t.domElement.removeEventListener("pointermove", D), t.domElement.removeEventListener("pointerup", H)), t.dispatchEvent(Vt), n = s.NONE;
    }
    function te(a) {
      let O;
      switch (a.button) {
        case 0:
          O = t.mouseButtons.LEFT;
          break;
        case 1:
          O = t.mouseButtons.MIDDLE;
          break;
        case 2:
          O = t.mouseButtons.RIGHT;
          break;
        default:
          O = -1;
      }
      switch (O) {
        case qe.DOLLY:
          if (t.enableZoom === !1)
            return;
          Q(a), n = s.DOLLY;
          break;
        case qe.ROTATE:
          if (a.ctrlKey || a.metaKey || a.shiftKey) {
            if (t.enablePan === !1)
              return;
            X(a), n = s.PAN;
          } else {
            if (t.enableRotate === !1)
              return;
            ve(a), n = s.ROTATE;
          }
          break;
        case qe.PAN:
          if (a.ctrlKey || a.metaKey || a.shiftKey) {
            if (t.enableRotate === !1)
              return;
            ve(a), n = s.ROTATE;
          } else {
            if (t.enablePan === !1)
              return;
            X(a), n = s.PAN;
          }
          break;
        default:
          n = s.NONE;
      }
      n !== s.NONE && t.dispatchEvent(_t);
    }
    function he(a) {
      switch (n) {
        case s.ROTATE:
          if (t.enableRotate === !1)
            return;
          re(a);
          break;
        case s.DOLLY:
          if (t.enableZoom === !1)
            return;
          ne(a);
          break;
        case s.PAN:
          if (t.enablePan === !1)
            return;
          Pe(a);
          break;
      }
    }
    function I(a) {
      t.enabled === !1 || t.enableZoom === !1 || n !== s.NONE || (a.preventDefault(), t.dispatchEvent(_t), Oe(a), t.dispatchEvent(Vt));
    }
    function q(a) {
      t.enabled === !1 || t.enablePan === !1 || We(a);
    }
    function fe(a) {
      switch (K(a), y.length) {
        case 1:
          switch (t.touches.ONE) {
            case Ke.ROTATE:
              if (t.enableRotate === !1)
                return;
              Le(), n = s.TOUCH_ROTATE;
              break;
            case Ke.PAN:
              if (t.enablePan === !1)
                return;
              Xe(), n = s.TOUCH_PAN;
              break;
            default:
              n = s.NONE;
          }
          break;
        case 2:
          switch (t.touches.TWO) {
            case Ke.DOLLY_PAN:
              if (t.enableZoom === !1 && t.enablePan === !1)
                return;
              Qe(), n = s.TOUCH_DOLLY_PAN;
              break;
            case Ke.DOLLY_ROTATE:
              if (t.enableZoom === !1 && t.enableRotate === !1)
                return;
              v(), n = s.TOUCH_DOLLY_ROTATE;
              break;
            default:
              n = s.NONE;
          }
          break;
        default:
          n = s.NONE;
      }
      n !== s.NONE && t.dispatchEvent(_t);
    }
    function z(a) {
      switch (K(a), n) {
        case s.TOUCH_ROTATE:
          if (t.enableRotate === !1)
            return;
          G(a), t.update();
          break;
        case s.TOUCH_PAN:
          if (t.enablePan === !1)
            return;
          w(a), t.update();
          break;
        case s.TOUCH_DOLLY_PAN:
          if (t.enableZoom === !1 && t.enablePan === !1)
            return;
          F(a), t.update();
          break;
        case s.TOUCH_DOLLY_ROTATE:
          if (t.enableZoom === !1 && t.enableRotate === !1)
            return;
          B(a), t.update();
          break;
        default:
          n = s.NONE;
      }
    }
    function M(a) {
      t.enabled !== !1 && a.preventDefault();
    }
    function U(a) {
      y.push(a);
    }
    function V(a) {
      delete A[a.pointerId];
      for (let O = 0; O < y.length; O++)
        if (y[O].pointerId == a.pointerId) {
          y.splice(O, 1);
          return;
        }
    }
    function K(a) {
      let O = A[a.pointerId];
      O === void 0 && (O = new Z(), A[a.pointerId] = O), O.set(a.pageX, a.pageY);
    }
    function be(a) {
      const O = a.pointerId === y[0].pointerId ? y[1] : y[0];
      return A[O.pointerId];
    }
    t.domElement.addEventListener("contextmenu", M), t.domElement.addEventListener("pointerdown", T), t.domElement.addEventListener("pointercancel", H), t.domElement.addEventListener("wheel", I, { passive: !1 }), this.update();
  }
}
class pi extends Mi {
  constructor(e) {
    super(e), this.type = Je;
  }
  // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html
  parse(e) {
    const o = function(m, x) {
      switch (m) {
        case 1:
          console.error("THREE.RGBELoader Read Error: " + (x || ""));
          break;
        case 2:
          console.error("THREE.RGBELoader Write Error: " + (x || ""));
          break;
        case 3:
          console.error("THREE.RGBELoader Bad File Format: " + (x || ""));
          break;
        default:
        case 4:
          console.error("THREE.RGBELoader: Error: " + (x || ""));
      }
      return -1;
    }, f = `
`, k = function(m, x, y) {
      x = x || 1024;
      let Y = m.pos, j = -1, R = 0, W = "", N = String.fromCharCode.apply(null, new Uint16Array(m.subarray(Y, Y + 128)));
      for (; 0 > (j = N.indexOf(f)) && R < x && Y < m.byteLength; )
        W += N, R += N.length, Y += 128, N += String.fromCharCode.apply(null, new Uint16Array(m.subarray(Y, Y + 128)));
      return -1 < j ? (y !== !1 && (m.pos += R + j + 1), W + N.slice(0, j)) : !1;
    }, u = function(m) {
      const x = /^#\?(\S+)/, y = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/, A = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/, Y = /^\s*FORMAT=(\S+)\s*$/, j = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/, R = {
        valid: 0,
        /* indicate which fields are valid */
        string: "",
        /* the actual header string */
        comments: "",
        /* comments found in header */
        programtype: "RGBE",
        /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */
        format: "",
        /* RGBE format, default 32-bit_rle_rgbe */
        gamma: 1,
        /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */
        exposure: 1,
        /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */
        width: 0,
        height: 0
        /* image dimensions, width/height */
      };
      let W, N;
      if (m.pos >= m.byteLength || !(W = k(m)))
        return o(1, "no header found");
      if (!(N = W.match(x)))
        return o(3, "bad initial token");
      for (R.valid |= 1, R.programtype = N[1], R.string += W + `
`; W = k(m), W !== !1; ) {
        if (R.string += W + `
`, W.charAt(0) === "#") {
          R.comments += W + `
`;
          continue;
        }
        if ((N = W.match(y)) && (R.gamma = parseFloat(N[1])), (N = W.match(A)) && (R.exposure = parseFloat(N[1])), (N = W.match(Y)) && (R.valid |= 2, R.format = N[1]), (N = W.match(j)) && (R.valid |= 4, R.height = parseInt(N[1], 10), R.width = parseInt(N[2], 10)), R.valid & 2 && R.valid & 4)
          break;
      }
      return R.valid & 2 ? R.valid & 4 ? R : o(3, "missing image size specifier") : o(3, "missing format specifier");
    }, g = function(m, x, y) {
      const A = x;
      if (
        // run length encoding is not allowed so read flat
        A < 8 || A > 32767 || // this file is not run length encoded
        m[0] !== 2 || m[1] !== 2 || m[2] & 128
      )
        return new Uint8Array(m);
      if (A !== (m[2] << 8 | m[3]))
        return o(3, "wrong scanline width");
      const Y = new Uint8Array(4 * x * y);
      if (!Y.length)
        return o(4, "unable to allocate buffer space");
      let j = 0, R = 0;
      const W = 4 * A, N = new Uint8Array(4), oe = new Uint8Array(W);
      let ge = y;
      for (; ge > 0 && R < m.byteLength; ) {
        if (R + 4 > m.byteLength)
          return o(1);
        if (N[0] = m[R++], N[1] = m[R++], N[2] = m[R++], N[3] = m[R++], N[0] != 2 || N[1] != 2 || (N[2] << 8 | N[3]) != A)
          return o(3, "bad rgbe scanline format");
        let se = 0, $;
        for (; se < W && R < m.byteLength; ) {
          $ = m[R++];
          const Q = $ > 128;
          if (Q && ($ -= 128), $ === 0 || se + $ > W)
            return o(3, "bad scanline data");
          if (Q) {
            const X = m[R++];
            for (let re = 0; re < $; re++)
              oe[se++] = X;
          } else
            oe.set(m.subarray(R, R + $), se), se += $, R += $;
        }
        const ve = A;
        for (let Q = 0; Q < ve; Q++) {
          let X = 0;
          Y[j] = oe[Q + X], X += A, Y[j + 1] = oe[Q + X], X += A, Y[j + 2] = oe[Q + X], X += A, Y[j + 3] = oe[Q + X], j += 4;
        }
        ge--;
      }
      return Y;
    }, p = function(m, x, y, A) {
      const Y = m[x + 3], j = Math.pow(2, Y - 128) / 255;
      y[A + 0] = m[x + 0] * j, y[A + 1] = m[x + 1] * j, y[A + 2] = m[x + 2] * j, y[A + 3] = 1;
    }, h = function(m, x, y, A) {
      const Y = m[x + 3], j = Math.pow(2, Y - 128) / 255;
      y[A + 0] = pt.toHalfFloat(Math.min(m[x + 0] * j, 65504)), y[A + 1] = pt.toHalfFloat(Math.min(m[x + 1] * j, 65504)), y[A + 2] = pt.toHalfFloat(Math.min(m[x + 2] * j, 65504)), y[A + 3] = pt.toHalfFloat(1);
    }, S = new Uint8Array(e);
    S.pos = 0;
    const P = u(S);
    if (P !== -1) {
      const m = P.width, x = P.height, y = g(S.subarray(S.pos), m, x);
      if (y !== -1) {
        let A, Y, j;
        switch (this.type) {
          case yt:
            j = y.length / 4;
            const R = new Float32Array(j * 4);
            for (let N = 0; N < j; N++)
              p(y, N * 4, R, N * 4);
            A = R, Y = yt;
            break;
          case Je:
            j = y.length / 4;
            const W = new Uint16Array(j * 4);
            for (let N = 0; N < j; N++)
              h(y, N * 4, W, N * 4);
            A = W, Y = Je;
            break;
          default:
            console.error("THREE.RGBELoader: unsupported type: ", this.type);
            break;
        }
        return {
          width: m,
          height: x,
          data: A,
          header: P.string,
          gamma: P.gamma,
          exposure: P.exposure,
          type: Y
        };
      }
    }
    return null;
  }
  setDataType(e) {
    return this.type = e, this;
  }
  load(e, i, t, s) {
    function n(r, o) {
      switch (r.type) {
        case yt:
        case Je:
          r.colorSpace = Ct, r.minFilter = et, r.magFilter = et, r.generateMipmaps = !1, r.flipY = !0;
          break;
      }
      i && i(r, o);
    }
    return super.load(e, n, t, s);
  }
}
class es extends _i {
  constructor(e) {
    super(e), this.hdrLoader = new pi(), this.type = Je;
  }
  load(e, i, t, s) {
    const n = new Ti();
    switch (n.type = this.type, n.type) {
      case yt:
        n.colorSpace = Ct, n.minFilter = et, n.magFilter = et, n.generateMipmaps = !1;
        break;
      case Je:
        n.colorSpace = Ct, n.minFilter = et, n.magFilter = et, n.generateMipmaps = !1;
        break;
    }
    const r = this;
    let o = 0;
    function l(c, d, f, k) {
      new Ei(r.manager).setPath(r.path).setResponseType("arraybuffer").setWithCredentials(r.withCredentials).load(e[c], function(u) {
        o++;
        const g = r.hdrLoader.parse(u);
        if (g) {
          if (g.data !== void 0) {
            const p = new Ci(g.data, g.width, g.height);
            p.type = n.type, p.colorSpace = n.colorSpace, p.format = n.format, p.minFilter = n.minFilter, p.magFilter = n.magFilter, p.generateMipmaps = n.generateMipmaps, n.images[c] = p;
          }
          o === 6 && (n.needsUpdate = !0, d && d(n));
        }
      }, f, k);
    }
    for (let c = 0; c < e.length; c++)
      l(c, i, t, s);
    return n;
  }
  setDataType(e) {
    return this.type = e, this.hdrLoader.setDataType(e), this;
  }
}
class Mt extends E {
  constructor() {
    const e = Mt.SkyShader, i = new Te({
      name: "SkyShader",
      fragmentShader: e.fragmentShader,
      vertexShader: e.vertexShader,
      uniforms: dt.clone(e.uniforms),
      side: Pi,
      depthWrite: !1
    });
    super(new ye(1, 1, 1), i), this.isSky = !0;
  }
}
Mt.SkyShader = {
  uniforms: {
    turbidity: { value: 2 },
    rayleigh: { value: 1 },
    mieCoefficient: { value: 5e-3 },
    mieDirectionalG: { value: 0.8 },
    sunPosition: { value: new _() },
    up: { value: new _(0, 1, 0) }
  },
  vertexShader: (
    /* glsl */
    `
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`
  ),
  fragmentShader: (
    /* glsl */
    `
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		uniform float mieDirectionalG;
		uniform vec3 up;

		const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}

		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPos );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			gl_FragColor = vec4( retColor, 1.0 );

			#include <tonemapping_fragment>
			#include <encodings_fragment>

		}`
  )
};
class ts {
  constructor(e) {
    this.threeContainer = null, this.threeScene = null, this.sceneHelper = null, this.threeCamera = null, this.threeRenderer = null, this.threeOrbitControl = null, this.threeEffectComposer = null, this._resizeObserver = null, this.getModelsByPoint = (i, t = this.threeScene.children, s = []) => {
      const n = new L.Vector2(
        i.offsetX / this.threeContainer.offsetWidth * 2 - 1,
        // 规范设施横坐标
        -(i.offsetY / this.threeContainer.offsetHeight) * 2 + 1
      ), r = [
        "AmbientLight",
        "PointLight",
        "PointLightHelper",
        "SpotLight",
        "SpotLightHelper",
        "DirectionalLight",
        "DirectionalLightHelper",
        "TransformControls",
        "CameraHelper",
        "AxesHelper",
        "GridHelper",
        "BoxHelper"
      ], l = (t || this.threeScene.children).filter(
        (g) => r.indexOf(g.constructor.name) === -1
      ), c = new L.Raycaster();
      c.setFromCamera(n, this.threeCamera);
      let d = c.intersectObjects(l, !0);
      const f = ["Line", "Line2", "Line3"], k = ["可视域视锥体"], u = (g) => !(k.indexOf(g.name) !== -1 || s.indexOf(g.name) !== -1);
      return d = d.filter(
        (g) => f.indexOf(g.object.type) === -1 && g.object.visible === !0 && u(g.object)
      ), d;
    }, this.changeCameraMode = (i) => {
      var t;
      if (i !== this.threeCamera.type) {
        if (this.removeCameraHelper(), this.threeCamera && (this.threeCamera = null, (t = this.threeOrbitControl) == null || t.dispose(), this.threeOrbitControl = null), i === "PerspectiveCamera") {
          const s = new L.PerspectiveCamera();
          s.position.set(2, 2, 2), this.threeCamera = s, this.threeOrbitControl = new Rt(this.threeCamera, this.threeContainer);
        } else if (i === "OrthographicCamera") {
          const s = new L.OrthographicCamera();
          s.position.set(0, 4, 0), this.threeCamera = s, this.threeOrbitControl = new Rt(this.threeCamera, this.threeContainer);
        }
        this.renderOnce(), this.threeOrbitControl.update(), this.addCameraHelper();
      }
    }, this.autoWindowResize = () => {
      this.threeRenderer.setSize(this.threeContainer.offsetWidth, this.threeContainer.offsetHeight);
      const i = new window.ResizeObserver(() => {
        this.updateCameraMatrix(), this.threeRenderer.setSize(this.threeContainer.offsetWidth, this.threeContainer.offsetHeight);
      });
      i.observe(this.threeContainer), this._resizeObserver = i;
    }, this.threeContainer = e.container, this.threeScene = e.scene, this.sceneHelper = e.sceneHelper, this.threeOrbitControl = e.control, this.threeCamera = e.camera, this.threeRenderer = e.renderer, this.threeEffectComposer = e.effectComposer;
  }
  destory() {
    var e;
    (e = this._resizeObserver) == null || e.disconnect(), this._resizeObserver = null, this.cancelRenderLoop(), this.removeCameraHelper();
  }
  /**
   * 设置视角位置
   * @param cameraPosition 相机位置
   * @param controlPosition 场景位置
   * @param animate 开启动画
   * @param animateSpeed 动画速度
   * @param complete 结束事件
   */
  setEye(e, i, t = !0, s = 0.5, n) {
    if (!t)
      this.threeCamera.position.copy(e), this.threeOrbitControl.target.copy(i), this.threeOrbitControl.update();
    else {
      const r = {
        camera_x: this.threeCamera.position.x,
        camera_y: this.threeCamera.position.y,
        camera_z: this.threeCamera.position.z,
        orbitControl_x: this.threeOrbitControl.target.x,
        orbitControl_y: this.threeOrbitControl.target.y,
        orbitControl_z: this.threeOrbitControl.target.z
      }, o = {
        camera_x: e.x,
        camera_y: e.y,
        camera_z: e.z,
        orbitControl_x: i.x,
        orbitControl_y: i.y,
        orbitControl_z: i.z
      };
      Ni.useTweenAnimate(
        r,
        o,
        (l) => {
          this.threeCamera.position.set(l.camera_x, l.camera_y, l.camera_z), this.threeOrbitControl.target.set(l.orbitControl_x, l.orbitControl_y, l.orbitControl_z), this.threeOrbitControl.update();
        },
        s,
        n
      );
    }
  }
  /**
   * 选择视角位置
   */
  getEye() {
    return {
      camera: this.threeCamera.position,
      target: this.threeOrbitControl.target
    };
  }
  /**
   * 手动更新相机矩阵
   */
  updateCameraMatrix() {
    const e = this.threeContainer.offsetWidth / this.threeContainer.offsetHeight;
    this.threeCamera instanceof L.PerspectiveCamera ? this.threeCamera.aspect = e : this.threeCamera instanceof L.OrthographicCamera && (this.threeCamera.left = -e * 1, this.threeCamera.right = e * 1, this.threeCamera.top = 1, this.threeCamera.bottom = -1), this.threeCamera.updateProjectionMatrix();
  }
  /**
   * webgl render
   */
  renderLoop() {
    this.updateCameraMatrix(), de.add(() => {
      this.threeRenderer.render(this.threeScene, this.threeCamera);
    }, "webglrender update");
  }
  /**
   * 页面渲染
   */
  renderOnce() {
    this.threeRenderer.render(this.threeScene, this.threeCamera), this.sceneHelper && (this.threeRenderer.autoClear = !1, this.threeRenderer.render(this.sceneHelper, this.threeCamera), this.threeRenderer.autoClear = !0);
  }
  /**
   * cancel webgl render
   */
  cancelRenderLoop() {
    de.removeId("webglrender update");
  }
  /**
   * 新增 Camera Helper
   */
  addCameraHelper() {
    const e = new L.CameraHelper(this.threeCamera);
    e.name = "Camera Helper", this.threeScene.add(e);
  }
  /**
   * 移除 Camera Helper
   */
  removeCameraHelper() {
    const e = this.threeScene.getObjectByName("Camera Helper");
    e instanceof L.CameraHelper && (e.dispose(), this.threeScene.remove(e));
  }
}
class is {
  constructor() {
    this._subscribeObjs = {}, this.subscribe = (e, i) => {
      const t = this._subscribeObjs[e] || [], s = Symbol("subcribe");
      return t.push({
        type: s,
        fn: i
      }), this._subscribeObjs[e] = t, s;
    }, this.remove = (e, i) => {
      const t = this._subscribeObjs[e] || [], s = t.findIndex((n) => n.type === i);
      t.splice(s, 1);
    }, this.publish = (e = "", i = {}) => {
      const t = this._subscribeObjs[e] || [];
      for (let s = 0; s < t.length; s += 1) {
        const { fn: n } = t[s];
        n == null || n(i);
      }
    };
  }
}
const Yt = new is(), Xt = "SSModuleUpdateScribe";
class ss {
  /**
   * @param {SSThreeObject} ssThreeObject 构造参数
   */
  constructor(e) {
    /**
     * @type GUI
     */
    le(this, "_debugGui", null);
    /**
     * @type SSThreeObject
     */
    le(this, "_ssThreeObject", null);
    /**
     * @type HTMLElement dom
     */
    le(this, "_menuContainer", null);
    /**
     * @type Array<SSModuleInterface>
     */
    le(this, "_modules", null);
    /**
     * 当前正在调试的模块
     * @type {SSModuleInterface}
     */
    le(this, "_currentEnableModule", null);
    /**
     * 根据类名查询模块实例
     * @param {string} moduleName
     * @returns {SSModuleInterface}
     */
    le(this, "getModuleByClassName", (e) => {
      var i;
      return (i = this._modules) == null ? void 0 : i.find((t) => t.__name === e);
    });
    /**
     * 增加 模块调试工具
     * @param {SSModuleInterface} aModule 模块
     * @returns {GUI}
     */
    le(this, "_addModuleGui", (e) => {
      var t, s;
      const i = (t = e.getModuleConfig) == null ? void 0 : t.call(e);
      if (i) {
        i.模块调试 = !1;
        const n = this._debugGui.addFolder(e.title || e.__name);
        e.__gui = n;
        const r = (s = e.getModuleConfigSource) == null ? void 0 : s.call(e);
        return this._addDebugForObject(
          i,
          n,
          (o) => {
            var l;
            o.key === "模块调试" && (o.value ? (this._currentEnableModule && this._currentEnableModule.moduleUpdateGuiValue("模块调试", !1), e.moduleOpenDebug(), this._currentEnableModule = e) : (e.moduleCloseDebug(), this._currentEnableModule = null)), i.模块调试 && ((l = e.moduleGuiChange) == null || l.call(e, {
              ...o,
              target: i
            }));
          },
          r
        ), n;
      }
      return null;
    });
    /**
     * add menu icon
     */
    le(this, "_addDrawIcon", () => {
      const e = document.createElement("div");
      e.innerText = "调", e.className = Ne.menuicon, this._ssThreeObject.threeContainer.parentElement.append(e), ["relative", "absolute"].indexOf(
        this._ssThreeObject.threeContainer.parentElement.style.position
      ) === -1 && (this._ssThreeObject.threeContainer.parentElement.style.position = "relative"), e.onclick = () => {
        this._menuContainer.parentElement.style.right = "0px", this._menuContainer.parentElement.style.opacity = 1;
      };
    });
    /**
     * add drawer view
     */
    le(this, "_addDrawerView", () => {
      const e = document.createElement("div");
      e.className = Ne.drawer, this._ssThreeObject.threeContainer.parentElement.append(e);
      const i = document.createElement("div");
      i.className = Ne.drawerheader, e.append(i);
      const t = document.createElement("span");
      t.className = Ne.drawerheadertitle, t.innerText = "场景调试", i.append(t);
      const s = document.createElement("div");
      s.innerText = "X", s.className = Ne.drawerheaderclose, i.append(s), s.onpointerdown = () => {
        e.style.right = `-${e.offsetWidth}px`;
      };
      const n = document.createElement("div");
      n.className = Ne.contentview, e.append(n), this._menuContainer = n;
      const r = document.createElement("div");
      r.className = Ne.drawerfooter, e.append(r);
      const o = document.createElement("div");
      o.className = Ne.drawerfooterbtn, o.innerText = "导出配置", r.append(o), o.onclick = () => {
        this.export();
      };
    });
    this._ssThreeObject = e;
  }
  destroy() {
    var e;
    this.unregisterModules(), this.closeDebugModel(), (e = this._debugGui) == null || e.destroy();
  }
  /**
   * 模块注册
   * @param {Array<SSModuleInterface>} modules
   */
  registerModules(e = []) {
    this._modules = [], e.forEach((i) => {
      var s;
      const t = new i();
      t.ssThreeObject = this._ssThreeObject, t.__name = i.name, (s = t.moduleMount) == null || s.call(t, this._ssThreeObject), this._modules.push(t);
    }), Yt.subscribe(Xt, (i) => {
      const t = i.__gui;
      t == null || t.destroy(), this._debugGui && this._addModuleGui(i).open();
    });
  }
  /**
   * 模块解除注册
   */
  unregisterModules() {
    var e;
    (e = this._modules) == null || e.forEach((i) => {
      var t;
      i.ssThreeObject = null, (t = i.moduleUnmount) == null || t.call(i);
    }), this._modules = null;
  }
  /**
   * export setting to json
   */
  export() {
    const e = {};
    this._modules.forEach((i) => {
      var s;
      const t = (s = i.moduleExport) == null ? void 0 : s.call(i);
      t && (e[i.__name] = t);
    }), $i.exportJson(e, "ssthreejs.setting.json");
  }
  /**
   * 导入设置
   * @param {{}} fileSetting 加载的配置
   */
  import(e = {}) {
    this._modules.forEach((i) => {
      const t = e[i.__name];
      if (t) {
        const s = (n) => {
          Object.keys(n).forEach((r) => {
            const o = n[r];
            o instanceof Object && (o.r !== void 0 && o.g !== void 0 && o.b !== void 0 && (n[r] = new L.Color(o.r, o.g, o.b)), s(o));
          });
        };
        s(t), i.moduleImport(t), Yt.publish(Xt, i);
      }
    });
  }
  /**
   * 增加调试
   */
  openDebugModel() {
    this._addDrawIcon(), this._addDrawerView(), this._debugGui === null && (this._debugGui = new Ki({
      autoPlace: !0,
      injectStyles: !0,
      title: "场景调试",
      closeFolders: !0,
      container: this._menuContainer,
      width: "100%"
    })), this._modules.forEach(this._addModuleGui);
  }
  /**
   * 移除调试
   */
  closeDebugModel() {
    var e;
    this._menuContainer && ((e = this._menuContainer.parentElement) == null || e.remove());
  }
  /**
   * 新增 gui 事件
   * @param {object} options 配置对象
   * @param {GUI} [floder] gui
   * @param {function({key: string, value: string, data: object}):void} [onDebugChange] 调试改变的时候
   * @param {object} [optionSource={}] select组件数据源
   */
  _addDebugForObject(e = {}, i = this._debugGui, t = null, s = {}) {
    var r, o;
    const n = Object.keys(e);
    for (let l = 0; l < n.length; l++) {
      const c = n[l], d = e[c];
      if (d instanceof L.Color) {
        i.addColor(
          {
            [c]: d.getRGB({})
          },
          c
        ).onChange((u) => {
          e[c] = u, t == null || t({
            key: c,
            value: u,
            data: e
          });
        });
        continue;
      }
      if (d instanceof Array && d.length > 0) {
        const u = i.addFolder(c);
        d.forEach((g, p) => {
          if (g instanceof Object) {
            const h = u.addFolder(p + 1);
            this._addDebugForObject(g, h, t, s);
          }
        });
        continue;
      }
      if (d instanceof Object && !(d instanceof Function)) {
        const u = i.addFolder(c);
        this._addDebugForObject(d, u, t, s);
        continue;
      }
      const f = s[c];
      if (f instanceof Array) {
        (r = i.add(e, c, f)) == null || r.onChange((u) => {
          e[c] = u, t == null || t({
            key: c,
            value: u,
            data: e
          });
        });
        continue;
      }
      const k = s[c] || {};
      (o = i.add(e, c, k.min, k.max, k.step)) == null || o.onChange((u) => {
        e[c] = u, t == null || t({
          key: c,
          value: u,
          data: e
        });
      });
    }
  }
}
class mi {
  constructor(e = 0) {
    this._queueList = [], this._runing = !1, this._delayTime = 0, this._delayTime = e;
  }
  /**
   * 队列 增加执行事件
   */
  add(e = () => {
  }) {
    e && this._queueList.push(e), this._excute();
  }
  /**
   * 队列 移除执行事件
   */
  remove() {
    setTimeout(() => {
      this._runing = !1, this._queueList.splice(0, 1), this._excute();
    }, this._delayTime);
  }
  /**
   * 队列继续执行
   */
  _excute() {
    if (!this._runing && this._queueList.length > 0) {
      const e = this._queueList[0];
      e && (this._runing = !0, e());
    }
  }
  /**
   * 事件销毁
   */
  destory() {
    this._queueList = [];
  }
}
const Ve = new Oi(), we = new _(), He = new _(), ae = new Me(), Zt = {
  X: new _(1, 0, 0),
  Y: new _(0, 1, 0),
  Z: new _(0, 0, 1)
}, Tt = { type: "change" }, qt = { type: "mouseDown" }, Kt = { type: "mouseUp", mode: null }, $t = { type: "objectChange" };
class rs extends ut {
  constructor(e, i) {
    super(), i === void 0 && (console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.'), i = document), this.isTransformControls = !0, this.visible = !1, this.domElement = i, this.domElement.style.touchAction = "none";
    const t = new cs();
    this._gizmo = t, this.add(t);
    const s = new ds();
    this._plane = s, this.add(s);
    const n = this;
    function r(P, m) {
      let x = m;
      Object.defineProperty(n, P, {
        get: function() {
          return x !== void 0 ? x : m;
        },
        set: function(y) {
          x !== y && (x = y, s[P] = y, t[P] = y, n.dispatchEvent({ type: P + "-changed", value: y }), n.dispatchEvent(Tt));
        }
      }), n[P] = m, s[P] = m, t[P] = m;
    }
    r("camera", e), r("object", void 0), r("enabled", !0), r("axis", null), r("mode", "translate"), r("translationSnap", null), r("rotationSnap", null), r("scaleSnap", null), r("space", "world"), r("size", 1), r("dragging", !1), r("showX", !0), r("showY", !0), r("showZ", !0);
    const o = new _(), l = new _(), c = new Me(), d = new Me(), f = new _(), k = new Me(), u = new _(), g = new _(), p = new _(), h = 0, S = new _();
    r("worldPosition", o), r("worldPositionStart", l), r("worldQuaternion", c), r("worldQuaternionStart", d), r("cameraPosition", f), r("cameraQuaternion", k), r("pointStart", u), r("pointEnd", g), r("rotationAxis", p), r("rotationAngle", h), r("eye", S), this._offset = new _(), this._startNorm = new _(), this._endNorm = new _(), this._cameraScale = new _(), this._parentPosition = new _(), this._parentQuaternion = new Me(), this._parentQuaternionInv = new Me(), this._parentScale = new _(), this._worldScaleStart = new _(), this._worldQuaternionInv = new Me(), this._worldScale = new _(), this._positionStart = new _(), this._quaternionStart = new Me(), this._scaleStart = new _(), this._getPointer = ns.bind(this), this._onPointerDown = as.bind(this), this._onPointerHover = os.bind(this), this._onPointerMove = ls.bind(this), this._onPointerUp = hs.bind(this), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointermove", this._onPointerHover), this.domElement.addEventListener("pointerup", this._onPointerUp);
  }
  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld() {
    this.object !== void 0 && (this.object.updateMatrixWorld(), this.object.parent === null ? console.error("TransformControls: The attached 3D object must be a part of the scene graph.") : this.object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale), this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this._worldScale), this._parentQuaternionInv.copy(this._parentQuaternion).invert(), this._worldQuaternionInv.copy(this.worldQuaternion).invert()), this.camera.updateMatrixWorld(), this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this._cameraScale), this.camera.isOrthographicCamera ? this.camera.getWorldDirection(this.eye).negate() : this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize(), super.updateMatrixWorld(this);
  }
  pointerHover(e) {
    if (this.object === void 0 || this.dragging === !0)
      return;
    Ve.setFromCamera(e, this.camera);
    const i = Et(this._gizmo.picker[this.mode], Ve);
    i ? this.axis = i.object.name : this.axis = null;
  }
  pointerDown(e) {
    if (!(this.object === void 0 || this.dragging === !0 || e.button !== 0) && this.axis !== null) {
      Ve.setFromCamera(e, this.camera);
      const i = Et(this._plane, Ve, !0);
      i && (this.object.updateMatrixWorld(), this.object.parent.updateMatrixWorld(), this._positionStart.copy(this.object.position), this._quaternionStart.copy(this.object.quaternion), this._scaleStart.copy(this.object.scale), this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this._worldScaleStart), this.pointStart.copy(i.point).sub(this.worldPositionStart)), this.dragging = !0, qt.mode = this.mode, this.dispatchEvent(qt);
    }
  }
  pointerMove(e) {
    const i = this.axis, t = this.mode, s = this.object;
    let n = this.space;
    if (t === "scale" ? n = "local" : (i === "E" || i === "XYZE" || i === "XYZ") && (n = "world"), s === void 0 || i === null || this.dragging === !1 || e.button !== -1)
      return;
    Ve.setFromCamera(e, this.camera);
    const r = Et(this._plane, Ve, !0);
    if (r) {
      if (this.pointEnd.copy(r.point).sub(this.worldPositionStart), t === "translate")
        this._offset.copy(this.pointEnd).sub(this.pointStart), n === "local" && i !== "XYZ" && this._offset.applyQuaternion(this._worldQuaternionInv), i.indexOf("X") === -1 && (this._offset.x = 0), i.indexOf("Y") === -1 && (this._offset.y = 0), i.indexOf("Z") === -1 && (this._offset.z = 0), n === "local" && i !== "XYZ" ? this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale) : this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale), s.position.copy(this._offset).add(this._positionStart), this.translationSnap && (n === "local" && (s.position.applyQuaternion(ae.copy(this._quaternionStart).invert()), i.search("X") !== -1 && (s.position.x = Math.round(s.position.x / this.translationSnap) * this.translationSnap), i.search("Y") !== -1 && (s.position.y = Math.round(s.position.y / this.translationSnap) * this.translationSnap), i.search("Z") !== -1 && (s.position.z = Math.round(s.position.z / this.translationSnap) * this.translationSnap), s.position.applyQuaternion(this._quaternionStart)), n === "world" && (s.parent && s.position.add(we.setFromMatrixPosition(s.parent.matrixWorld)), i.search("X") !== -1 && (s.position.x = Math.round(s.position.x / this.translationSnap) * this.translationSnap), i.search("Y") !== -1 && (s.position.y = Math.round(s.position.y / this.translationSnap) * this.translationSnap), i.search("Z") !== -1 && (s.position.z = Math.round(s.position.z / this.translationSnap) * this.translationSnap), s.parent && s.position.sub(we.setFromMatrixPosition(s.parent.matrixWorld))));
      else if (t === "scale") {
        if (i.search("XYZ") !== -1) {
          let o = this.pointEnd.length() / this.pointStart.length();
          this.pointEnd.dot(this.pointStart) < 0 && (o *= -1), He.set(o, o, o);
        } else
          we.copy(this.pointStart), He.copy(this.pointEnd), we.applyQuaternion(this._worldQuaternionInv), He.applyQuaternion(this._worldQuaternionInv), He.divide(we), i.search("X") === -1 && (He.x = 1), i.search("Y") === -1 && (He.y = 1), i.search("Z") === -1 && (He.z = 1);
        s.scale.copy(this._scaleStart).multiply(He), this.scaleSnap && (i.search("X") !== -1 && (s.scale.x = Math.round(s.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap), i.search("Y") !== -1 && (s.scale.y = Math.round(s.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap), i.search("Z") !== -1 && (s.scale.z = Math.round(s.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap));
      } else if (t === "rotate") {
        this._offset.copy(this.pointEnd).sub(this.pointStart);
        const o = 20 / this.worldPosition.distanceTo(we.setFromMatrixPosition(this.camera.matrixWorld));
        i === "E" ? (this.rotationAxis.copy(this.eye), this.rotationAngle = this.pointEnd.angleTo(this.pointStart), this._startNorm.copy(this.pointStart).normalize(), this._endNorm.copy(this.pointEnd).normalize(), this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1) : i === "XYZE" ? (this.rotationAxis.copy(this._offset).cross(this.eye).normalize(), this.rotationAngle = this._offset.dot(we.copy(this.rotationAxis).cross(this.eye)) * o) : (i === "X" || i === "Y" || i === "Z") && (this.rotationAxis.copy(Zt[i]), we.copy(Zt[i]), n === "local" && we.applyQuaternion(this.worldQuaternion), this.rotationAngle = this._offset.dot(we.cross(this.eye).normalize()) * o), this.rotationSnap && (this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap), n === "local" && i !== "E" && i !== "XYZE" ? (s.quaternion.copy(this._quaternionStart), s.quaternion.multiply(ae.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize()) : (this.rotationAxis.applyQuaternion(this._parentQuaternionInv), s.quaternion.copy(ae.setFromAxisAngle(this.rotationAxis, this.rotationAngle)), s.quaternion.multiply(this._quaternionStart).normalize());
      }
      this.dispatchEvent(Tt), this.dispatchEvent($t);
    }
  }
  pointerUp(e) {
    e.button === 0 && (this.dragging && this.axis !== null && (Kt.mode = this.mode, this.dispatchEvent(Kt)), this.dragging = !1, this.axis = null);
  }
  dispose() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerHover), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.traverse(function(e) {
      e.geometry && e.geometry.dispose(), e.material && e.material.dispose();
    });
  }
  // Set current object
  attach(e) {
    return this.object = e, this.visible = !0, this;
  }
  // Detach from object
  detach() {
    return this.object = void 0, this.visible = !1, this.axis = null, this;
  }
  reset() {
    this.enabled && this.dragging && (this.object.position.copy(this._positionStart), this.object.quaternion.copy(this._quaternionStart), this.object.scale.copy(this._scaleStart), this.dispatchEvent(Tt), this.dispatchEvent($t), this.pointStart.copy(this.pointEnd));
  }
  getRaycaster() {
    return Ve;
  }
  // TODO: deprecate
  getMode() {
    return this.mode;
  }
  setMode(e) {
    this.mode = e;
  }
  setTranslationSnap(e) {
    this.translationSnap = e;
  }
  setRotationSnap(e) {
    this.rotationSnap = e;
  }
  setScaleSnap(e) {
    this.scaleSnap = e;
  }
  setSize(e) {
    this.size = e;
  }
  setSpace(e) {
    this.space = e;
  }
}
function ns(b) {
  if (this.domElement.ownerDocument.pointerLockElement)
    return {
      x: 0,
      y: 0,
      button: b.button
    };
  {
    const e = this.domElement.getBoundingClientRect();
    return {
      x: (b.clientX - e.left) / e.width * 2 - 1,
      y: -(b.clientY - e.top) / e.height * 2 + 1,
      button: b.button
    };
  }
}
function os(b) {
  if (this.enabled)
    switch (b.pointerType) {
      case "mouse":
      case "pen":
        this.pointerHover(this._getPointer(b));
        break;
    }
}
function as(b) {
  this.enabled && (document.pointerLockElement || this.domElement.setPointerCapture(b.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.pointerHover(this._getPointer(b)), this.pointerDown(this._getPointer(b)));
}
function ls(b) {
  this.enabled && this.pointerMove(this._getPointer(b));
}
function hs(b) {
  this.enabled && (this.domElement.releasePointerCapture(b.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.pointerUp(this._getPointer(b)));
}
function Et(b, e, i) {
  const t = e.intersectObject(b, !0);
  for (let s = 0; s < t.length; s++)
    if (t[s].object.visible || i)
      return t[s];
  return !1;
}
const gt = new Ri(), ie = new _(0, 1, 0), Jt = new _(0, 0, 0), ei = new Ee(), vt = new Me(), xt = new Me(), Re = new _(), ti = new Ee(), ht = new _(1, 0, 0), Ye = new _(0, 1, 0), ct = new _(0, 0, 1), bt = new _(), at = new _(), lt = new _();
class cs extends ut {
  constructor() {
    super(), this.isTransformControlsGizmo = !0, this.type = "TransformControlsGizmo";
    const e = new At({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), i = new Di({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), t = e.clone();
    t.opacity = 0.15;
    const s = i.clone();
    s.opacity = 0.5;
    const n = e.clone();
    n.color.setHex(16711680);
    const r = e.clone();
    r.color.setHex(65280);
    const o = e.clone();
    o.color.setHex(255);
    const l = e.clone();
    l.color.setHex(16711680), l.opacity = 0.5;
    const c = e.clone();
    c.color.setHex(65280), c.opacity = 0.5;
    const d = e.clone();
    d.color.setHex(255), d.opacity = 0.5;
    const f = e.clone();
    f.opacity = 0.25;
    const k = e.clone();
    k.color.setHex(16776960), k.opacity = 0.25, e.clone().color.setHex(16776960);
    const g = e.clone();
    g.color.setHex(7895160);
    const p = new xe(0, 0.04, 0.1, 12);
    p.translate(0, 0.05, 0);
    const h = new ye(0.08, 0.08, 0.08);
    h.translate(0, 0.04, 0);
    const S = new Pt();
    S.setAttribute("position", new wt([0, 0, 0, 1, 0, 0], 3));
    const P = new xe(75e-4, 75e-4, 0.5, 3);
    P.translate(0, 0.25, 0);
    function m($, ve) {
      const Q = new nt($, 75e-4, 3, 64, ve * Math.PI * 2);
      return Q.rotateY(Math.PI / 2), Q.rotateX(Math.PI / 2), Q;
    }
    function x() {
      const $ = new Pt();
      return $.setAttribute("position", new wt([0, 0, 0, 1, 1, 1], 3)), $;
    }
    const y = {
      X: [
        [new E(p, n), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(p, n), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
        [new E(P, n), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      Y: [
        [new E(p, r), [0, 0.5, 0]],
        [new E(p, r), [0, -0.5, 0], [Math.PI, 0, 0]],
        [new E(P, r)]
      ],
      Z: [
        [new E(p, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new E(p, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
        [new E(P, o), null, [Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new E(new mt(0.1, 0), f.clone()), [0, 0, 0]]
      ],
      XY: [
        [new E(new ye(0.15, 0.15, 0.01), d.clone()), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.15, 0.15, 0.01), l.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.15, 0.15, 0.01), c.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, A = {
      X: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0.3, 0]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new E(new mt(0.2, 0), t)]
      ],
      XY: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, Y = {
      START: [
        [new E(new mt(0.01, 2), s), null, null, null, "helper"]
      ],
      END: [
        [new E(new mt(0.01, 2), s), null, null, null, "helper"]
      ],
      DELTA: [
        [new je(x(), s), null, null, null, "helper"]
      ],
      X: [
        [new je(S, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new je(S, s.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new je(S, s.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    }, j = {
      XYZE: [
        [new E(m(0.5, 1), g), null, [0, Math.PI / 2, 0]]
      ],
      X: [
        [new E(m(0.5, 0.5), n)]
      ],
      Y: [
        [new E(m(0.5, 0.5), r), null, [0, 0, -Math.PI / 2]]
      ],
      Z: [
        [new E(m(0.5, 0.5), o), null, [0, Math.PI / 2, 0]]
      ],
      E: [
        [new E(m(0.75, 1), k), null, [0, Math.PI / 2, 0]]
      ]
    }, R = {
      AXIS: [
        [new je(S, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    }, W = {
      XYZE: [
        [new E(new Li(0.25, 10, 8), t)]
      ],
      X: [
        [new E(new nt(0.5, 0.1, 4, 24), t), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]
      ],
      Y: [
        [new E(new nt(0.5, 0.1, 4, 24), t), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],
      Z: [
        [new E(new nt(0.5, 0.1, 4, 24), t), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      E: [
        [new E(new nt(0.75, 0.1, 2, 24), t)]
      ]
    }, N = {
      X: [
        [new E(h, n), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(P, n), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(h, n), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new E(h, r), [0, 0.5, 0]],
        [new E(P, r)],
        [new E(h, r), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new E(h, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new E(P, o), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new E(h, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new E(new ye(0.15, 0.15, 0.01), d), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.15, 0.15, 0.01), l), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.15, 0.15, 0.01), c), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new E(new ye(0.1, 0.1, 0.1), f.clone())]
      ]
    }, oe = {
      X: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0.3, 0]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, -0.3, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
        [new E(new xe(0.2, 0, 0.6, 4), t), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.2, 0.2, 0.01), t), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new E(new ye(0.2, 0.2, 0.2), t), [0, 0, 0]]
      ]
    }, ge = {
      X: [
        [new je(S, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new je(S, s.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new je(S, s.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    function se($) {
      const ve = new ut();
      for (const Q in $)
        for (let X = $[Q].length; X--; ) {
          const re = $[Q][X][0].clone(), ne = $[Q][X][1], Pe = $[Q][X][2], Oe = $[Q][X][3], We = $[Q][X][4];
          re.name = Q, re.tag = We, ne && re.position.set(ne[0], ne[1], ne[2]), Pe && re.rotation.set(Pe[0], Pe[1], Pe[2]), Oe && re.scale.set(Oe[0], Oe[1], Oe[2]), re.updateMatrix();
          const Le = re.geometry.clone();
          Le.applyMatrix4(re.matrix), re.geometry = Le, re.renderOrder = 1 / 0, re.position.set(0, 0, 0), re.rotation.set(0, 0, 0), re.scale.set(1, 1, 1), ve.add(re);
        }
      return ve;
    }
    this.gizmo = {}, this.picker = {}, this.helper = {}, this.add(this.gizmo.translate = se(y)), this.add(this.gizmo.rotate = se(j)), this.add(this.gizmo.scale = se(N)), this.add(this.picker.translate = se(A)), this.add(this.picker.rotate = se(W)), this.add(this.picker.scale = se(oe)), this.add(this.helper.translate = se(Y)), this.add(this.helper.rotate = se(R)), this.add(this.helper.scale = se(ge)), this.picker.translate.visible = !1, this.picker.rotate.visible = !1, this.picker.scale.visible = !1;
  }
  // updateMatrixWorld will update transformations and appearance of individual handles
  updateMatrixWorld(e) {
    const t = (this.mode === "scale" ? "local" : this.space) === "local" ? this.worldQuaternion : xt;
    this.gizmo.translate.visible = this.mode === "translate", this.gizmo.rotate.visible = this.mode === "rotate", this.gizmo.scale.visible = this.mode === "scale", this.helper.translate.visible = this.mode === "translate", this.helper.rotate.visible = this.mode === "rotate", this.helper.scale.visible = this.mode === "scale";
    let s = [];
    s = s.concat(this.picker[this.mode].children), s = s.concat(this.gizmo[this.mode].children), s = s.concat(this.helper[this.mode].children);
    for (let n = 0; n < s.length; n++) {
      const r = s[n];
      r.visible = !0, r.rotation.set(0, 0, 0), r.position.copy(this.worldPosition);
      let o;
      if (this.camera.isOrthographicCamera ? o = (this.camera.top - this.camera.bottom) / this.camera.zoom : o = this.worldPosition.distanceTo(this.cameraPosition) * Math.min(1.9 * Math.tan(Math.PI * this.camera.fov / 360) / this.camera.zoom, 7), r.scale.set(1, 1, 1).multiplyScalar(o * this.size / 4), r.tag === "helper") {
        r.visible = !1, r.name === "AXIS" ? (r.visible = !!this.axis, this.axis === "X" && (ae.setFromEuler(gt.set(0, 0, 0)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "Y" && (ae.setFromEuler(gt.set(0, 0, Math.PI / 2)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(Ye).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "Z" && (ae.setFromEuler(gt.set(0, Math.PI / 2, 0)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "XYZE" && (ae.setFromEuler(gt.set(0, Math.PI / 2, 0)), ie.copy(this.rotationAxis), r.quaternion.setFromRotationMatrix(ei.lookAt(Jt, ie, Ye)), r.quaternion.multiply(ae), r.visible = this.dragging), this.axis === "E" && (r.visible = !1)) : r.name === "START" ? (r.position.copy(this.worldPositionStart), r.visible = this.dragging) : r.name === "END" ? (r.position.copy(this.worldPosition), r.visible = this.dragging) : r.name === "DELTA" ? (r.position.copy(this.worldPositionStart), r.quaternion.copy(this.worldQuaternionStart), we.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1), we.applyQuaternion(this.worldQuaternionStart.clone().invert()), r.scale.copy(we), r.visible = this.dragging) : (r.quaternion.copy(t), this.dragging ? r.position.copy(this.worldPositionStart) : r.position.copy(this.worldPosition), this.axis && (r.visible = this.axis.search(r.name) !== -1));
        continue;
      }
      r.quaternion.copy(t), this.mode === "translate" || this.mode === "scale" ? (r.name === "X" && Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "Y" && Math.abs(ie.copy(Ye).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "Z" && Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "XY" && Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "YZ" && Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "XZ" && Math.abs(ie.copy(Ye).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1)) : this.mode === "rotate" && (vt.copy(t), ie.copy(this.eye).applyQuaternion(ae.copy(t).invert()), r.name.search("E") !== -1 && r.quaternion.setFromRotationMatrix(ei.lookAt(this.eye, Jt, Ye)), r.name === "X" && (ae.setFromAxisAngle(ht, Math.atan2(-ie.y, ie.z)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae)), r.name === "Y" && (ae.setFromAxisAngle(Ye, Math.atan2(ie.x, ie.z)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae)), r.name === "Z" && (ae.setFromAxisAngle(ct, Math.atan2(ie.y, ie.x)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae))), r.visible = r.visible && (r.name.indexOf("X") === -1 || this.showX), r.visible = r.visible && (r.name.indexOf("Y") === -1 || this.showY), r.visible = r.visible && (r.name.indexOf("Z") === -1 || this.showZ), r.visible = r.visible && (r.name.indexOf("E") === -1 || this.showX && this.showY && this.showZ), r.material._color = r.material._color || r.material.color.clone(), r.material._opacity = r.material._opacity || r.material.opacity, r.material.color.copy(r.material._color), r.material.opacity = r.material._opacity, this.enabled && this.axis && (r.name === this.axis || this.axis.split("").some(function(l) {
        return r.name === l;
      })) && (r.material.color.setHex(16776960), r.material.opacity = 1);
    }
    super.updateMatrixWorld(e);
  }
}
class ds extends E {
  constructor() {
    super(
      new Ai(1e5, 1e5, 2, 2),
      new At({ visible: !1, wireframe: !0, side: St, transparent: !0, opacity: 0.1, toneMapped: !1 })
    ), this.isTransformControlsPlane = !0, this.type = "TransformControlsPlane";
  }
  updateMatrixWorld(e) {
    let i = this.space;
    switch (this.position.copy(this.worldPosition), this.mode === "scale" && (i = "local"), bt.copy(ht).applyQuaternion(i === "local" ? this.worldQuaternion : xt), at.copy(Ye).applyQuaternion(i === "local" ? this.worldQuaternion : xt), lt.copy(ct).applyQuaternion(i === "local" ? this.worldQuaternion : xt), ie.copy(at), this.mode) {
      case "translate":
      case "scale":
        switch (this.axis) {
          case "X":
            ie.copy(this.eye).cross(bt), Re.copy(bt).cross(ie);
            break;
          case "Y":
            ie.copy(this.eye).cross(at), Re.copy(at).cross(ie);
            break;
          case "Z":
            ie.copy(this.eye).cross(lt), Re.copy(lt).cross(ie);
            break;
          case "XY":
            Re.copy(lt);
            break;
          case "YZ":
            Re.copy(bt);
            break;
          case "XZ":
            ie.copy(lt), Re.copy(at);
            break;
          case "XYZ":
          case "E":
            Re.set(0, 0, 0);
            break;
        }
        break;
      case "rotate":
      default:
        Re.set(0, 0, 0);
    }
    Re.length() === 0 ? this.quaternion.copy(this.cameraQuaternion) : (ti.lookAt(we.set(0, 0, 0), Re, ie), this.quaternion.setFromRotationMatrix(ti)), super.updateMatrixWorld(e);
  }
}
class us {
  /**
   * 构造函数
   * @param ssThreeObject 绑定的物体
   * @param callBack 回调事件
   */
  constructor(e, i) {
    this.onControlChange = null, this._ssThreeObject = null, this._control = null, this._event = null, this._boxHeloper = null, this.focus = (t) => {
      const s = this._ssThreeObject.threeCamera;
      let n;
      const r = new L.Box3(), o = new L.Vector3(), l = new L.Sphere(), c = new L.Vector3();
      r.setFromObject(t), r.isEmpty() === !1 ? (r.getCenter(o), n = r.getBoundingSphere(l).radius) : (o.setFromMatrixPosition(t.matrixWorld), n = 0.1), c.set(0, 0, 1), c.applyQuaternion(s.quaternion), c.multiplyScalar(n * 2), s.position.copy(o).add(c), this._ssThreeObject.threeOrbitControl.target.copy(o), this._ssThreeObject.threeOrbitControl.update();
    }, this._ssThreeObject = e, this.onControlChange = i;
  }
  destory() {
    var e, i, t;
    (e = this._event) == null || e.destory(), this._event = null, this._ssThreeObject = null, (i = this._control) == null || i.removeFromParent(), (t = this._control) == null || t.dispose(), this.onControlChange = null, this._control = null;
  }
  /**
   * 追踪某个物体
   * @param object3d 目标物体
   */
  attach(e) {
    this._control || (this._control = new rs(
      this._ssThreeObject.threeCamera,
      this._ssThreeObject.threeContainer
    ), (this._ssThreeObject.sceneHelper || this._ssThreeObject.threeScene).add(this._control), this._control.addEventListener("change", (i) => {
      var t, s;
      this._ssThreeObject.threeOrbitControl.enableRotate = !this._control.dragging, this._control.object && ((t = this._boxHeloper) == null || t.setFromObject(this._control.object), (s = this.onControlChange) == null || s.call(this, {
        name: this._control.object.name,
        uuid: this._control.object.uuid,
        target: this._control.object,
        type: "change",
        position: new L.Vector3(
          this._control.object.position.x,
          this._control.object.position.y,
          this._control.object.position.z
        ),
        rotation: new L.Vector3(
          L.MathUtils.radToDeg(this._control.object.rotation.x),
          L.MathUtils.radToDeg(this._control.object.rotation.y),
          L.MathUtils.radToDeg(this._control.object.rotation.z)
        ),
        scale: this._control.object.scale
      }));
    }), this._control.addEventListener("objectChange", (i) => {
    }), this._event = new Ot(this._ssThreeObject.threeContainer), this._event.addEventListener(Ot.SSEventType.KEYDOWN, (i) => {
      var t, s;
      if (this._control.object)
        switch (i.key) {
          case "q":
            this._control.setSpace(this._control.space === "world" ? "local" : "world");
            break;
          case "e":
            this._control.setMode("rotate");
            break;
          case "w":
            this._control.setMode("translate");
            break;
          case "r":
            this._control.setMode("scale");
            break;
          case "x":
            this._control.showX = !this._control.showX;
            break;
          case "y":
            this._control.showY = !this._control.showY;
            break;
          case "z":
            this._control.showZ = !this._control.showZ;
            break;
          case "Escape":
            this.detach();
            break;
          case "_":
          case "-":
            this._control.setSize(this._control.size * 0.9);
            break;
          case "f":
            if (!this._control.object)
              return;
            this.focus(this._control.object), (t = this.onControlChange) == null || t.call(this, {
              name: this._control.object.name,
              uuid: this._control.object.uuid,
              target: this._control.object,
              type: "focus"
            });
            break;
          case "=":
          case "+":
            this._control.setSize(this._control.size * 1.1);
            break;
          case "Backspace":
            if (!this._control.object)
              return;
            this._boxHeloper.removeFromParent(), this._boxHeloper = null;
            const { name: n, uuid: r, id: o } = this._control.object;
            this._control.detach(), (s = this.onControlChange) == null || s.call(this, {
              name: n,
              uuid: r,
              targetId: o,
              type: "delete"
            });
            break;
        }
    })), this._control.attach(e), this._boxHeloper || (this._boxHeloper = new L.BoxHelper(e), this._boxHeloper.name = "boxhelper", (this._ssThreeObject.sceneHelper || this._ssThreeObject.threeScene).add(this._boxHeloper)), this._boxHeloper.setFromObject(e);
  }
  /**
   * 取消追踪
   */
  detach() {
    var e;
    this._control.detach(), (e = this._boxHeloper) == null || e.removeFromParent(), this._boxHeloper = null;
  }
  /**
   * 是否可用
   */
  set enabled(e) {
    this._control && (e || this.detach(), this._control.enabled = e);
  }
}
const Bt = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`
  )
};
class st {
  constructor() {
    this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
  }
  setSize() {
  }
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  dispose() {
  }
}
const fs = new Bi(-1, 1, 1, -1, 0, 1), It = new Pt();
It.setAttribute("position", new wt([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
It.setAttribute("uv", new wt([0, 2, 0, 0, 2, 0], 2));
class zt {
  constructor(e) {
    this._mesh = new E(It, e);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(e) {
    e.render(this._mesh, fs);
  }
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
}
class Dt extends st {
  constructor(e, i) {
    super(), this.textureID = i !== void 0 ? i : "tDiffuse", e instanceof Te ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = dt.clone(e.uniforms), this.material = new Te({
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this.fsQuad = new zt(this.material);
  }
  render(e, i, t) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = t.texture), this.fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (e.setRenderTarget(i), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this.fsQuad.dispose();
  }
}
class ii extends st {
  constructor(e, i) {
    super(), this.scene = e, this.camera = i, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
  }
  render(e, i, t) {
    const s = e.getContext(), n = e.state;
    n.buffers.color.setMask(!1), n.buffers.depth.setMask(!1), n.buffers.color.setLocked(!0), n.buffers.depth.setLocked(!0);
    let r, o;
    this.inverse ? (r = 0, o = 1) : (r = 1, o = 0), n.buffers.stencil.setTest(!0), n.buffers.stencil.setOp(s.REPLACE, s.REPLACE, s.REPLACE), n.buffers.stencil.setFunc(s.ALWAYS, r, 4294967295), n.buffers.stencil.setClear(o), n.buffers.stencil.setLocked(!0), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(i), this.clear && e.clear(), e.render(this.scene, this.camera), n.buffers.color.setLocked(!1), n.buffers.depth.setLocked(!1), n.buffers.stencil.setLocked(!1), n.buffers.stencil.setFunc(s.EQUAL, 1, 4294967295), n.buffers.stencil.setOp(s.KEEP, s.KEEP, s.KEEP), n.buffers.stencil.setLocked(!0);
  }
}
class ps extends st {
  constructor() {
    super(), this.needsSwap = !1;
  }
  render(e) {
    e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
  }
}
class si {
  constructor(e, i) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), i === void 0) {
      const t = e.getSize(new Z());
      this._width = t.width, this._height = t.height, i = new Ce(this._width * this._pixelRatio, this._height * this._pixelRatio), i.texture.name = "EffectComposer.rt1";
    } else
      this._width = i.width, this._height = i.height;
    this.renderTarget1 = i, this.renderTarget2 = i.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new Dt(Bt), this.clock = new Ii();
  }
  swapBuffers() {
    const e = this.readBuffer;
    this.readBuffer = this.writeBuffer, this.writeBuffer = e;
  }
  addPass(e) {
    this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(e, i) {
    this.passes.splice(i, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(e) {
    const i = this.passes.indexOf(e);
    i !== -1 && this.passes.splice(i, 1);
  }
  isLastEnabledPass(e) {
    for (let i = e + 1; i < this.passes.length; i++)
      if (this.passes[i].enabled)
        return !1;
    return !0;
  }
  render(e) {
    e === void 0 && (e = this.clock.getDelta());
    const i = this.renderer.getRenderTarget();
    let t = !1;
    for (let s = 0, n = this.passes.length; s < n; s++) {
      const r = this.passes[s];
      if (r.enabled !== !1) {
        if (r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(s), r.render(this.renderer, this.writeBuffer, this.readBuffer, e, t), r.needsSwap) {
          if (t) {
            const o = this.renderer.getContext(), l = this.renderer.state.buffers.stencil;
            l.setFunc(o.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), l.setFunc(o.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        ii !== void 0 && (r instanceof ii ? t = !0 : r instanceof ps && (t = !1));
      }
    }
    this.renderer.setRenderTarget(i);
  }
  reset(e) {
    if (e === void 0) {
      const i = this.renderer.getSize(new Z());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = i.width, this._height = i.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
  }
  setSize(e, i) {
    this._width = e, this._height = i;
    const t = this._width * this._pixelRatio, s = this._height * this._pixelRatio;
    this.renderTarget1.setSize(t, s), this.renderTarget2.setSize(t, s);
    for (let n = 0; n < this.passes.length; n++)
      this.passes[n].setSize(t, s);
  }
  setPixelRatio(e) {
    this._pixelRatio = e, this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
  }
}
class ms extends st {
  constructor(e, i, t, s, n) {
    super(), this.scene = e, this.camera = i, this.overrideMaterial = t, this.clearColor = s, this.clearAlpha = n !== void 0 ? n : 0, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this._oldClearColor = new me();
  }
  render(e, i, t) {
    const s = e.autoClear;
    e.autoClear = !1;
    let n, r;
    this.overrideMaterial !== void 0 && (r = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor && (e.getClearColor(this._oldClearColor), n = e.getClearAlpha(), e.setClearColor(this.clearColor, this.clearAlpha)), this.clearDepth && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor && e.setClearColor(this._oldClearColor, n), this.overrideMaterial !== void 0 && (this.scene.overrideMaterial = r), e.autoClear = s;
  }
}
const gs = {
  shaderID: "luminosityHighPass",
  uniforms: {
    tDiffuse: { value: null },
    luminosityThreshold: { value: 1 },
    smoothWidth: { value: 1 },
    defaultColor: { value: new me(0) },
    defaultOpacity: { value: 0 }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
  )
};
class it extends st {
  constructor(e, i, t, s) {
    super(), this.strength = i !== void 0 ? i : 1, this.radius = t, this.threshold = s, this.resolution = e !== void 0 ? new Z(e.x, e.y) : new Z(256, 256), this.clearColor = new me(0, 0, 0), this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let n = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new Ce(n, r), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let f = 0; f < this.nMips; f++) {
      const k = new Ce(n, r);
      k.texture.name = "UnrealBloomPass.h" + f, k.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(k);
      const u = new Ce(n, r);
      u.texture.name = "UnrealBloomPass.v" + f, u.texture.generateMipmaps = !1, this.renderTargetsVertical.push(u), n = Math.round(n / 2), r = Math.round(r / 2);
    }
    const o = gs;
    this.highPassUniforms = dt.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = s, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new Te({
      uniforms: this.highPassUniforms,
      vertexShader: o.vertexShader,
      fragmentShader: o.fragmentShader,
      defines: {}
    }), this.separableBlurMaterials = [];
    const l = [3, 5, 7, 9, 11];
    n = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    for (let f = 0; f < this.nMips; f++)
      this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[f])), this.separableBlurMaterials[f].uniforms.texSize.value = new Z(n, r), n = Math.round(n / 2), r = Math.round(r / 2);
    this.compositeMaterial = this.getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = i, this.compositeMaterial.uniforms.bloomRadius.value = 0.1, this.compositeMaterial.needsUpdate = !0;
    const c = [1, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms.bloomFactors.value = c, this.bloomTintColors = [new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
    const d = Bt;
    this.copyUniforms = dt.clone(d.uniforms), this.copyUniforms.opacity.value = 1, this.materialCopy = new Te({
      uniforms: this.copyUniforms,
      vertexShader: d.vertexShader,
      fragmentShader: d.fragmentShader,
      blending: di,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new me(), this.oldClearAlpha = 1, this.basic = new At(), this.fsQuad = new zt(null);
  }
  dispose() {
    for (let e = 0; e < this.renderTargetsHorizontal.length; e++)
      this.renderTargetsHorizontal[e].dispose();
    for (let e = 0; e < this.renderTargetsVertical.length; e++)
      this.renderTargetsVertical[e].dispose();
    this.renderTargetBright.dispose();
    for (let e = 0; e < this.separableBlurMaterials.length; e++)
      this.separableBlurMaterials[e].dispose();
    this.compositeMaterial.dispose(), this.materialCopy.dispose(), this.basic.dispose(), this.fsQuad.dispose();
  }
  setSize(e, i) {
    let t = Math.round(e / 2), s = Math.round(i / 2);
    this.renderTargetBright.setSize(t, s);
    for (let n = 0; n < this.nMips; n++)
      this.renderTargetsHorizontal[n].setSize(t, s), this.renderTargetsVertical[n].setSize(t, s), this.separableBlurMaterials[n].uniforms.texSize.value = new Z(t, s), t = Math.round(t / 2), s = Math.round(s / 2);
  }
  render(e, i, t, s, n) {
    e.getClearColor(this._oldClearColor), this.oldClearAlpha = e.getClearAlpha();
    const r = e.autoClear;
    e.autoClear = !1, e.setClearColor(this.clearColor, 0), n && e.state.buffers.stencil.setTest(!1), this.renderToScreen && (this.fsQuad.material = this.basic, this.basic.map = t.texture, e.setRenderTarget(null), e.clear(), this.fsQuad.render(e)), this.highPassUniforms.tDiffuse.value = t.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this.fsQuad.material = this.materialHighPassFilter, e.setRenderTarget(this.renderTargetBright), e.clear(), this.fsQuad.render(e);
    let o = this.renderTargetBright;
    for (let l = 0; l < this.nMips; l++)
      this.fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = it.BlurDirectionX, e.setRenderTarget(this.renderTargetsHorizontal[l]), e.clear(), this.fsQuad.render(e), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = it.BlurDirectionY, e.setRenderTarget(this.renderTargetsVertical[l]), e.clear(), this.fsQuad.render(e), o = this.renderTargetsVertical[l];
    this.fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, e.setRenderTarget(this.renderTargetsHorizontal[0]), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, n && e.state.buffers.stencil.setTest(!0), this.renderToScreen ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (e.setRenderTarget(t), this.fsQuad.render(e)), e.setClearColor(this._oldClearColor, this.oldClearAlpha), e.autoClear = r;
  }
  getSeperableBlurMaterial(e) {
    return new Te({
      defines: {
        KERNEL_RADIUS: e,
        SIGMA: e
      },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new Z(0.5, 0.5) },
        direction: { value: new Z(0.5, 0.5) }
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}
				void main() {
					vec2 invSize = 1.0 / texSize;
					float fSigma = float(SIGMA);
					float weightSum = gaussianPdf(0.0, fSigma);
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianPdf(x, fSigma);
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
    });
  }
  getCompositeMaterial(e) {
    return new Te({
      defines: {
        NUM_MIPS: e
      },
      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        bloomStrength: { value: 1 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0 }
      },
      vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
    });
  }
}
it.BlurDirectionX = new Z(1, 0);
it.BlurDirectionY = new Z(0, 1);
class Ge extends st {
  constructor(e, i, t, s) {
    super(), this.renderScene = i, this.renderCamera = t, this.selectedObjects = s !== void 0 ? s : [], this.visibleEdgeColor = new me(1, 1, 1), this.hiddenEdgeColor = new me(0.1, 0.04, 0.02), this.edgeGlow = 0, this.usePatternTexture = !1, this.edgeThickness = 1, this.edgeStrength = 3, this.downSampleRatio = 2, this.pulsePeriod = 0, this._visibilityCache = /* @__PURE__ */ new Map(), this.resolution = e !== void 0 ? new Z(e.x, e.y) : new Z(256, 256);
    const n = Math.round(this.resolution.x / this.downSampleRatio), r = Math.round(this.resolution.y / this.downSampleRatio);
    this.renderTargetMaskBuffer = new Ce(this.resolution.x, this.resolution.y), this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask", this.renderTargetMaskBuffer.texture.generateMipmaps = !1, this.depthMaterial = new zi(), this.depthMaterial.side = St, this.depthMaterial.depthPacking = ki, this.depthMaterial.blending = Nt, this.prepareMaskMaterial = this.getPrepareMaskMaterial(), this.prepareMaskMaterial.side = St, this.prepareMaskMaterial.fragmentShader = d(this.prepareMaskMaterial.fragmentShader, this.renderCamera), this.renderTargetDepthBuffer = new Ce(this.resolution.x, this.resolution.y), this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth", this.renderTargetDepthBuffer.texture.generateMipmaps = !1, this.renderTargetMaskDownSampleBuffer = new Ce(n, r), this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample", this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = !1, this.renderTargetBlurBuffer1 = new Ce(n, r), this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1", this.renderTargetBlurBuffer1.texture.generateMipmaps = !1, this.renderTargetBlurBuffer2 = new Ce(Math.round(n / 2), Math.round(r / 2)), this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2", this.renderTargetBlurBuffer2.texture.generateMipmaps = !1, this.edgeDetectionMaterial = this.getEdgeDetectionMaterial(), this.renderTargetEdgeBuffer1 = new Ce(n, r), this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1", this.renderTargetEdgeBuffer1.texture.generateMipmaps = !1, this.renderTargetEdgeBuffer2 = new Ce(Math.round(n / 2), Math.round(r / 2)), this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2", this.renderTargetEdgeBuffer2.texture.generateMipmaps = !1;
    const o = 4, l = 4;
    this.separableBlurMaterial1 = this.getSeperableBlurMaterial(o), this.separableBlurMaterial1.uniforms.texSize.value.set(n, r), this.separableBlurMaterial1.uniforms.kernelRadius.value = 1, this.separableBlurMaterial2 = this.getSeperableBlurMaterial(l), this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(n / 2), Math.round(r / 2)), this.separableBlurMaterial2.uniforms.kernelRadius.value = l, this.overlayMaterial = this.getOverlayMaterial();
    const c = Bt;
    this.copyUniforms = dt.clone(c.uniforms), this.copyUniforms.opacity.value = 1, this.materialCopy = new Te({
      uniforms: this.copyUniforms,
      vertexShader: c.vertexShader,
      fragmentShader: c.fragmentShader,
      blending: Nt,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new me(), this.oldClearAlpha = 1, this.fsQuad = new zt(null), this.tempPulseColor1 = new me(), this.tempPulseColor2 = new me(), this.textureMatrix = new Ee();
    function d(f, k) {
      const u = k.isPerspectiveCamera ? "perspective" : "orthographic";
      return f.replace(/DEPTH_TO_VIEW_Z/g, u + "DepthToViewZ");
    }
  }
  dispose() {
    this.renderTargetMaskBuffer.dispose(), this.renderTargetDepthBuffer.dispose(), this.renderTargetMaskDownSampleBuffer.dispose(), this.renderTargetBlurBuffer1.dispose(), this.renderTargetBlurBuffer2.dispose(), this.renderTargetEdgeBuffer1.dispose(), this.renderTargetEdgeBuffer2.dispose(), this.depthMaterial.dispose(), this.prepareMaskMaterial.dispose(), this.edgeDetectionMaterial.dispose(), this.separableBlurMaterial1.dispose(), this.separableBlurMaterial2.dispose(), this.overlayMaterial.dispose(), this.materialCopy.dispose(), this.fsQuad.dispose();
  }
  setSize(e, i) {
    this.renderTargetMaskBuffer.setSize(e, i), this.renderTargetDepthBuffer.setSize(e, i);
    let t = Math.round(e / this.downSampleRatio), s = Math.round(i / this.downSampleRatio);
    this.renderTargetMaskDownSampleBuffer.setSize(t, s), this.renderTargetBlurBuffer1.setSize(t, s), this.renderTargetEdgeBuffer1.setSize(t, s), this.separableBlurMaterial1.uniforms.texSize.value.set(t, s), t = Math.round(t / 2), s = Math.round(s / 2), this.renderTargetBlurBuffer2.setSize(t, s), this.renderTargetEdgeBuffer2.setSize(t, s), this.separableBlurMaterial2.uniforms.texSize.value.set(t, s);
  }
  changeVisibilityOfSelectedObjects(e) {
    const i = this._visibilityCache;
    function t(s) {
      s.isMesh && (e === !0 ? s.visible = i.get(s) : (i.set(s, s.visible), s.visible = e));
    }
    for (let s = 0; s < this.selectedObjects.length; s++)
      this.selectedObjects[s].traverse(t);
  }
  changeVisibilityOfNonSelectedObjects(e) {
    const i = this._visibilityCache, t = [];
    function s(r) {
      r.isMesh && t.push(r);
    }
    for (let r = 0; r < this.selectedObjects.length; r++)
      this.selectedObjects[r].traverse(s);
    function n(r) {
      if (r.isMesh || r.isSprite) {
        let o = !1;
        for (let l = 0; l < t.length; l++)
          if (t[l].id === r.id) {
            o = !0;
            break;
          }
        if (o === !1) {
          const l = r.visible;
          (e === !1 || i.get(r) === !0) && (r.visible = e), i.set(r, l);
        }
      } else
        (r.isPoints || r.isLine) && (e === !0 ? r.visible = i.get(r) : (i.set(r, r.visible), r.visible = e));
    }
    this.renderScene.traverse(n);
  }
  updateTextureMatrix() {
    this.textureMatrix.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), this.textureMatrix.multiply(this.renderCamera.projectionMatrix), this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
  }
  render(e, i, t, s, n) {
    if (this.selectedObjects.length > 0) {
      e.getClearColor(this._oldClearColor), this.oldClearAlpha = e.getClearAlpha();
      const r = e.autoClear;
      e.autoClear = !1, n && e.state.buffers.stencil.setTest(!1), e.setClearColor(16777215, 1), this.changeVisibilityOfSelectedObjects(!1);
      const o = this.renderScene.background;
      if (this.renderScene.background = null, this.renderScene.overrideMaterial = this.depthMaterial, e.setRenderTarget(this.renderTargetDepthBuffer), e.clear(), e.render(this.renderScene, this.renderCamera), this.changeVisibilityOfSelectedObjects(!0), this._visibilityCache.clear(), this.updateTextureMatrix(), this.changeVisibilityOfNonSelectedObjects(!1), this.renderScene.overrideMaterial = this.prepareMaskMaterial, this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near, this.renderCamera.far), this.prepareMaskMaterial.uniforms.depthTexture.value = this.renderTargetDepthBuffer.texture, this.prepareMaskMaterial.uniforms.textureMatrix.value = this.textureMatrix, e.setRenderTarget(this.renderTargetMaskBuffer), e.clear(), e.render(this.renderScene, this.renderCamera), this.renderScene.overrideMaterial = null, this.changeVisibilityOfNonSelectedObjects(!0), this._visibilityCache.clear(), this.renderScene.background = o, this.fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetMaskBuffer.texture, e.setRenderTarget(this.renderTargetMaskDownSampleBuffer), e.clear(), this.fsQuad.render(e), this.tempPulseColor1.copy(this.visibleEdgeColor), this.tempPulseColor2.copy(this.hiddenEdgeColor), this.pulsePeriod > 0) {
        const l = 0.625 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * 0.75 / 2;
        this.tempPulseColor1.multiplyScalar(l), this.tempPulseColor2.multiplyScalar(l);
      }
      this.fsQuad.material = this.edgeDetectionMaterial, this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture, this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height), this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1, this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2, e.setRenderTarget(this.renderTargetEdgeBuffer1), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.separableBlurMaterial1, this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = Ge.BlurDirectionX, this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness, e.setRenderTarget(this.renderTargetBlurBuffer1), e.clear(), this.fsQuad.render(e), this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = Ge.BlurDirectionY, e.setRenderTarget(this.renderTargetEdgeBuffer1), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.separableBlurMaterial2, this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial2.uniforms.direction.value = Ge.BlurDirectionX, e.setRenderTarget(this.renderTargetBlurBuffer2), e.clear(), this.fsQuad.render(e), this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture, this.separableBlurMaterial2.uniforms.direction.value = Ge.BlurDirectionY, e.setRenderTarget(this.renderTargetEdgeBuffer2), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.overlayMaterial, this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture, this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture, this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture, this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture, this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength, this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow, this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture, n && e.state.buffers.stencil.setTest(!0), e.setRenderTarget(t), this.fsQuad.render(e), e.setClearColor(this._oldClearColor, this.oldClearAlpha), e.autoClear = r;
    }
    this.renderToScreen && (this.fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = t.texture, e.setRenderTarget(null), this.fsQuad.render(e));
  }
  getPrepareMaskMaterial() {
    return new Te({
      uniforms: {
        depthTexture: { value: null },
        cameraNearFar: { value: new Z(0.5, 0.5) },
        textureMatrix: { value: null }
      },
      vertexShader: `#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>

				varying vec4 projTexCoord;
				varying vec4 vPosition;
				uniform mat4 textureMatrix;

				void main() {

					#include <skinbase_vertex>
					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>

					vPosition = mvPosition;

					vec4 worldPosition = vec4( transformed, 1.0 );

					#ifdef USE_INSTANCING

						worldPosition = instanceMatrix * worldPosition;

					#endif
					
					worldPosition = modelMatrix * worldPosition;

					projTexCoord = textureMatrix * worldPosition;

				}`,
      fragmentShader: `#include <packing>
				varying vec4 vPosition;
				varying vec4 projTexCoord;
				uniform sampler2D depthTexture;
				uniform vec2 cameraNearFar;

				void main() {

					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

				}`
    });
  }
  getEdgeDetectionMaterial() {
    return new Te({
      uniforms: {
        maskTexture: { value: null },
        texSize: { value: new Z(0.5, 0.5) },
        visibleEdgeColor: { value: new _(1, 1, 1) },
        hiddenEdgeColor: { value: new _(1, 1, 1) }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`
    });
  }
  getSeperableBlurMaterial(e) {
    return new Te({
      defines: {
        MAX_RADIUS: e
      },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new Z(0.5, 0.5) },
        direction: { value: new Z(0.5, 0.5) },
        kernelRadius: { value: 1 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float sigma = kernelRadius/2.0;
					float weightSum = gaussianPdf(0.0, sigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float x = kernelRadius * float(i) / float(MAX_RADIUS);
						float w = gaussianPdf(x, sigma);
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = diffuseSum/weightSum;
				}`
    });
  }
  getOverlayMaterial() {
    return new Te({
      uniforms: {
        maskTexture: { value: null },
        edgeTexture1: { value: null },
        edgeTexture2: { value: null },
        patternTexture: { value: null },
        edgeStrength: { value: 1 },
        edgeGlow: { value: 1 },
        usePatternTexture: { value: 0 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,
      blending: di,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    });
  }
}
Ge.BlurDirectionX = new Z(1, 0);
Ge.BlurDirectionY = new Z(0, 1);
const vs = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Z(1 / 1024, 1 / 512) }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: `
	precision highp float;

	uniform sampler2D tDiffuse;

	uniform vec2 resolution;

	varying vec2 vUv;

	// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

	//----------------------------------------------------------------------------------
	// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
	// SDK Version: v3.00
	// Email:       gameworks@nvidia.com
	// Site:        http://developer.nvidia.com/
	//
	// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
	//
	// Redistribution and use in source and binary forms, with or without
	// modification, are permitted provided that the following conditions
	// are met:
	//  * Redistributions of source code must retain the above copyright
	//    notice, this list of conditions and the following disclaimer.
	//  * Redistributions in binary form must reproduce the above copyright
	//    notice, this list of conditions and the following disclaimer in the
	//    documentation and/or other materials provided with the distribution.
	//  * Neither the name of NVIDIA CORPORATION nor the names of its
	//    contributors may be used to endorse or promote products derived
	//    from this software without specific prior written permission.
	//
	// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
	// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
	// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
	// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	//
	//----------------------------------------------------------------------------------

	#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
	#endif

	/*--------------------------------------------------------------------------*/
	#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
	#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
	/*--------------------------------------------------------------------------*/

	#define NUM_SAMPLES 5

	// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
	float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
	}

	/*============================================================================

									FXAA3 QUALITY - PC

	============================================================================*/

	/*--------------------------------------------------------------------------*/
	vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
	) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
					if(earlyExit) FxaaDiscard;
			#else
					if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
					// locate the edge
					vec2 dirToEdge;
					dirToEdge.x = contrastE > contrastW ? 1. : -1.;
					dirToEdge.y = contrastS > contrastN ? 1. : -1.;
					// . 2 .      . 1 .
					// 1 0 2  ~=  0 0 1
					// . 1 .      . 0 .

					// tap 2 pixels and see which ones are "outside" the edge, to
					// determine if the edge is vertical or horizontal

					vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongH = contrast( rgbaM, rgbaAlongH );
					// . 1 .
					// 0 0 1
					// . 0 H

					vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
					float matchAlongV = contrast( rgbaM, rgbaAlongV );
					// V 1 .
					// 0 0 1
					// . 0 .

					relativeVContrast = matchAlongV - matchAlongH;
					relativeVContrast *= fxaaQualityinvEdgeThreshold;

					if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
							// 1 1 .
							// 0 0 1
							// . 0 1

							// do a simple blur
							return mix(
									rgbaM,
									(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
									.4
							);
					}

					horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsed = 0;
			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {
					iterationsUsed = i;

					float increment = float(i + 1);

					if(!doneN) {
							nDist += increment;
							posN = posM + offNP * nDist;
							vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
							doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
							iterationsUsedN = i;
					}

					if(!doneP) {
							pDist += increment;
							posP = posM - offNP * pDist;
							vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
							doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
							iterationsUsedP = i;
					}

					if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
					doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
					doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
					rgbaM,
					rgbaN,
					dist * .5
			);
	}

	void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
					vUv,
					tDiffuse,
					resolution,
					edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
					invEdgeDetectionQuality
			);

	}
	`
}, bs = {
  uniforms: {
    tDiffuse: { value: null }
  },
  vertexShader: (
    /* glsl */
    `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`
  ),
  fragmentShader: (
    /* glsl */
    `

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vUv );

			gl_FragColor = LinearTosRGB( tex );

		}`
  )
};
var pe, ze, ke, Fe;
class ys {
  /**
   *
   * @param {SSThreeObject} ssThreeObject
   */
  constructor(e) {
    // 标题
    le(this, "title", "模块-three后处理【原生版】");
    /**
     * @type {EffectComposer}
     */
    le(this, "effectComposer", null);
    /**
     * @type {OutlinePass}
     */
    rt(this, pe, null);
    /**
     * @type {RenderPass}
     */
    rt(this, ze, null);
    /**
     * 伽马矫正
     * @param {ShaderPass}
     */
    rt(this, ke, null);
    /**
     * bloom pass
     * @param {UnrealBloomPass}
     */
    rt(this, Fe, null);
    /**
     * destory
     */
    le(this, "destroy", () => {
      if (this.closeRender(), this.effectComposer) {
        let e = this.getEffectComposer();
        e.passes.forEach((i) => {
          Ue.dispose(i);
        }), Ue.dispose(e.copyPass), Ze(this, pe, null), e.passes = [], e.renderTarget1.dispose(), e.renderTarget2.dispose(), e.writeBuffer = null, e.readBuffer = null, e.copyPass = null, e = null;
      }
    });
    /**
     * temp 基础后处理
     */
    le(this, "setup", () => {
      const e = new Dt(vs), i = this.ssThreeObject.threeRenderer.getPixelRatio();
      e.material.uniforms.resolution.value.x = 1 / (this.ssThreeObject.threeContainer.offsetWidth * i), e.material.uniforms.resolution.value.y = 1 / (this.ssThreeObject.threeContainer.offsetHeight * i), this.getEffectComposer().addPass(e);
    });
    /**
     * 增加模型轮廓
     * @param {Array<THREE.Object3D} aObject3Ds 一组模型体
     * @param {string | number} color #FFFFE0 #003354
     * @returns
     */
    le(this, "addOutlineByObject3Ds", (e = [], i = "#003354") => {
      const t = this.getEffectComposer(), { threeContainer: s, threeScene: n, threeCamera: r } = this.ssThreeObject;
      ee(this, ze) === null && Ze(this, ze, new ms(n, r)), t.passes.findIndex((o) => o === ee(this, ze)) === -1 && t.addPass(ee(this, ze)), ee(this, ke) === null && Ze(this, ke, new Dt(bs)), t.passes.findIndex((o) => o === ee(this, ke)) === -1 && t.addPass(ee(this, ke)), ee(this, pe) === null && (Ze(this, pe, new Ge(
        { x: s.clientWidth, y: s.clientHeight },
        this.ssThreeObject.threeScene,
        this.ssThreeObject.threeCamera
      )), ee(this, pe).edgeStrength = 5, ee(this, pe).edgeGlow = 2, ee(this, pe).edgeThickness = 1, ee(this, pe).pulsePeriod = 3, ee(this, pe).usePatternTexture = !1), ee(this, pe).visibleEdgeColor = new L.Color(i), ee(this, pe).hiddenEdgeColor = new L.Color(i), t.passes.findIndex((o) => o === ee(this, pe)) === -1 && t.addPass(ee(this, pe)), ee(this, pe).selectedObjects = e;
    });
    /**
     * 移除已添加描边
     */
    le(this, "removeOutline", () => {
      const e = this.getEffectComposer();
      e.removePass(ee(this, pe)), e.removePass(ee(this, ze)), e.removePass(ee(this, ke)), Ue.dispose(ee(this, pe)), Ue.dispose(ee(this, ke)), Ue.dispose(ee(this, ze));
    });
    /**
     * add bloom
     */
    le(this, "addBloom", () => {
      const e = this.getEffectComposer();
      ee(this, Fe) === null && Ze(this, Fe, new it(
        new L.Vector2(
          this.ssThreeObject.threeContainer.offsetWidth,
          this.ssThreeObject.threeContainer.offsetHeight
        )
      )), e.passes.findIndex((i) => i === ee(this, Fe)) === -1 && this.effectComposer.addPass(ee(this, Fe));
    });
    /**
     * remove bloom
     */
    le(this, "removeBloom", () => {
      var e, i;
      (i = (e = this.effectComposer) == null ? void 0 : e.removePass) == null || i.call(e, ee(this, Fe)), Ue.dispose(ee(this, Fe));
    });
    /**
     * 增加覆盖盒
     * @param {Array<THREE.Object3D>} aObject3Ds 一组模型体
     * @param {THREE.MeshStandardMaterialParameters} materialParams 材质配置
     * @returns
     */
    le(this, "addMaskBoxByObject3Ds", (e, i) => {
      const t = new L.MeshStandardMaterial({
        name: "tempmask",
        transparent: !0,
        opacity: 0.3,
        color: "#00ffff",
        depthWrite: !1,
        userData: {
          temp_isMask: !0
        },
        ...i
      });
      e.forEach((s) => {
        var n;
        if (s.isObject3D) {
          if ((n = s.userData) != null && n.tempMask) {
            s.userData.tempMask.visible = !0, s.userData.tempMask.position.copy(s.position);
            return;
          }
          const r = s.clone();
          r.name = `${s.name}_tempmask`, r.traverse((o) => {
            o.type === "Mesh" && (o.material = t);
          }), s.parent.add(r), s.userData.tempMask = r;
        }
      });
    });
    /**
     * 移除标记物
     * @param {Array<THREE.Object3D} aObject3Ds
     */
    le(this, "removeMaskBox", (e = []) => {
      e.forEach((i) => {
        var t, s, n;
        i.isObject3D && (s = (t = i.userData) == null ? void 0 : t.tempMask) != null && s.isObject3D && (Ue.dispose((n = i.userData) == null ? void 0 : n.tempMask), i.userData.tempMask.removeFromParent(), i.userData.tempMask = null);
      });
    });
    /**
     * 获取基础后处理
     * @returns
     */
    le(this, "getEffectComposer", () => {
      if (this.effectComposer instanceof si)
        return this.effectComposer;
      const { threeRenderer: e, threeContainer: i } = this.ssThreeObject, t = new si(e), s = i;
      return t.setSize(s.clientWidth, s.clientHeight), this.effectComposer = t, this.openRender(), t;
    });
    /**
     * open render
     */
    le(this, "openRender", () => {
      this.ssThreeObject.cancelRender(), de.add(() => {
        this.effectComposer.passes.length > 0 && this.effectComposer.render();
      }, "postProcess update");
    });
    /**
     * close render
     */
    le(this, "closeRender", () => {
      this.ssThreeObject.render(), de.removeId("postProcess update");
    });
    this.ssThreeObject = e;
  }
  moduleMount() {
  }
  getModuleConfig() {
    return {
      // 粗细
      edgeStrength: 5,
      // 发光强度
      edgeGlow: 2,
      // 光晕粗
      edgeThickness: 1,
      // 闪烁频率
      pulsePeriod: 3
    };
  }
  moduleGuiChange(e) {
    console.log(" gui params ", e);
  }
}
pe = new WeakMap(), ze = new WeakMap(), ke = new WeakMap(), Fe = new WeakMap();
const xs = 500 * 1024 * 1024, gi = "threeJsdb", Lt = 1, _e = [
  {
    name: "model",
    // 用于后续增量更新处理 <代表当前数据库的版本号>
    dbVersion: Lt,
    // last table columns
    columns: [
      {
        name: "model_name",
        primarykey: !0,
        unique: !1,
        autoIncrement: !1,
        type: "add"
      },
      {
        name: "model_type",
        type: "add"
      },
      {
        name: "model_path",
        type: "add"
      },
      {
        name: "size",
        type: "add"
      },
      {
        name: "create_time",
        type: "add"
      },
      {
        name: "update_time",
        type: "add"
      }
    ]
  },
  {
    name: "modelfile",
    // 用于后续增量更新处理 <代表当前数据库的版本号>
    dbVersion: Lt,
    // last table columns
    columns: [
      {
        name: "model_name",
        primarykey: !0,
        unique: !1,
        autoIncrement: !1,
        type: "add"
      },
      {
        name: "data",
        type: "add"
      }
    ]
  }
], ri = `${gi}_size`;
class ws {
  constructor() {
    this.targetDataBase = null, this.createDataTables = (e, i = _e) => {
      for (let t = 0; t < i.length; t++) {
        const s = i[t], { name: n, columns: r = [], dbVersion: o } = s;
        if (o === e.version)
          if (e.objectStoreNames.contains(n)) {
            const l = e.transaction(n).objectStore(n);
            r.forEach((c) => {
              c.type === "add" ? l.createIndex(c.name, c.name, {
                unique: c.unique
              }) : c.type === "del" && l.deleteIndex(c.name);
            });
          } else {
            const l = r.filter((d) => d.primarykey === !0).map((d) => d.name) || [], c = e.createObjectStore(n, {
              keyPath: l[0]
            });
            r.forEach((d) => {
              d.type === "add" && c.createIndex(d.name, d.name, {
                unique: d.unique
              });
            });
          }
      }
    }, this.addDbObserver = (e) => {
      e instanceof IDBDatabase && (e.onabort = (i) => {
        console.log(" 数据库被终止操作 ", i);
      }, e.onclose = (i) => {
        console.log(" 数据库被关闭事件 ", i);
      }, e.onerror = (i) => {
        console.log(" 数据库出错事件 ", i);
      }, e.onversionchange = (i) => {
        console.log(" 数据库版本改变事件 ", i);
      });
    }, this.insertModel = (e, i) => this.autoLRU(i.byteLength).then(
      () => this.open().then(
        (t) => new Promise((s, n) => {
          const r = _e[0].name, o = _e[1].name, l = t.transaction([r, o], "readwrite"), c = l.objectStore(r), d = l.objectStore(o);
          c.add({
            model_name: e,
            model_type: "",
            model_path: e,
            size: i.byteLength,
            create_time: (/* @__PURE__ */ new Date()).valueOf(),
            update_time: (/* @__PURE__ */ new Date()).valueOf()
          }), d.add({
            model_name: e,
            data: i
          }), l.oncomplete = () => {
            this.updateTotalSize(i.byteLength), s(!0);
          }, l.onerror = (f) => {
            n(f);
          }, l.onabort = (f) => {
            n(f);
          };
        })
      )
    ), this.getModel = (e) => {
      const i = _e[1].name;
      return this.get(e, i).then((t) => {
        if (t) {
          const s = _e[0].name;
          this.get(e, s).then((n) => n ? (n.update_time = (/* @__PURE__ */ new Date()).valueOf(), this.update(n, s)) : null);
        }
        return t;
      });
    }, this.deleteModels = (e) => this.open().then((i) => e.length === 0 ? Promise.resolve(!1) : new Promise((t, s) => {
      const n = _e[0].name, r = _e[1].name, o = i.transaction([n, r], "readwrite"), l = o.objectStore(n), c = o.objectStore(r);
      e.forEach((d) => {
        l.delete(d), c.delete(d);
      }), o.oncomplete = () => {
        t(!0);
      }, o.onerror = (d) => {
        s(d);
      }, o.onabort = (d) => {
        s(d);
      };
    })), this.get = (e, i = _e[1].name) => new Promise((t, s) => {
      this.open().then((n) => {
        if (n instanceof IDBDatabase) {
          const l = n.transaction(i, "readwrite").objectStore(i).get(e);
          l.onsuccess = () => {
            t(l.result);
          }, l.onerror = (c) => {
            s(c);
          };
        }
      });
    }), this.update = (e, i = _e[1].name) => new Promise((t, s) => {
      this.open().then((n) => {
        if (n instanceof IDBDatabase) {
          const l = n.transaction(i, "readwrite").objectStore(i).put(e);
          l.onsuccess = () => {
            t(l.result);
          }, l.onerror = (c) => {
            s(c);
          };
        }
      });
    }), this.delete = (e = "", i = _e[1].name) => new Promise((t, s) => {
      this.open().then((n) => {
        if (n instanceof IDBDatabase) {
          const l = n.transaction(i, "readwrite").objectStore(i).delete(e);
          l.onsuccess = () => {
            t(l.result);
          }, l.onerror = (c) => {
            s(c);
          };
        }
      });
    }), this.autoLRU = (e = 0) => {
      const i = this.getTotalSize();
      let t = xs - (i + e);
      return t > 0 ? Promise.resolve() : (t = Math.abs(t), this.open().then(
        (s) => new Promise((n, r) => {
          const o = _e[0].name, d = s.transaction([o], "readwrite").objectStore(o).getAll();
          d.onsuccess = () => {
            const k = (d.result || []).sort((h, S) => h.update_time - S.update_time), u = [];
            let g = 0, p = 0;
            for (; t > g; ) {
              const h = k[p];
              g += h.size, p += 1, u.push(h.model_name);
            }
            n({
              modelNames: u,
              reduceSize: g
            });
          }, d.onerror = (f) => {
            r(f);
          };
        })
      ).then((s) => {
        const { modelNames: n, reduceSize: r } = s;
        return this.deleteModels(n).then(() => {
          this.updateTotalSize(r * -1);
        });
      }));
    }, this.getTotalSize = () => {
      const e = localStorage.getItem(ri);
      return e ? parseInt(e, 10) : 0;
    }, this.updateTotalSize = (e = 0) => {
      const i = this.getTotalSize();
      localStorage.setItem(ri, `${i + e}`);
    };
  }
  destory() {
    var e;
    (e = this.targetDataBase) == null || e.close(), this.targetDataBase = null;
  }
  /**
   * open database
   */
  open() {
    return this.targetDataBase instanceof IDBDatabase ? Promise.resolve(this.targetDataBase) : new Promise((e, i) => {
      const t = window.indexedDB.open(gi, Lt);
      t.onsuccess = () => {
        const s = t.result;
        this.targetDataBase = s, this.addDbObserver(s), e(this.targetDataBase);
      }, t.onerror = (s) => {
        console.log("【LOG】数据库打开失败 ", s), this.targetDataBase = null, i(s);
      }, t.onupgradeneeded = (s) => {
        console.log("【LOG】数据库版本不一致 ", s.target);
        const n = s.target.result;
        this.createDataTables(n, _e);
      }, t.onblocked = (s) => {
        console.log("【LOG】当前数据库连接暂未关闭 ", s);
      };
    });
  }
}
class Ss {
  /**
   * @description container
   */
  constructor(e) {
    this.threeLoadingManager = null, this.db = null, this.messageQueue = null, this._progressBgElement = null, this._progressTextElement = null, this._progressElement = null, this.addProgressView = (i) => {
      if (document.getElementById("threeloadingprogress"))
        return;
      const t = document.createElement("div");
      t.id = "threeloadingprogress", t.style.height = "20px", t.style.borderRadius = "10px", t.style.border = "1px solid #00E8ff", t.style.padding = "1px", t.style.width = "15%", t.style.position = "absolute", t.style.bottom = "10%", t.style.left = "50%", t.style.transform = "translateX(-50%)", t.style.transition = "opacity 1s linear", t.style.opacity = "0", i.appendChild(t), this._progressBgElement = t;
      const s = document.createElement("div");
      s.style.backgroundColor = "#2fa1d6", s.style.maxWidth = "100%", s.style.height = "100%", s.style.borderRadius = "9px", t.appendChild(s), this._progressElement = s;
      const n = document.createElement("div");
      n.innerText = "模型渲染中...", n.style.position = "absolute", n.style.bottom = "100%", n.style.color = "#2fa1d6", n.style.width = "100%", n.style.height = "30px", n.style.lineHeight = "30px", n.style.textAlign = "center", n.style.fontSize = "16px", t.appendChild(n), this._progressTextElement = n, this.threeLoadingManager.onStart = (r, o, l) => {
        t.style.opacity = "1", n.innerText = "模型渲染中...";
      }, this.threeLoadingManager.onLoad = () => {
        t.style.opacity = "0";
      }, this.threeLoadingManager.onProgress = (r, o, l) => {
        s.style.width = `${o / l * 100}%`;
      }, this.threeLoadingManager.onError = (r) => {
        t.style.opacity = "0";
      };
    }, this.removeProgressView = () => {
      this._progressBgElement && this._progressBgElement.remove();
    }, this.downloadUrl = (i) => fetch(i, {
      method: "GET"
    }).then((t) => {
      if (t.status === 200) {
        let s = null;
        try {
          s = t.arrayBuffer();
        } catch {
          s = t.blob();
        }
        return s;
      }
      return Promise.reject(new Error("model fetch error"));
    }), this.downloadUrl2 = async (i, t) => {
      const s = await fetch(i, {
        method: "GET",
        headers: { responseType: "arraybuffer" }
      }), n = s.body.getReader(), r = +s.headers.get("Content-Length");
      let o = 0;
      const l = [];
      let c = !0, d = 0;
      for (; c; ) {
        const { done: u, value: g } = await n.read();
        if (u) {
          c = !1, t == null || t(1, l);
          break;
        }
        l.push(g), o += g.length, d += 0.01, d = Math.min(d, 0.99), t == null || t(r >= 0 ? d : o / r, l);
      }
      const f = new Uint8Array(o);
      let k = 0;
      return l.forEach((u) => {
        f.set(u, k), k += u.length;
      }), f.buffer;
    }, this.getModelFilePathByUrl = (i) => i.startsWith("data:") || i.startsWith("blob:") ? Promise.resolve(i) : this.db.getModel(i).then((t) => t ? URL.createObjectURL(new Blob([t == null ? void 0 : t.data])) : i), this.getModelDataByUrl = (i) => this.db.getModel(i).then((t) => t ? t.data : this.downloadUrl2(i, (s) => {
      this._progressBgElement && (this._progressBgElement.style.opacity = "1"), this._progressTextElement && (this._progressTextElement.innerText = "模型下载中..."), this._progressElement && (this._progressElement.style.width = `${s * 100}%`);
    }).then((s) => (this.db.insertModel(i, s), s))), this.threeLoadingManager = new L.LoadingManager(), this.db = new ws(), this.messageQueue = new mi(), this.threeLoadingManager.setURLModifier((i) => i), this.addProgressView(e);
  }
  destory() {
    var e, i;
    (e = this.db) == null || e.destory(), this.db = null, this.threeLoadingManager = null, this.removeProgressView(), (i = this.messageQueue) == null || i.destory(), this.messageQueue = null;
  }
}
class ks {
  constructor() {
    this.ssThreeObject = null, this.ssModuleCenter = null, this.ssMessageQueue = null, this.ssTransformControl = null, this.ssPostProcessModule = null, this.threeScene = null, this.threeCamera = null, this.threeAmbientLight = null, this.threeRenderer = null, this.threeEvent = null, this.ssLoadingManager = null, this._axisControlHelper = null, this._statsJs = null, this.setup = (e) => {
      let i = null;
      if (typeof e == "string" ? i = document.getElementById(e) : e instanceof HTMLElement && (i = e), !(i instanceof HTMLElement))
        return null;
      if (!Wt.isWebGLAvailable()) {
        const c = Wt.getWebGLErrorMessage();
        return i.appendChild(c), null;
      }
      const t = new L.Scene();
      this.threeScene = t;
      const s = i.offsetWidth / i.offsetHeight, n = new L.PerspectiveCamera(45, s, 0.1, 2e4);
      n.position.set(10, 10, 10), this.threeCamera = n;
      const r = this._addRender();
      i.append(r.domElement), this.threeRenderer = r;
      const o = new L.AmbientLight(new L.Color(16777215), 1);
      t.add(o), this.threeAmbientLight = o;
      const l = this._addOrbitControl(n, i);
      return this.threeEvent = new Ot(i), this.ssLoadingManager = new Ss(i), de.setup(), this.ssThreeObject = new ts({
        container: i,
        scene: t,
        camera: n,
        control: l,
        renderer: r
      }), this.ssThreeObject.autoWindowResize(), this.ssThreeObject.renderLoop(), this.ssModuleCenter = new ss(this.ssThreeObject), this.ssPostProcessModule = new ys(this.ssThreeObject), this.ssTransformControl = new us(this.ssThreeObject), de.add(() => {
        this.ssThreeObject.threeOrbitControl && this.ssThreeObject.threeOrbitControl.update();
      }, "control update"), t;
    }, this.addSkyOld = (e = []) => {
      const i = new L.PMREMGenerator(this.threeRenderer), t = new L.CubeTextureLoader(this.ssLoadingManager.threeLoadingManager);
      return new Promise((s, n) => {
        t.load(
          e,
          (r) => {
            const o = i.fromCubemap(r).texture;
            this.threeScene.environment = o, this.threeScene.background = o, i.dispose(), s(r);
          },
          null,
          (r) => {
            i.dispose(), n(r);
          }
        );
      });
    }, this.addSun = () => {
      const e = new L.Vector3(), i = new Mt();
      i.name = "Sky", i.scale.setScalar(1e4), this.threeScene.add(i);
      const t = i.material.uniforms;
      t.turbidity.value = 10, t.rayleigh.value = 2, t.mieCoefficient.value = 5e-3, t.mieDirectionalG.value = 0.8;
      const s = {
        elevation: 10,
        azimuth: 76,
        turbidity: 0,
        rayleigh: 0.1,
        mieCoefficient: 5e-3,
        mieDirectionalG: 0.8
      };
      return (() => {
        i.material.uniforms.turbidity.value = s.turbidity, i.material.uniforms.rayleigh.value = s.rayleigh, i.material.uniforms.mieCoefficient.value = s.mieCoefficient, i.material.uniforms.mieDirectionalG.value = s.mieDirectionalG;
        const r = L.MathUtils.degToRad(90 - s.elevation), o = L.MathUtils.degToRad(s.azimuth);
        e.setFromSphericalCoords(1, r, o), i.material.uniforms.sunPosition.value.copy(e);
      })(), i;
    }, this.addHDR = (e) => {
      const i = new L.PMREMGenerator(this.threeRenderer);
      if (e.length === 1)
        return new Promise((s, n) => {
          new pi(this.ssLoadingManager.threeLoadingManager).load(
            e[0],
            (o) => {
              const l = i.fromEquirectangular(o).texture;
              this.threeScene.background = l, this.threeScene.environment = l, i.dispose(), s(o);
            },
            null,
            (o) => {
              i.dispose(), n(o);
            }
          );
        });
      const t = new es(this.ssLoadingManager.threeLoadingManager);
      return new Promise((s, n) => {
        t.load(
          e,
          (r) => {
            const o = i.fromCubemap(r).texture;
            this.threeScene.environment = o, this.threeScene.background = o, i.dispose(), s(r);
          },
          null,
          (r) => {
            i.dispose(), n(r);
          }
        );
      });
    }, this._addRender = () => {
      const e = new L.WebGLRenderer({
        antialias: !0
        // alpha: true,
        // logarithmicDepthBuffer: true
      });
      return e.shadowMap.enabled = !0, e.shadowMap.type = L.PCFSoftShadowMap, e.setPixelRatio(window.devicePixelRatio), e.setClearColor("white", 0), e.autoClear = !0, e;
    }, this.addDymaicDebug = () => {
      this._addAxisControl(this.threeScene), this._addStatAnalyse();
    }, this.removeDymaicDebug = () => {
      this._removeAxisControl(), this._removeStatAnalyse();
    }, this.loadModelQueue = (e, i, t, s) => {
      if (e.length === 0) {
        i == null || i([]);
        return;
      }
      this.ssMessageQueue === null && (this.ssMessageQueue = new mi());
      const n = [];
      e.forEach((r) => {
        let o = Promise.resolve();
        switch (r.type) {
          case "obj":
            o = ot.loadObj(
              r.obj,
              r.mtl,
              null,
              this.ssLoadingManager.threeLoadingManager
            );
            break;
          case "fbx":
            o = this.loadFbx(r.fbx);
            break;
          case "gltf":
            o = this.loadGltf(r.gltf);
            break;
          case "draco":
            o = this.loadGltfDraco(r.draco);
            break;
          case "opt":
            o = this.loadGltfOptKTX(r.opt);
            break;
        }
        this.ssMessageQueue.add(() => {
          o.then((l) => {
            var c;
            t == null || t(r, l), l instanceof L.Object3D ? l.traverse((d) => {
              d.receiveShadow = !0, d.castShadow = !0;
            }) : l.scene instanceof L.Object3D && l.scene.traverse((d) => {
              d.receiveShadow = !0, d.castShadow = !0;
            }), n.push(l), s == null || s(r, l), (c = this.ssMessageQueue) == null || c.remove();
          }).catch((l) => {
            var c;
            console.log(" 模型渲染失败 ", r, l), (c = this.ssMessageQueue) == null || c.remove();
          });
        });
      }), this.ssMessageQueue.add(() => {
        i == null || i(n), this.ssMessageQueue.remove();
      });
    }, this.getModelDirectory = (e = "") => {
      const i = e.split("/");
      return i.pop(), `${i.join("/")}/`;
    }, this.loadFbx = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => ot.loadFbxBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltf = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => ot.loadGltfBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltfDraco = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => ot.loadGltfDracoBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltfOptKTX = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => ot.loadGltfOptKTXBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this._addOrbitControl = (e, i) => {
      const t = new Rt(
        e || this.threeCamera,
        i || this.ssThreeObject.threeContainer
      );
      return t.enableDamping = !0, t.dampingFactor = 0.25, t.enableZoom = !0, t.autoRotate = !1, t.autoRotateSpeed = 2, t.minDistance = 2, t.maxDistance = 1e3, t.enablePan = !0, t;
    }, this._removeOrbitControl = () => {
      this.ssThreeObject.threeOrbitControl !== null && (this.ssThreeObject.threeOrbitControl.dispose(), this.ssThreeObject.threeOrbitControl = null);
    }, this._addAxisControl = (e = this.threeScene) => {
      const i = new L.AxesHelper(100);
      e.add(i), this._axisControlHelper = i;
    }, this._removeAxisControl = () => {
      this._axisControlHelper !== null && (this._axisControlHelper.dispose(), this._axisControlHelper = null);
    }, this._addStatAnalyse = (e = this.ssThreeObject.threeContainer) => {
      const i = new Hi();
      this._statsJs = i, i.showPanel(0), e.appendChild(i.dom), i.dom.style.position = "absolute", i.dom.style.top = "unset", i.dom.style.bottom = "0px", de.add(() => {
        i.update();
      }, "fps render");
    }, this._removeStatAnalyse = () => {
      this._statsJs !== null && (this._statsJs.dom.remove(), this._statsJs.end(), this._statsJs = null, de.removeId("fps render"));
    }, this.getModelsByPoint = (e, i, t) => this.ssThreeObject.getModelsByPoint(e, i, t);
  }
  /**
   * 销毁机制
   */
  destroy(e = !0) {
    var i, t, s, n, r;
    (i = this.ssTransformControl) == null || i.destory(), this.ssTransformControl = null, (t = this.ssThreeObject) == null || t.destory(), (s = this.ssMessageQueue) == null || s.destory(), this.ssMessageQueue = null, (n = this.ssLoadingManager) == null || n.destory(), this.ssLoadingManager = null, e && de.destory(), (r = this.ssModuleCenter) == null || r.destroy(), this.ssModuleCenter = null, this._removeOrbitControl(), this.threeEvent.destory(), this.threeEvent = null, this.threeScene !== null && (Ue.dispose(this.threeScene), this.threeRenderer.info.programs.length !== 0 ? console.log("scene material has not released", this.threeRenderer.info) : this.threeRenderer.info.memory.geometries ? console.log("scene geometries has not released", this.threeRenderer.info) : this.threeRenderer.info.memory.textures && console.log("scene textures has not released", this.threeRenderer.info)), this.threeRenderer !== null && (this.threeRenderer.dispose(), this.threeRenderer.forceContextLoss(), this.ssThreeObject.threeContainer.removeChild(this.threeRenderer.domElement));
  }
  /**
   * 设置视角位置
   * @param cameraPosition 相机位置
   * @param controlPosition 场景位置
   * @param animate 开启动画
   * @param animateSpeed 动画速度
   * @param complete 结束事件
   */
  setEye(e, i, t = !0, s = 0.5, n) {
    this.ssThreeObject.setEye(e, i, t, s, n);
  }
  /**
   * 选择视角位置
   */
  getEye() {
    return this.ssThreeObject.getEye();
  }
}
const Fs = {
  /**
   * @description 先行
   */
  SSLinearGradientMaterial: Ui,
  /**
   * @description
   */
  SSLightScanMaterial: Gi
  /**
   * @description 墙体反射
   */
  // MeshReflectorMaterial
};
class Ms extends ut {
  constructor(e = document.createElement("div")) {
    super(), this.isCSS2DObject = !0, this.element = e, this.element.style.position = "absolute", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.center = new Z(0.5, 0.5), this.addEventListener("removed", function() {
      this.traverse(function(i) {
        i.element instanceof Element && i.element.parentNode !== null && i.element.parentNode.removeChild(i.element);
      });
    });
  }
  copy(e, i) {
    return super.copy(e, i), this.element = e.element.cloneNode(!0), this.center = e.center, this;
  }
}
const $e = new _(), ni = new Ee(), oi = new Ee(), ai = new _(), li = new _();
class _s {
  constructor(e = {}) {
    const i = this;
    let t, s, n, r;
    const o = {
      objects: /* @__PURE__ */ new WeakMap()
    }, l = e.element !== void 0 ? e.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l, this.getSize = function() {
      return {
        width: t,
        height: s
      };
    }, this.render = function(u, g) {
      u.matrixWorldAutoUpdate === !0 && u.updateMatrixWorld(), g.parent === null && g.matrixWorldAutoUpdate === !0 && g.updateMatrixWorld(), ni.copy(g.matrixWorldInverse), oi.multiplyMatrices(g.projectionMatrix, ni), c(u, u, g), k(u);
    }, this.setSize = function(u, g) {
      t = u, s = g, n = t / 2, r = s / 2, l.style.width = u + "px", l.style.height = g + "px";
    };
    function c(u, g, p) {
      if (u.isCSS2DObject) {
        $e.setFromMatrixPosition(u.matrixWorld), $e.applyMatrix4(oi);
        const h = u.visible === !0 && $e.z >= -1 && $e.z <= 1 && u.layers.test(p.layers) === !0;
        if (u.element.style.display = h === !0 ? "" : "none", h === !0) {
          u.onBeforeRender(i, g, p);
          const P = u.element;
          P.style.transform = "translate(" + -100 * u.center.x + "%," + -100 * u.center.y + "%)translate(" + ($e.x * n + n) + "px," + (-$e.y * r + r) + "px)", P.parentNode !== l && l.appendChild(P), u.onAfterRender(i, g, p);
        }
        const S = {
          distanceToCameraSquared: d(p, u)
        };
        o.objects.set(u, S);
      }
      for (let h = 0, S = u.children.length; h < S; h++)
        c(u.children[h], g, p);
    }
    function d(u, g) {
      return ai.setFromMatrixPosition(u.matrixWorld), li.setFromMatrixPosition(g.matrixWorld), ai.distanceToSquared(li);
    }
    function f(u) {
      const g = [];
      return u.traverse(function(p) {
        p.isCSS2DObject && g.push(p);
      }), g;
    }
    function k(u) {
      const g = f(u).sort(function(h, S) {
        if (h.renderOrder !== S.renderOrder)
          return S.renderOrder - h.renderOrder;
        const P = o.objects.get(h).distanceToCameraSquared, m = o.objects.get(S).distanceToCameraSquared;
        return P - m;
      }), p = g.length;
      for (let h = 0, S = g.length; h < S; h++)
        g[h].element.style.zIndex = p - h;
    }
  }
}
const hi = new _(), Ts = new Me(), ci = new _();
class js extends ut {
  constructor(e = document.createElement("div")) {
    super(), this.isCSS3DObject = !0, this.element = e, this.element.style.position = "absolute", this.element.style.pointerEvents = "auto", this.element.style.userSelect = "none", this.element.setAttribute("draggable", !1), this.addEventListener("removed", function() {
      this.traverse(function(i) {
        i.element instanceof Element && i.element.parentNode !== null && i.element.parentNode.removeChild(i.element);
      });
    });
  }
  copy(e, i) {
    return super.copy(e, i), this.element = e.element.cloneNode(!0), this;
  }
}
const De = new Ee(), Es = new Ee();
class Cs {
  constructor(e = {}) {
    const i = this;
    let t, s, n, r;
    const o = {
      camera: { fov: 0, style: "" },
      objects: /* @__PURE__ */ new WeakMap()
    }, l = e.element !== void 0 ? e.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l;
    const c = document.createElement("div");
    c.style.transformOrigin = "0 0", c.style.pointerEvents = "none", l.appendChild(c);
    const d = document.createElement("div");
    d.style.transformStyle = "preserve-3d", c.appendChild(d), this.getSize = function() {
      return {
        width: t,
        height: s
      };
    }, this.render = function(p, h) {
      const S = h.projectionMatrix.elements[5] * r;
      o.camera.fov !== S && (c.style.perspective = h.isPerspectiveCamera ? S + "px" : "", o.camera.fov = S), h.view && h.view.enabled ? (c.style.transform = `translate( ${-h.view.offsetX * (t / h.view.width)}px, ${-h.view.offsetY * (s / h.view.height)}px )`, c.style.transform += `scale( ${h.view.fullWidth / h.view.width}, ${h.view.fullHeight / h.view.height} )`) : c.style.transform = "", p.matrixWorldAutoUpdate === !0 && p.updateMatrixWorld(), h.parent === null && h.matrixWorldAutoUpdate === !0 && h.updateMatrixWorld();
      let P, m;
      h.isOrthographicCamera && (P = -(h.right + h.left) / 2, m = (h.top + h.bottom) / 2);
      const x = h.view && h.view.enabled ? h.view.height / h.view.fullHeight : 1, A = (h.isOrthographicCamera ? `scale( ${x} )scale(` + S + ")translate(" + f(P) + "px," + f(m) + "px)" + k(h.matrixWorldInverse) : `scale( ${x} )translateZ(` + S + "px)" + k(h.matrixWorldInverse)) + "translate(" + n + "px," + r + "px)";
      o.camera.style !== A && (d.style.transform = A, o.camera.style = A), g(p, p, h);
    }, this.setSize = function(p, h) {
      t = p, s = h, n = t / 2, r = s / 2, l.style.width = p + "px", l.style.height = h + "px", c.style.width = p + "px", c.style.height = h + "px", d.style.width = p + "px", d.style.height = h + "px";
    };
    function f(p) {
      return Math.abs(p) < 1e-10 ? 0 : p;
    }
    function k(p) {
      const h = p.elements;
      return "matrix3d(" + f(h[0]) + "," + f(-h[1]) + "," + f(h[2]) + "," + f(h[3]) + "," + f(h[4]) + "," + f(-h[5]) + "," + f(h[6]) + "," + f(h[7]) + "," + f(h[8]) + "," + f(-h[9]) + "," + f(h[10]) + "," + f(h[11]) + "," + f(h[12]) + "," + f(-h[13]) + "," + f(h[14]) + "," + f(h[15]) + ")";
    }
    function u(p) {
      const h = p.elements;
      return "translate(-50%,-50%)" + ("matrix3d(" + f(h[0]) + "," + f(h[1]) + "," + f(h[2]) + "," + f(h[3]) + "," + f(-h[4]) + "," + f(-h[5]) + "," + f(-h[6]) + "," + f(-h[7]) + "," + f(h[8]) + "," + f(h[9]) + "," + f(h[10]) + "," + f(h[11]) + "," + f(h[12]) + "," + f(h[13]) + "," + f(h[14]) + "," + f(h[15]) + ")");
    }
    function g(p, h, S, P) {
      if (p.isCSS3DObject) {
        const m = p.visible === !0 && p.layers.test(S.layers) === !0;
        if (p.element.style.display = m === !0 ? "" : "none", m === !0) {
          p.onBeforeRender(i, h, S);
          let x;
          p.isCSS3DSprite ? (De.copy(S.matrixWorldInverse), De.transpose(), p.rotation2D !== 0 && De.multiply(Es.makeRotationZ(p.rotation2D)), p.matrixWorld.decompose(hi, Ts, ci), De.setPosition(hi), De.scale(ci), De.elements[3] = 0, De.elements[7] = 0, De.elements[11] = 0, De.elements[15] = 1, x = u(De)) : x = u(p.matrixWorld);
          const y = p.element, A = o.objects.get(p);
          if (A === void 0 || A.style !== x) {
            y.style.transform = x;
            const Y = { style: x };
            o.objects.set(p, Y);
          }
          y.parentNode !== d && d.appendChild(y), p.onAfterRender(i, h, S);
        }
      }
      for (let m = 0, x = p.children.length; m < x; m++)
        g(p.children[m], h, S);
    }
  }
}
class Ps {
  constructor() {
    this.id = 0, this.object = null, this.z = 0, this.renderOrder = 0;
  }
}
class vi {
  constructor() {
    this.id = 0, this.v1 = new tt(), this.v2 = new tt(), this.v3 = new tt(), this.normalModel = new _(), this.vertexNormalsModel = [new _(), new _(), new _()], this.vertexNormalsLength = 0, this.color = new me(), this.material = null, this.uvs = [new Z(), new Z(), new Z()], this.z = 0, this.renderOrder = 0;
  }
}
class tt {
  constructor() {
    this.position = new _(), this.positionWorld = new _(), this.positionScreen = new ui(), this.visible = !0;
  }
  copy(e) {
    this.positionWorld.copy(e.positionWorld), this.positionScreen.copy(e.positionScreen);
  }
}
class bi {
  constructor() {
    this.id = 0, this.v1 = new tt(), this.v2 = new tt(), this.vertexColors = [new me(), new me()], this.material = null, this.z = 0, this.renderOrder = 0;
  }
}
class yi {
  constructor() {
    this.id = 0, this.object = null, this.x = 0, this.y = 0, this.z = 0, this.rotation = 0, this.scale = new Z(), this.material = null, this.renderOrder = 0;
  }
}
class Os {
  constructor() {
    let e, i, t = 0, s, n, r = 0, o, l, c = 0, d, f, k = 0, u, g, p = 0, h;
    const S = { objects: [], lights: [], elements: [] }, P = new _(), m = new ui(), x = new Ht(new _(-1, -1, -1), new _(1, 1, 1)), y = new Ht(), A = new Array(3), Y = new Ee(), j = new Ee(), R = new Ee(), W = new Fi(), N = [], oe = [], ge = [], se = [], $ = [];
    function ve() {
      const v = [], G = [], w = [];
      let C = null;
      const F = new fi();
      function B(M) {
        C = M, F.getNormalMatrix(C.matrixWorld), v.length = 0, G.length = 0, w.length = 0;
      }
      function T(M) {
        const U = M.position, V = M.positionWorld, K = M.positionScreen;
        V.copy(U).applyMatrix4(h), K.copy(V).applyMatrix4(j);
        const be = 1 / K.w;
        K.x *= be, K.y *= be, K.z *= be, M.visible = K.x >= -1 && K.x <= 1 && K.y >= -1 && K.y <= 1 && K.z >= -1 && K.z <= 1;
      }
      function D(M, U, V) {
        s = Oe(), s.position.set(M, U, V), T(s);
      }
      function H(M, U, V) {
        v.push(M, U, V);
      }
      function te(M, U, V) {
        G.push(M, U, V);
      }
      function he(M, U) {
        w.push(M, U);
      }
      function I(M, U, V) {
        return M.visible === !0 || U.visible === !0 || V.visible === !0 ? !0 : (A[0] = M.positionScreen, A[1] = U.positionScreen, A[2] = V.positionScreen, x.intersectsBox(y.setFromPoints(A)));
      }
      function q(M, U, V) {
        return (V.positionScreen.x - M.positionScreen.x) * (U.positionScreen.y - M.positionScreen.y) - (V.positionScreen.y - M.positionScreen.y) * (U.positionScreen.x - M.positionScreen.x) < 0;
      }
      function fe(M, U) {
        const V = oe[M], K = oe[U];
        V.positionScreen.copy(V.position).applyMatrix4(R), K.positionScreen.copy(K.position).applyMatrix4(R), Qe(V.positionScreen, K.positionScreen) === !0 && (V.positionScreen.multiplyScalar(1 / V.positionScreen.w), K.positionScreen.multiplyScalar(1 / K.positionScreen.w), d = Le(), d.id = C.id, d.v1.copy(V), d.v2.copy(K), d.z = Math.max(V.positionScreen.z, K.positionScreen.z), d.renderOrder = C.renderOrder, d.material = C.material, C.material.vertexColors && (d.vertexColors[0].fromArray(G, M * 3), d.vertexColors[1].fromArray(G, U * 3)), S.elements.push(d));
      }
      function z(M, U, V, K) {
        const be = oe[M], a = oe[U], O = oe[V];
        if (I(be, a, O) !== !1 && (K.side === St || q(be, a, O) === !0)) {
          o = We(), o.id = C.id, o.v1.copy(be), o.v2.copy(a), o.v3.copy(O), o.z = (be.positionScreen.z + a.positionScreen.z + O.positionScreen.z) / 3, o.renderOrder = C.renderOrder, P.subVectors(O.position, a.position), m.subVectors(be.position, a.position), P.cross(m), o.normalModel.copy(P), o.normalModel.applyMatrix3(F).normalize();
          for (let J = 0; J < 3; J++) {
            const ce = o.vertexNormalsModel[J];
            ce.fromArray(v, arguments[J] * 3), ce.applyMatrix3(F).normalize(), o.uvs[J].fromArray(w, arguments[J] * 2);
          }
          o.vertexNormalsLength = 3, o.material = K, K.vertexColors && o.color.fromArray(G, M * 3), S.elements.push(o);
        }
      }
      return {
        setObject: B,
        projectVertex: T,
        checkTriangleVisibility: I,
        checkBackfaceCulling: q,
        pushVertex: D,
        pushNormal: H,
        pushColor: te,
        pushUv: he,
        pushLine: fe,
        pushTriangle: z
      };
    }
    const Q = new ve();
    function X(v) {
      if (v.visible === !1)
        return;
      if (v.isLight)
        S.lights.push(v);
      else if (v.isMesh || v.isLine || v.isPoints) {
        if (v.material.visible === !1 || v.frustumCulled === !0 && W.intersectsObject(v) === !1)
          return;
        re(v);
      } else if (v.isSprite) {
        if (v.material.visible === !1 || v.frustumCulled === !0 && W.intersectsSprite(v) === !1)
          return;
        re(v);
      }
      const G = v.children;
      for (let w = 0, C = G.length; w < C; w++)
        X(G[w]);
    }
    function re(v) {
      e = Pe(), e.id = v.id, e.object = v, P.setFromMatrixPosition(v.matrixWorld), P.applyMatrix4(j), e.z = P.z, e.renderOrder = v.renderOrder, S.objects.push(e);
    }
    this.projectScene = function(v, G, w, C) {
      l = 0, f = 0, g = 0, S.elements.length = 0, v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), G.parent === null && G.matrixWorldAutoUpdate === !0 && G.updateMatrixWorld(), Y.copy(G.matrixWorldInverse), j.multiplyMatrices(G.projectionMatrix, Y), W.setFromProjectionMatrix(j), i = 0, S.objects.length = 0, S.lights.length = 0, X(v), w === !0 && S.objects.sort(Ae);
      const F = S.objects;
      for (let B = 0, T = F.length; B < T; B++) {
        const D = F[B].object, H = D.geometry;
        if (Q.setObject(D), h = D.matrixWorld, n = 0, D.isMesh) {
          let te = D.material;
          const he = Array.isArray(te), I = H.attributes, q = H.groups;
          if (I.position === void 0)
            continue;
          const fe = I.position.array;
          for (let z = 0, M = fe.length; z < M; z += 3) {
            let U = fe[z], V = fe[z + 1], K = fe[z + 2];
            const be = H.morphAttributes.position;
            if (be !== void 0) {
              const a = H.morphTargetsRelative, O = D.morphTargetInfluences;
              for (let J = 0, ce = be.length; J < ce; J++) {
                const ue = O[J];
                if (ue === 0)
                  continue;
                const Se = be[J];
                a ? (U += Se.getX(z / 3) * ue, V += Se.getY(z / 3) * ue, K += Se.getZ(z / 3) * ue) : (U += (Se.getX(z / 3) - fe[z]) * ue, V += (Se.getY(z / 3) - fe[z + 1]) * ue, K += (Se.getZ(z / 3) - fe[z + 2]) * ue);
              }
            }
            Q.pushVertex(U, V, K);
          }
          if (I.normal !== void 0) {
            const z = I.normal.array;
            for (let M = 0, U = z.length; M < U; M += 3)
              Q.pushNormal(z[M], z[M + 1], z[M + 2]);
          }
          if (I.color !== void 0) {
            const z = I.color.array;
            for (let M = 0, U = z.length; M < U; M += 3)
              Q.pushColor(z[M], z[M + 1], z[M + 2]);
          }
          if (I.uv !== void 0) {
            const z = I.uv.array;
            for (let M = 0, U = z.length; M < U; M += 2)
              Q.pushUv(z[M], z[M + 1]);
          }
          if (H.index !== null) {
            const z = H.index.array;
            if (q.length > 0)
              for (let M = 0; M < q.length; M++) {
                const U = q[M];
                if (te = he === !0 ? D.material[U.materialIndex] : D.material, te !== void 0)
                  for (let V = U.start, K = U.start + U.count; V < K; V += 3)
                    Q.pushTriangle(z[V], z[V + 1], z[V + 2], te);
              }
            else
              for (let M = 0, U = z.length; M < U; M += 3)
                Q.pushTriangle(z[M], z[M + 1], z[M + 2], te);
          } else if (q.length > 0)
            for (let z = 0; z < q.length; z++) {
              const M = q[z];
              if (te = he === !0 ? D.material[M.materialIndex] : D.material, te !== void 0)
                for (let U = M.start, V = M.start + M.count; U < V; U += 3)
                  Q.pushTriangle(U, U + 1, U + 2, te);
            }
          else
            for (let z = 0, M = fe.length / 3; z < M; z += 3)
              Q.pushTriangle(z, z + 1, z + 2, te);
        } else if (D.isLine) {
          R.multiplyMatrices(j, h);
          const te = H.attributes;
          if (te.position !== void 0) {
            const he = te.position.array;
            for (let I = 0, q = he.length; I < q; I += 3)
              Q.pushVertex(he[I], he[I + 1], he[I + 2]);
            if (te.color !== void 0) {
              const I = te.color.array;
              for (let q = 0, fe = I.length; q < fe; q += 3)
                Q.pushColor(I[q], I[q + 1], I[q + 2]);
            }
            if (H.index !== null) {
              const I = H.index.array;
              for (let q = 0, fe = I.length; q < fe; q += 2)
                Q.pushLine(I[q], I[q + 1]);
            } else {
              const I = D.isLineSegments ? 2 : 1;
              for (let q = 0, fe = he.length / 3 - 1; q < fe; q += I)
                Q.pushLine(q, q + 1);
            }
          }
        } else if (D.isPoints) {
          R.multiplyMatrices(j, h);
          const te = H.attributes;
          if (te.position !== void 0) {
            const he = te.position.array;
            for (let I = 0, q = he.length; I < q; I += 3)
              m.set(he[I], he[I + 1], he[I + 2], 1), m.applyMatrix4(R), ne(m, D, G);
          }
        } else
          D.isSprite && (D.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, D.matrixWorld), m.set(h.elements[12], h.elements[13], h.elements[14], 1), m.applyMatrix4(j), ne(m, D, G));
      }
      return C === !0 && S.elements.sort(Ae), S;
    };
    function ne(v, G, w) {
      const C = 1 / v.w;
      v.z *= C, v.z >= -1 && v.z <= 1 && (u = Xe(), u.id = G.id, u.x = v.x * C, u.y = v.y * C, u.z = v.z, u.renderOrder = G.renderOrder, u.object = G, u.rotation = G.rotation, u.scale.x = G.scale.x * Math.abs(u.x - (v.x + w.projectionMatrix.elements[0]) / (v.w + w.projectionMatrix.elements[12])), u.scale.y = G.scale.y * Math.abs(u.y - (v.y + w.projectionMatrix.elements[5]) / (v.w + w.projectionMatrix.elements[13])), u.material = G.material, S.elements.push(u));
    }
    function Pe() {
      if (i === t) {
        const v = new Ps();
        return N.push(v), t++, i++, v;
      }
      return N[i++];
    }
    function Oe() {
      if (n === r) {
        const v = new tt();
        return oe.push(v), r++, n++, v;
      }
      return oe[n++];
    }
    function We() {
      if (l === c) {
        const v = new vi();
        return ge.push(v), c++, l++, v;
      }
      return ge[l++];
    }
    function Le() {
      if (f === k) {
        const v = new bi();
        return se.push(v), k++, f++, v;
      }
      return se[f++];
    }
    function Xe() {
      if (g === p) {
        const v = new yi();
        return $.push(v), p++, g++, v;
      }
      return $[g++];
    }
    function Ae(v, G) {
      return v.renderOrder !== G.renderOrder ? v.renderOrder - G.renderOrder : v.z !== G.z ? G.z - v.z : v.id !== G.id ? v.id - G.id : 0;
    }
    function Qe(v, G) {
      let w = 0, C = 1;
      const F = v.z + v.w, B = G.z + G.w, T = -v.z + v.w, D = -G.z + G.w;
      return F >= 0 && B >= 0 && T >= 0 && D >= 0 ? !0 : F < 0 && B < 0 || T < 0 && D < 0 ? !1 : (F < 0 ? w = Math.max(w, F / (F - B)) : B < 0 && (C = Math.min(C, F / (F - B))), T < 0 ? w = Math.max(w, T / (T - D)) : D < 0 && (C = Math.min(C, T / (T - D))), C < w ? !1 : (v.lerp(G, w), G.lerp(v, 1 - C), !0));
    }
  }
}
class Rs {
  constructor() {
    let e, i, t, s, n, r, o, l, c, d, f, k = 0, u = null, g = 1, p, h;
    const S = this, P = new Ut(), m = new Ut(), x = new me(), y = new me(), A = new me(), Y = new me(), j = new me(), R = new me(), W = new _(), N = new _(), oe = new _(), ge = new fi(), se = new Ee(), $ = new Ee(), ve = [], Q = new Os(), X = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.domElement = X, this.autoClear = !0, this.sortObjects = !0, this.sortElements = !0, this.overdraw = 0.5, this.info = {
      render: {
        vertices: 0,
        faces: 0
      }
    }, this.setQuality = function(w) {
      switch (w) {
        case "high":
          g = 1;
          break;
        case "low":
          g = 0;
          break;
      }
    }, this.setClearColor = function(w) {
      R.set(w);
    }, this.setPixelRatio = function() {
    }, this.setSize = function(w, C) {
      s = w, n = C, r = s / 2, o = n / 2, X.setAttribute("viewBox", -r + " " + -o + " " + s + " " + n), X.setAttribute("width", s), X.setAttribute("height", n), P.min.set(-r, -o), P.max.set(r, o);
    }, this.getSize = function() {
      return {
        width: s,
        height: n
      };
    }, this.setPrecision = function(w) {
      u = w;
    };
    function re() {
      for (k = 0; X.childNodes.length > 0; )
        X.removeChild(X.childNodes[0]);
    }
    function ne(w) {
      return u !== null ? w.toFixed(u) : w;
    }
    this.clear = function() {
      re(), X.style.backgroundColor = R.getStyle();
    }, this.render = function(w, C) {
      if (!(C instanceof ji)) {
        console.error("THREE.SVGRenderer.render: camera is not an instance of Camera.");
        return;
      }
      const F = w.background;
      F && F.isColor ? (re(), X.style.backgroundColor = F.getStyle()) : this.autoClear === !0 && this.clear(), S.info.render.vertices = 0, S.info.render.faces = 0, se.copy(C.matrixWorldInverse), $.multiplyMatrices(C.projectionMatrix, se), e = Q.projectScene(w, C, this.sortObjects, this.sortElements), i = e.elements, t = e.lights, ge.getNormalMatrix(C.matrixWorldInverse), Pe(t), p = "", h = "";
      for (let B = 0, T = i.length; B < T; B++) {
        const D = i[B], H = D.material;
        if (!(H === void 0 || H.opacity === 0)) {
          if (m.makeEmpty(), D instanceof yi)
            l = D, l.x *= r, l.y *= -o, We(l, D, H);
          else if (D instanceof bi)
            l = D.v1, c = D.v2, l.positionScreen.x *= r, l.positionScreen.y *= -o, c.positionScreen.x *= r, c.positionScreen.y *= -o, m.setFromPoints([l.positionScreen, c.positionScreen]), P.intersectsBox(m) === !0 && Le(l, c, H);
          else if (D instanceof vi) {
            if (l = D.v1, c = D.v2, d = D.v3, l.positionScreen.z < -1 || l.positionScreen.z > 1 || c.positionScreen.z < -1 || c.positionScreen.z > 1 || d.positionScreen.z < -1 || d.positionScreen.z > 1)
              continue;
            l.positionScreen.x *= r, l.positionScreen.y *= -o, c.positionScreen.x *= r, c.positionScreen.y *= -o, d.positionScreen.x *= r, d.positionScreen.y *= -o, this.overdraw > 0 && (Ae(l.positionScreen, c.positionScreen, this.overdraw), Ae(c.positionScreen, d.positionScreen, this.overdraw), Ae(d.positionScreen, l.positionScreen, this.overdraw)), m.setFromPoints([
              l.positionScreen,
              c.positionScreen,
              d.positionScreen
            ]), P.intersectsBox(m) === !0 && Xe(l, c, d, D, H);
          }
        }
      }
      v(), w.traverseVisible(function(B) {
        if (B.isSVGObject) {
          if (W.setFromMatrixPosition(B.matrixWorld), W.applyMatrix4($), W.z < -1 || W.z > 1)
            return;
          const T = W.x * r, D = -W.y * o, H = B.node;
          H.setAttribute("transform", "translate(" + T + "," + D + ")"), X.appendChild(H);
        }
      });
    };
    function Pe(w) {
      A.setRGB(0, 0, 0), Y.setRGB(0, 0, 0), j.setRGB(0, 0, 0);
      for (let C = 0, F = w.length; C < F; C++) {
        const B = w[C], T = B.color;
        B.isAmbientLight ? (A.r += T.r, A.g += T.g, A.b += T.b) : B.isDirectionalLight ? (Y.r += T.r, Y.g += T.g, Y.b += T.b) : B.isPointLight && (j.r += T.r, j.g += T.g, j.b += T.b);
      }
    }
    function Oe(w, C, F, B) {
      for (let T = 0, D = w.length; T < D; T++) {
        const H = w[T], te = H.color;
        if (H.isDirectionalLight) {
          const he = W.setFromMatrixPosition(H.matrixWorld).normalize();
          let I = F.dot(he);
          if (I <= 0)
            continue;
          I *= H.intensity, B.r += te.r * I, B.g += te.g * I, B.b += te.b * I;
        } else if (H.isPointLight) {
          const he = W.setFromMatrixPosition(H.matrixWorld);
          let I = F.dot(W.subVectors(he, C).normalize());
          if (I <= 0 || (I *= H.distance == 0 ? 1 : 1 - Math.min(C.distanceTo(he) / H.distance, 1), I == 0))
            continue;
          I *= H.intensity, B.r += te.r * I, B.g += te.g * I, B.b += te.b * I;
        }
      }
    }
    function We(w, C, F) {
      let B = C.scale.x * r, T = C.scale.y * o;
      F.isPointsMaterial && (B *= F.size, T *= F.size);
      const D = "M" + ne(w.x - B * 0.5) + "," + ne(w.y - T * 0.5) + "h" + ne(B) + "v" + ne(T) + "h" + ne(-B) + "z";
      let H = "";
      (F.isSpriteMaterial || F.isPointsMaterial) && (H = "fill:" + F.color.getStyle() + ";fill-opacity:" + F.opacity), Qe(H, D);
    }
    function Le(w, C, F) {
      const B = "M" + ne(w.positionScreen.x) + "," + ne(w.positionScreen.y) + "L" + ne(C.positionScreen.x) + "," + ne(C.positionScreen.y);
      if (F.isLineBasicMaterial) {
        let T = "fill:none;stroke:" + F.color.getStyle() + ";stroke-opacity:" + F.opacity + ";stroke-width:" + F.linewidth + ";stroke-linecap:" + F.linecap;
        F.isLineDashedMaterial && (T = T + ";stroke-dasharray:" + F.dashSize + "," + F.gapSize), Qe(T, B);
      }
    }
    function Xe(w, C, F, B, T) {
      S.info.render.vertices += 3, S.info.render.faces++;
      const D = "M" + ne(w.positionScreen.x) + "," + ne(w.positionScreen.y) + "L" + ne(C.positionScreen.x) + "," + ne(C.positionScreen.y) + "L" + ne(F.positionScreen.x) + "," + ne(F.positionScreen.y) + "z";
      let H = "";
      T.isMeshBasicMaterial ? (x.copy(T.color), T.vertexColors && x.multiply(B.color)) : T.isMeshLambertMaterial || T.isMeshPhongMaterial || T.isMeshStandardMaterial ? (y.copy(T.color), T.vertexColors && y.multiply(B.color), x.copy(A), N.copy(w.positionWorld).add(C.positionWorld).add(F.positionWorld).divideScalar(3), Oe(t, N, B.normalModel, x), x.multiply(y).add(T.emissive)) : T.isMeshNormalMaterial && (oe.copy(B.normalModel).applyMatrix3(ge).normalize(), x.setRGB(oe.x, oe.y, oe.z).multiplyScalar(0.5).addScalar(0.5)), T.wireframe ? H = "fill:none;stroke:" + x.getStyle() + ";stroke-opacity:" + T.opacity + ";stroke-width:" + T.wireframeLinewidth + ";stroke-linecap:" + T.wireframeLinecap + ";stroke-linejoin:" + T.wireframeLinejoin : H = "fill:" + x.getStyle() + ";fill-opacity:" + T.opacity, Qe(H, D);
    }
    function Ae(w, C, F) {
      let B = C.x - w.x, T = C.y - w.y;
      const D = B * B + T * T;
      if (D === 0)
        return;
      const H = F / Math.sqrt(D);
      B *= H, T *= H, C.x += B, C.y += T, w.x -= B, w.y -= T;
    }
    function Qe(w, C) {
      h === w ? p += C : (v(), h = w, p = C);
    }
    function v() {
      p && (f = G(k++), f.setAttribute("d", p), f.setAttribute("style", h), X.appendChild(f)), p = "", h = "";
    }
    function G(w) {
      return ve[w] == null && (ve[w] = document.createElementNS("http://www.w3.org/2000/svg", "path"), g == 0 && ve[w].setAttribute("shape-rendering", "crispEdges")), ve[w];
    }
  }
}
class Ns {
  constructor(e) {
    this.css2dRender = null, this.css3dRender = null, this.svgRender = null, this._resizeObserver = null, this._ssThreeObject = null, this.destory = () => {
      this._removeResizeOBserver(), de.removeIds(["svgFrameHandle", "css2dFrameHandle", "css3dFrameHandle"]), this.cancelRender2D(), this.cancelRender3D(), this.cancelRenderSVG(), this._ssThreeObject = null;
    }, this.render2D = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.css2dRender && (this.css2dRender = new _s(), this.css2dRender.domElement.style.position = "absolute", this.css2dRender.domElement.style.top = "0px", this.css2dRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.css2dRender.domElement), de.add(() => {
        this.css2dRender.render(i, t);
      }, "css2dFrameHandle"));
    }, this.cancelRender2D = () => {
      var i, t;
      de.removeId("css2dFrameHandle"), (t = (i = this.css2dRender) == null ? void 0 : i.domElement) == null || t.remove(), this.css2dRender = null;
    }, this.render3D = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.css3dRender && (this.css3dRender = new Cs(), this.css3dRender.domElement.style.position = "absolute", this.css3dRender.domElement.style.top = "0px", this.css3dRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.css3dRender.domElement), de.add(() => {
        this.css3dRender.render(i, t);
      }, "css3dFrameHandle"));
    }, this.cancelRender3D = () => {
      var i, t;
      de.removeId("css3dFrameHandle"), (t = (i = this.css3dRender) == null ? void 0 : i.domElement) == null || t.remove(), this.css3dRender = null;
    }, this.renderSVG = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.svgRender && (this.svgRender = new Rs(), this.svgRender.domElement.style.position = "absolute", this.svgRender.domElement.style.top = "0px", this.svgRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.svgRender.domElement), de.add(() => {
        this.svgRender.render(i, t);
      }, "svgFrameHandle"));
    }, this.cancelRenderSVG = () => {
      var i, t;
      de.removeId("svgFrameHandle"), (t = (i = this.svgRender) == null ? void 0 : i.domElement) == null || t.remove(), this.svgRender = null;
    }, this.drawingLabel = (i, t, s, n) => {
      const r = [i, t, s], o = new L.LineBasicMaterial({ color: 51390, linewidth: 10 }), l = new L.BufferGeometry().setFromPoints(r), c = new L.Line(l, o), d = document.createElement("div");
      d.className = "label", d.style.fontSize = "40px", d.style.marginTop = "-42px", d.style.padding = "40px 80px", d.style.backgroundColor = "#fff", d.style.color = "#000000", d.style.border = "1px solid #16BFB0", d.textContent = n || "示例";
      const f = new Ms(d);
      return f.position.set(s.x, s.y, s.z), {
        line: c,
        tagLabel: f
      };
    }, this.drawLines = (i, t, s = 1e-3) => {
      i.length() === 0 && (i.x = 1e-3);
      const n = 0, r = n * 2.5, o = n * n * 50, l = new L.Vector3(0, 0, 0), c = new L.Ray(l, this._getVCenter(i.clone(), t.clone())), d = c.at(
        o / c.at(1, new L.Vector3()).distanceTo(l),
        new L.Vector3()
      ), f = this._getLenVcetor(i.clone(), d, r), k = this._getLenVcetor(t.clone(), d, r), u = new L.CubicBezierCurve3(i, f, k, t), g = new Wi(), p = u.getPoints(50), h = [], S = [], P = new L.Color();
      for (let x = 0; x < p.length; x++)
        P.setHSL(0.31666 + x * 5e-3, 0.7, 0.7), S.push(P.r, P.g, P.b), h.push(p[x].x, p[x].y, p[x].z);
      g.setPositions(h), g.setColors(S);
      const m = new Qi({
        // linewidth: 0.0006,
        linewidth: s,
        vertexColors: !0,
        dashed: !1
      });
      return {
        curve: u,
        lineMesh: new Vi(g, m)
      };
    }, this._getVCenter = (i, t) => i.add(t).divideScalar(2), this._getLenVcetor = (i, t, s) => {
      const n = i.distanceTo(t);
      return i.lerp(t, s / n);
    }, this._addResizeObserver = (i = document.body) => {
      if (this._resizeObserver === null) {
        const t = new window.ResizeObserver(() => {
          this.css2dRender && (de.removeId("css2dFrameHandle"), this.css2dRender.setSize(i.offsetWidth, i.offsetHeight), de.add(() => {
            this.css2dRender.render(
              this._ssThreeObject.threeScene,
              this._ssThreeObject.threeCamera
            );
          }, "css2dFrameHandle")), this.css3dRender && (de.removeId("css3dFrameHandle"), this.css3dRender.setSize(i.offsetWidth, i.offsetHeight), de.add(() => {
            this.css3dRender.render(
              this._ssThreeObject.threeScene,
              this._ssThreeObject.threeCamera
            );
          }, "css3dFrameHandle")), this.svgRender && (de.removeId("svgFrameHandle"), this.svgRender.setSize(i.offsetWidth, i.offsetHeight), de.add(() => {
            this.svgRender.render(this._ssThreeObject.threeScene, this._ssThreeObject.threeCamera);
          }, "svgFrameHandle"));
        });
        t.observe(i), this._resizeObserver = t;
      }
    }, this._removeResizeOBserver = () => {
      this._resizeObserver !== null && (this._resizeObserver.disconnect(), this._resizeObserver = null);
    }, this._ssThreeObject = e;
  }
}
class Ds {
  // /**
  //  * 根据点位路径创建道路
  //  * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 [-]反向流动 0.02 ,repeat: 平铺 0.2
  //  * pathWidth = 30 ,close : 是否闭合false} , emissiveIntensity 自发光强度
  //  */
  // addRoadPath = ({
  //   points,
  //   mapPath,
  //   color,
  //   opacity = 1,
  //   scrollSpeed = 0.02,
  //   repeat = 0.2,
  //   pathWidth = 30,
  //   depthTest = true,
  //   emissiveIntensity = 1,
  //   progress = 1
  // }) => {
  //   const type = 'path';
  //   // create PathPointList
  //   const pathPointList = new PathPointList();
  //   // pathPointList.set(points, 0.3, 10, up, false);
  //   pathPointList.set(points, 0.3, 10);
  //   // create geometry
  //   const width = 0.2;
  //   const geometry = new PathGeometry();
  //   geometry.update(pathPointList, {
  //     width,
  //     arrow: false
  //   });
  //   const texture = new THREE.TextureLoader().load(
  //     //   mapPath || './public/threeTextures/overview/pilpeline3.png',
  //     //   mapPath || './public/threeTextures/overview/path_007_18.png',
  //     mapPath || './public/threeTextures/overview/light.png',
  //     (map) => {
  //       map.wrapS = THREE.RepeatWrapping;
  //       map.wrapT = map.wrapS;
  //       map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
  //     }
  //   );
  //   const material = new THREE.MeshPhongMaterial({
  //     // color: color || 0x58dede,
  //     color,
  //     // emissive: color || 0x58dede,
  //     // emissive: color,
  //     emissiveMap: texture,
  //     emissiveIntensity,
  //     depthWrite: true,
  //     transparent: true,
  //     opacity,
  //     // side: THREE.FrontSide,
  //     side: THREE.DoubleSide,
  //     polygonOffset: true,
  //     polygonOffsetFactor: 0,
  //     polygonOffsetUnits: 1.0,
  //     depthTest
  //   });
  //   material.map = texture;
  //   const mesh = new THREE.Mesh(geometry, material);
  //   threeScene.add(mesh);
  //   const playing = true;
  //   const params = {
  //     useTexture: true,
  //     color: [88, 222, 222],
  //     scrollUV: true,
  //     scrollSpeed,
  //     width: pathWidth,
  //     cornerRadius: 1,
  //     cornerSplit: 10,
  //     progress,
  //     playSpeed: 0.14,
  //     repeat
  //   };
  //   // 存储
  //   const data = {
  //     pathPointList,
  //     mesh,
  //     geometry,
  //     texture,
  //     params,
  //     playing,
  //     type
  //   };
  //   this._pathDataList.push(data);
  //   // ------
  //   // // // gui
  //   // const gui = new GUI();
  //   // gui.domElement.style.position = 'absolute';
  //   // gui.domElement.style.top = '1.5rem';
  //   // gui.domElement.style.right = '1.2rem';
  //   // gui.domElement.style.zIndex = 2000;
  //   // gui.name = 'three调试配置';
  //   // gui.width = 300;
  //   // gui.closed = false;
  //   // let _params = {
  //   //   color: new THREE.Color(1, 1, 1)
  //   // };
  //   // gui.addColor(_params, 'color').onChange((value) => {
  //   //   material.color = new THREE.Color(value.r / 255, value.g / 255, value.b / 255);
  //   // });
  //   return data;
  // };
  // /**
  //  * 根据点位路径创建道路
  //  * @param {*} param0 { points:点数组位[], mapPath: 纹理路径, color : 颜色 ,scrollSpeed:速度 0.02 ,repeat: 平铺 0.2
  //  * radius = 2 , radialSegments = 8 圆柱分段数,close : 是否闭合false}
  //  */
  // addTubePath = ({
  //   points,
  //   mapPath,
  //   color,
  //   radius = 2,
  //   radialSegments = 8,
  //   scrollSpeed = 0.02,
  //   repeat = 0.2,
  //   depthTest = true
  // }) => {
  //   const type = 'tube';
  //   const { threeScene, threeRenderer } = this.ssThreeObject;
  //   if (!this._isLoopRender) {
  //     this._isLoopRender = true;
  //     // SSThreeLoop.add({ id: 'path', update: this.update });
  //     SSThreeLoop.add(this.update, 'roadpath render');
  //   }
  //   const up = new THREE.Vector3(0, 1, 0);
  //   // create PathPointList
  //   const pathPointList = new PathPointList();
  //   // pathPointList.set(points, 0.3, 10, up, false);
  //   pathPointList.set(points, 0.3, 10, up, false);
  //   // create geometry
  //   const geometry = new PathTubeGeometry({
  //     pathPointList,
  //     options: { radius, radialSegments, arrow: false },
  //     usage: THREE.DynamicDrawUsage
  //   });
  //   // update geometry when pathPointList changed
  //   geometry.update(pathPointList, {
  //     radius, // default is 0.1
  //     radialSegments, // default is 8
  //     progress: 1, // default is 1
  //     startRad: 0, // default is 0
  //     arrow: false
  //   });
  //   const texture = new THREE.TextureLoader().load(
  //     //   mapPath || './public/threeTextures/overview/pilpeline3.png',
  //     //   mapPath || './public/threeTextures/overview/path_007_18.png',
  //     mapPath || './public/threeTextures/overview/light.png',
  //     (map) => {
  //       map.wrapS = THREE.RepeatWrapping;
  //       map.wrapT = map.wrapS;
  //       map.anisotropy = threeRenderer.capabilities.getMaxAnisotropy();
  //     }
  //   );
  //   const material = new THREE.MeshPhongMaterial({
  //     color: color || 0x58dede,
  //     depthWrite: true,
  //     transparent: true,
  //     opacity: 0.9,
  //     // side: THREE.FrontSide,
  //     side: THREE.DoubleSide,
  //     depthTest
  //   });
  //   material.map = texture;
  //   const mesh = new THREE.Mesh(geometry, material);
  //   threeScene.add(mesh);
  //   const playing = true;
  //   const params = {
  //     useTexture: true,
  //     color: [88, 222, 222],
  //     scrollUV: true,
  //     scrollSpeed,
  //     radius,
  //     radialSegments,
  //     cornerRadius: 0.3,
  //     cornerSplit: 10,
  //     progress: 1,
  //     playSpeed: 0.14,
  //     repeat
  //   };
  //   // var gui = new dat.GUI();
  //   // 存储
  //   const data = {
  //     pathPointList,
  //     mesh,
  //     geometry,
  //     texture,
  //     params,
  //     playing,
  //     type
  //   };
  //   this._pathDataList.push(data);
  //   return data;
  // };
  /**
   * 根据点位创建路径
   * @param points
   * @param pathOption
   * @param material
   * @returns
   */
  static pathFromPoints(e, i, t) {
    const s = this.pathGeomery(e, t);
    return new L.Mesh(s, i);
  }
  /**
   * 根据点位创建路径
   * @param points
   * @param pathOption
   * @param material
   * @returns
   */
  static pathTubefromPoints(e, i, t) {
    const s = this.pathGeomery(e, t);
    return new L.Mesh(s, i);
  }
  /**
   * @description 路径几何体(线条拐角方正)
   */
  static pathGeomery(e, i) {
    const t = new Gt();
    t.set(e, i.cornerRadius, i.cornerSplit, i.up, i.close);
    const s = new Yi({
      pathPointList: t,
      options: {
        width: 0.1,
        // default is 0.1
        arrow: !0,
        // default is true
        progress: 1,
        // default is 1
        side: "both"
        // "left"/"right"/"both", default is "both"
      },
      usage: L.StaticDrawUsage
      // geometry usage
    });
    return s.update(t, {
      width: 0.1,
      // default is 0.1
      arrow: !0,
      // default is true
      progress: 1,
      // default is 1
      side: "both"
      // "left"/"right"/"both", default is "both"
    }), s;
  }
  /**
   * @description 路径几何体(线条拐角方正)
   */
  static pathTubeGeometry(e, i) {
    const t = new Gt();
    t.set(e, i.cornerRadius, i.cornerSplit, i.up, i.close);
    const s = new Xi(
      {
        pathPointList: t,
        options: {
          radius: 0.1,
          // default is 0.1
          radialSegments: 8,
          // default is 8
          progress: 1,
          // default is 1
          startRad: 0
          // default is 0
        },
        usage: L.StaticDrawUsage
        // geometry usage
      },
      !1
    );
    return s.update(t, {
      radius: 0.1,
      // default is 0.1
      radialSegments: 8,
      // default is 8
      progress: 1,
      // default is 1
      startRad: 0
      // default is 0
    }), s;
  }
}
const Hs = {
  /**
   * @description 墙体材质
   */
  WallMesh: Zi,
  /**
   * @description 水波纹材质
   */
  WaterMesh: qi,
  /**
   * @description 路径材质
   */
  PathMesh: Ds
};
export {
  Ms as CSS2DObject,
  js as CSS3DObject,
  Ns as SSCssRenderer,
  Ue as SSDispose,
  ss as SSFileSetting,
  ot as SSLoader,
  Fs as SSMaterial,
  Hs as SSMesh,
  Ot as SSThreeEvent,
  de as SSThreeLoop,
  ts as SSThreeObject,
  Ni as SSThreeTool,
  L as THREE,
  ks as default
};
