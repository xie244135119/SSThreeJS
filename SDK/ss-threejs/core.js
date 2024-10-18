var bi = Object.defineProperty;
var yi = (b, e, i) => e in b ? bi(b, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : b[e] = i;
var le = (b, e, i) => (yi(b, typeof e != "symbol" ? e + "" : e, i), i), jt = (b, e, i) => {
  if (!e.has(b))
    throw TypeError("Cannot " + i);
};
var ee = (b, e, i) => (jt(b, e, "read from private field"), i ? i.call(b) : e.get(b)), st = (b, e, i) => {
  if (e.has(b))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(b) : e.set(b, i);
}, Xe = (b, e, i, t) => (jt(b, e, "write to private field"), t ? t.call(b, i) : e.set(b, i), i);
import * as L from "three";
import { EventDispatcher as xi, Vector3 as _, MOUSE as Ze, TOUCH as qe, Quaternion as Me, Spherical as Ft, Vector2 as Z, DataTextureLoader as Si, HalfFloatType as $e, FloatType as yt, DataUtils as pt, LinearSRGBColorSpace as Pt, LinearFilter as Je, Loader as wi, CubeTexture as Mi, FileLoader as _i, DataTexture as Ti, Mesh as E, ShaderMaterial as _e, UniformsUtils as dt, BackSide as Ei, BoxGeometry as ye, Raycaster as Ci, Object3D as ut, Euler as Pi, Matrix4 as Te, MeshBasicMaterial as Lt, LineBasicMaterial as Oi, CylinderGeometry as xe, BufferGeometry as Ot, Float32BufferAttribute as St, OctahedronGeometry as mt, Line as je, SphereGeometry as Ri, TorusGeometry as rt, PlaneGeometry as Di, DoubleSide as wt, OrthographicCamera as Ai, WebGLRenderTarget as Ee, Clock as Li, Color as me, AdditiveBlending as ci, MeshDepthMaterial as Bi, RGBADepthPacking as Ii, NoBlending as Nt, Vector4 as di, Box3 as Ht, Frustum as zi, Matrix3 as ui, Box2 as Ut, Camera as ki } from "three";
import { S as ji, a as de, s as Fe, b as Rt, c as He, d as nt, e as Fi, f as Ni, g as Hi, L as Ui, h as Gi, i as Wi, P as Vi, j as Qi, k as Gt, l as Yi, m as Xi } from "./three.path.module-01d54a3c.js";
import Zi from "lil-gui";
import qi from "./tool/file.js";
class Ki {
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
const Wt = Ki, Vt = { type: "change" }, _t = { type: "start" }, Qt = { type: "end" };
class Dt extends xi {
  constructor(e, i) {
    super(), this.object = e, this.domElement = i, this.domElement.style.touchAction = "none", this.enabled = !0, this.target = new _(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }, this.mouseButtons = { LEFT: Ze.ROTATE, MIDDLE: Ze.DOLLY, RIGHT: Ze.PAN }, this.touches = { ONE: qe.ROTATE, TWO: qe.DOLLY_PAN }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this.getPolarAngle = function() {
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
      t.target.copy(t.target0), t.object.position.copy(t.position0), t.object.zoom = t.zoom0, t.object.updateProjectionMatrix(), t.dispatchEvent(Vt), t.update(), n = s.NONE;
    }, this.update = function() {
      const a = new _(), O = new Me().setFromUnitVectors(e.up, new _(0, 1, 0)), J = O.clone().invert(), ce = new _(), ue = new Me(), we = 2 * Math.PI;
      return function() {
        const kt = t.object.position;
        a.copy(kt).sub(t.target), a.applyQuaternion(O), o.setFromVector3(a), t.autoRotate && n === s.NONE && D(Y()), t.enableDamping ? (o.theta += l.theta * t.dampingFactor, o.phi += l.phi * t.dampingFactor) : (o.theta += l.theta, o.phi += l.phi);
        let Le = t.minAzimuthAngle, Be = t.maxAzimuthAngle;
        return isFinite(Le) && isFinite(Be) && (Le < -Math.PI ? Le += we : Le > Math.PI && (Le -= we), Be < -Math.PI ? Be += we : Be > Math.PI && (Be -= we), Le <= Be ? o.theta = Math.max(Le, Math.min(Be, o.theta)) : o.theta = o.theta > (Le + Be) / 2 ? Math.max(Le, o.theta) : Math.min(Be, o.theta)), o.phi = Math.max(t.minPolarAngle, Math.min(t.maxPolarAngle, o.phi)), o.makeSafe(), o.radius *= h, o.radius = Math.max(t.minDistance, Math.min(t.maxDistance, o.radius)), t.enableDamping === !0 ? t.target.addScaledVector(d, t.dampingFactor) : t.target.add(d), a.setFromSpherical(o), a.applyQuaternion(J), kt.copy(t.target).add(a), t.object.lookAt(t.target), t.enableDamping === !0 ? (l.theta *= 1 - t.dampingFactor, l.phi *= 1 - t.dampingFactor, d.multiplyScalar(1 - t.dampingFactor)) : (l.set(0, 0, 0), d.set(0, 0, 0)), h = 1, u || ce.distanceToSquared(t.object.position) > r || 8 * (1 - ue.dot(t.object.quaternion)) > r ? (t.dispatchEvent(Vt), ce.copy(t.object.position), ue.copy(t.object.quaternion), u = !1, !0) : !1;
      };
    }(), this.dispose = function() {
      t.domElement.removeEventListener("contextmenu", M), t.domElement.removeEventListener("pointerdown", T), t.domElement.removeEventListener("pointercancel", H), t.domElement.removeEventListener("wheel", z), t.domElement.removeEventListener("pointermove", A), t.domElement.removeEventListener("pointerup", H), t._domElementKeyEvents !== null && (t._domElementKeyEvents.removeEventListener("keydown", q), t._domElementKeyEvents = null);
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
    const r = 1e-6, o = new Ft(), l = new Ft();
    let h = 1;
    const d = new _();
    let u = !1;
    const R = new Z(), f = new Z(), g = new Z(), p = new Z(), c = new Z(), x = new Z(), P = new Z(), m = new Z(), S = new Z(), y = [], B = {};
    function Y() {
      return 2 * Math.PI / 60 / 60 * t.autoRotateSpeed;
    }
    function F() {
      return Math.pow(0.95, t.zoomSpeed);
    }
    function D(a) {
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
          const we = t.object.position;
          a.copy(we).sub(t.target);
          let ft = a.length();
          ft *= Math.tan(t.object.fov / 2 * Math.PI / 180), N(2 * J * ft / ue.clientHeight, t.object.matrix), oe(2 * ce * ft / ue.clientHeight, t.object.matrix);
        } else
          t.object.isOrthographicCamera ? (N(J * (t.object.right - t.object.left) / t.object.zoom / ue.clientWidth, t.object.matrix), oe(ce * (t.object.top - t.object.bottom) / t.object.zoom / ue.clientHeight, t.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), t.enablePan = !1);
      };
    }();
    function se(a) {
      t.object.isPerspectiveCamera ? h /= a : t.object.isOrthographicCamera ? (t.object.zoom = Math.max(t.minZoom, Math.min(t.maxZoom, t.object.zoom * a)), t.object.updateProjectionMatrix(), u = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), t.enableZoom = !1);
    }
    function $(a) {
      t.object.isPerspectiveCamera ? h *= a : t.object.isOrthographicCamera ? (t.object.zoom = Math.max(t.minZoom, Math.min(t.maxZoom, t.object.zoom / a)), t.object.updateProjectionMatrix(), u = !0) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), t.enableZoom = !1);
    }
    function ve(a) {
      R.set(a.clientX, a.clientY);
    }
    function V(a) {
      P.set(a.clientX, a.clientY);
    }
    function X(a) {
      p.set(a.clientX, a.clientY);
    }
    function re(a) {
      f.set(a.clientX, a.clientY), g.subVectors(f, R).multiplyScalar(t.rotateSpeed);
      const O = t.domElement;
      D(2 * Math.PI * g.x / O.clientHeight), W(2 * Math.PI * g.y / O.clientHeight), R.copy(f), t.update();
    }
    function ne(a) {
      m.set(a.clientX, a.clientY), S.subVectors(m, P), S.y > 0 ? se(F()) : S.y < 0 && $(F()), P.copy(m), t.update();
    }
    function Ce(a) {
      c.set(a.clientX, a.clientY), x.subVectors(c, p).multiplyScalar(t.panSpeed), ge(x.x, x.y), p.copy(c), t.update();
    }
    function Pe(a) {
      a.deltaY < 0 ? $(F()) : a.deltaY > 0 && se(F()), t.update();
    }
    function Ge(a) {
      let O = !1;
      switch (a.code) {
        case t.keys.UP:
          a.ctrlKey || a.metaKey || a.shiftKey ? W(2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(0, t.keyPanSpeed), O = !0;
          break;
        case t.keys.BOTTOM:
          a.ctrlKey || a.metaKey || a.shiftKey ? W(-2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(0, -t.keyPanSpeed), O = !0;
          break;
        case t.keys.LEFT:
          a.ctrlKey || a.metaKey || a.shiftKey ? D(2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(t.keyPanSpeed, 0), O = !0;
          break;
        case t.keys.RIGHT:
          a.ctrlKey || a.metaKey || a.shiftKey ? D(-2 * Math.PI * t.rotateSpeed / t.domElement.clientHeight) : ge(-t.keyPanSpeed, 0), O = !0;
          break;
      }
      O && (a.preventDefault(), t.update());
    }
    function De() {
      if (y.length === 1)
        R.set(y[0].pageX, y[0].pageY);
      else {
        const a = 0.5 * (y[0].pageX + y[1].pageX), O = 0.5 * (y[0].pageY + y[1].pageY);
        R.set(a, O);
      }
    }
    function Ye() {
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
    function We() {
      t.enableZoom && Ae(), t.enablePan && Ye();
    }
    function v() {
      t.enableZoom && Ae(), t.enableRotate && De();
    }
    function G(a) {
      if (y.length == 1)
        f.set(a.pageX, a.pageY);
      else {
        const J = be(a), ce = 0.5 * (a.pageX + J.x), ue = 0.5 * (a.pageY + J.y);
        f.set(ce, ue);
      }
      g.subVectors(f, R).multiplyScalar(t.rotateSpeed);
      const O = t.domElement;
      D(2 * Math.PI * g.x / O.clientHeight), W(2 * Math.PI * g.y / O.clientHeight), R.copy(f);
    }
    function w(a) {
      if (y.length === 1)
        c.set(a.pageX, a.pageY);
      else {
        const O = be(a), J = 0.5 * (a.pageX + O.x), ce = 0.5 * (a.pageY + O.y);
        c.set(J, ce);
      }
      x.subVectors(c, p).multiplyScalar(t.panSpeed), ge(x.x, x.y), p.copy(c);
    }
    function C(a) {
      const O = be(a), J = a.pageX - O.x, ce = a.pageY - O.y, ue = Math.sqrt(J * J + ce * ce);
      m.set(0, ue), S.set(0, Math.pow(m.y / P.y, t.zoomSpeed)), se(S.y), P.copy(m);
    }
    function j(a) {
      t.enableZoom && C(a), t.enablePan && w(a);
    }
    function I(a) {
      t.enableZoom && C(a), t.enableRotate && G(a);
    }
    function T(a) {
      t.enabled !== !1 && (y.length === 0 && (t.domElement.setPointerCapture(a.pointerId), t.domElement.addEventListener("pointermove", A), t.domElement.addEventListener("pointerup", H)), U(a), a.pointerType === "touch" ? fe(a) : te(a));
    }
    function A(a) {
      t.enabled !== !1 && (a.pointerType === "touch" ? k(a) : he(a));
    }
    function H(a) {
      Q(a), y.length === 0 && (t.domElement.releasePointerCapture(a.pointerId), t.domElement.removeEventListener("pointermove", A), t.domElement.removeEventListener("pointerup", H)), t.dispatchEvent(Qt), n = s.NONE;
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
        case Ze.DOLLY:
          if (t.enableZoom === !1)
            return;
          V(a), n = s.DOLLY;
          break;
        case Ze.ROTATE:
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
        case Ze.PAN:
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
          Ce(a);
          break;
      }
    }
    function z(a) {
      t.enabled === !1 || t.enableZoom === !1 || n !== s.NONE || (a.preventDefault(), t.dispatchEvent(_t), Pe(a), t.dispatchEvent(Qt));
    }
    function q(a) {
      t.enabled === !1 || t.enablePan === !1 || Ge(a);
    }
    function fe(a) {
      switch (K(a), y.length) {
        case 1:
          switch (t.touches.ONE) {
            case qe.ROTATE:
              if (t.enableRotate === !1)
                return;
              De(), n = s.TOUCH_ROTATE;
              break;
            case qe.PAN:
              if (t.enablePan === !1)
                return;
              Ye(), n = s.TOUCH_PAN;
              break;
            default:
              n = s.NONE;
          }
          break;
        case 2:
          switch (t.touches.TWO) {
            case qe.DOLLY_PAN:
              if (t.enableZoom === !1 && t.enablePan === !1)
                return;
              We(), n = s.TOUCH_DOLLY_PAN;
              break;
            case qe.DOLLY_ROTATE:
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
    function k(a) {
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
          j(a), t.update();
          break;
        case s.TOUCH_DOLLY_ROTATE:
          if (t.enableZoom === !1 && t.enableRotate === !1)
            return;
          I(a), t.update();
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
    function Q(a) {
      delete B[a.pointerId];
      for (let O = 0; O < y.length; O++)
        if (y[O].pointerId == a.pointerId) {
          y.splice(O, 1);
          return;
        }
    }
    function K(a) {
      let O = B[a.pointerId];
      O === void 0 && (O = new Z(), B[a.pointerId] = O), O.set(a.pageX, a.pageY);
    }
    function be(a) {
      const O = a.pointerId === y[0].pointerId ? y[1] : y[0];
      return B[O.pointerId];
    }
    t.domElement.addEventListener("contextmenu", M), t.domElement.addEventListener("pointerdown", T), t.domElement.addEventListener("pointercancel", H), t.domElement.addEventListener("wheel", z, { passive: !1 }), this.update();
  }
}
class fi extends Si {
  constructor(e) {
    super(e), this.type = $e;
  }
  // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html
  parse(e) {
    const o = function(m, S) {
      switch (m) {
        case 1:
          console.error("THREE.RGBELoader Read Error: " + (S || ""));
          break;
        case 2:
          console.error("THREE.RGBELoader Write Error: " + (S || ""));
          break;
        case 3:
          console.error("THREE.RGBELoader Bad File Format: " + (S || ""));
          break;
        default:
        case 4:
          console.error("THREE.RGBELoader: Error: " + (S || ""));
      }
      return -1;
    }, u = `
`, R = function(m, S, y) {
      S = S || 1024;
      let Y = m.pos, F = -1, D = 0, W = "", N = String.fromCharCode.apply(null, new Uint16Array(m.subarray(Y, Y + 128)));
      for (; 0 > (F = N.indexOf(u)) && D < S && Y < m.byteLength; )
        W += N, D += N.length, Y += 128, N += String.fromCharCode.apply(null, new Uint16Array(m.subarray(Y, Y + 128)));
      return -1 < F ? (y !== !1 && (m.pos += D + F + 1), W + N.slice(0, F)) : !1;
    }, f = function(m) {
      const S = /^#\?(\S+)/, y = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/, B = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/, Y = /^\s*FORMAT=(\S+)\s*$/, F = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/, D = {
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
      if (m.pos >= m.byteLength || !(W = R(m)))
        return o(1, "no header found");
      if (!(N = W.match(S)))
        return o(3, "bad initial token");
      for (D.valid |= 1, D.programtype = N[1], D.string += W + `
`; W = R(m), W !== !1; ) {
        if (D.string += W + `
`, W.charAt(0) === "#") {
          D.comments += W + `
`;
          continue;
        }
        if ((N = W.match(y)) && (D.gamma = parseFloat(N[1])), (N = W.match(B)) && (D.exposure = parseFloat(N[1])), (N = W.match(Y)) && (D.valid |= 2, D.format = N[1]), (N = W.match(F)) && (D.valid |= 4, D.height = parseInt(N[1], 10), D.width = parseInt(N[2], 10)), D.valid & 2 && D.valid & 4)
          break;
      }
      return D.valid & 2 ? D.valid & 4 ? D : o(3, "missing image size specifier") : o(3, "missing format specifier");
    }, g = function(m, S, y) {
      const B = S;
      if (
        // run length encoding is not allowed so read flat
        B < 8 || B > 32767 || // this file is not run length encoded
        m[0] !== 2 || m[1] !== 2 || m[2] & 128
      )
        return new Uint8Array(m);
      if (B !== (m[2] << 8 | m[3]))
        return o(3, "wrong scanline width");
      const Y = new Uint8Array(4 * S * y);
      if (!Y.length)
        return o(4, "unable to allocate buffer space");
      let F = 0, D = 0;
      const W = 4 * B, N = new Uint8Array(4), oe = new Uint8Array(W);
      let ge = y;
      for (; ge > 0 && D < m.byteLength; ) {
        if (D + 4 > m.byteLength)
          return o(1);
        if (N[0] = m[D++], N[1] = m[D++], N[2] = m[D++], N[3] = m[D++], N[0] != 2 || N[1] != 2 || (N[2] << 8 | N[3]) != B)
          return o(3, "bad rgbe scanline format");
        let se = 0, $;
        for (; se < W && D < m.byteLength; ) {
          $ = m[D++];
          const V = $ > 128;
          if (V && ($ -= 128), $ === 0 || se + $ > W)
            return o(3, "bad scanline data");
          if (V) {
            const X = m[D++];
            for (let re = 0; re < $; re++)
              oe[se++] = X;
          } else
            oe.set(m.subarray(D, D + $), se), se += $, D += $;
        }
        const ve = B;
        for (let V = 0; V < ve; V++) {
          let X = 0;
          Y[F] = oe[V + X], X += B, Y[F + 1] = oe[V + X], X += B, Y[F + 2] = oe[V + X], X += B, Y[F + 3] = oe[V + X], F += 4;
        }
        ge--;
      }
      return Y;
    }, p = function(m, S, y, B) {
      const Y = m[S + 3], F = Math.pow(2, Y - 128) / 255;
      y[B + 0] = m[S + 0] * F, y[B + 1] = m[S + 1] * F, y[B + 2] = m[S + 2] * F, y[B + 3] = 1;
    }, c = function(m, S, y, B) {
      const Y = m[S + 3], F = Math.pow(2, Y - 128) / 255;
      y[B + 0] = pt.toHalfFloat(Math.min(m[S + 0] * F, 65504)), y[B + 1] = pt.toHalfFloat(Math.min(m[S + 1] * F, 65504)), y[B + 2] = pt.toHalfFloat(Math.min(m[S + 2] * F, 65504)), y[B + 3] = pt.toHalfFloat(1);
    }, x = new Uint8Array(e);
    x.pos = 0;
    const P = f(x);
    if (P !== -1) {
      const m = P.width, S = P.height, y = g(x.subarray(x.pos), m, S);
      if (y !== -1) {
        let B, Y, F;
        switch (this.type) {
          case yt:
            F = y.length / 4;
            const D = new Float32Array(F * 4);
            for (let N = 0; N < F; N++)
              p(y, N * 4, D, N * 4);
            B = D, Y = yt;
            break;
          case $e:
            F = y.length / 4;
            const W = new Uint16Array(F * 4);
            for (let N = 0; N < F; N++)
              c(y, N * 4, W, N * 4);
            B = W, Y = $e;
            break;
          default:
            console.error("THREE.RGBELoader: unsupported type: ", this.type);
            break;
        }
        return {
          width: m,
          height: S,
          data: B,
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
        case $e:
          r.colorSpace = Pt, r.minFilter = Je, r.magFilter = Je, r.generateMipmaps = !1, r.flipY = !0;
          break;
      }
      i && i(r, o);
    }
    return super.load(e, n, t, s);
  }
}
class $i extends wi {
  constructor(e) {
    super(e), this.hdrLoader = new fi(), this.type = $e;
  }
  load(e, i, t, s) {
    const n = new Mi();
    switch (n.type = this.type, n.type) {
      case yt:
        n.colorSpace = Pt, n.minFilter = Je, n.magFilter = Je, n.generateMipmaps = !1;
        break;
      case $e:
        n.colorSpace = Pt, n.minFilter = Je, n.magFilter = Je, n.generateMipmaps = !1;
        break;
    }
    const r = this;
    let o = 0;
    function l(h, d, u, R) {
      new _i(r.manager).setPath(r.path).setResponseType("arraybuffer").setWithCredentials(r.withCredentials).load(e[h], function(f) {
        o++;
        const g = r.hdrLoader.parse(f);
        if (g) {
          if (g.data !== void 0) {
            const p = new Ti(g.data, g.width, g.height);
            p.type = n.type, p.colorSpace = n.colorSpace, p.format = n.format, p.minFilter = n.minFilter, p.magFilter = n.magFilter, p.generateMipmaps = n.generateMipmaps, n.images[h] = p;
          }
          o === 6 && (n.needsUpdate = !0, d && d(n));
        }
      }, u, R);
    }
    for (let h = 0; h < e.length; h++)
      l(h, i, t, s);
    return n;
  }
  setDataType(e) {
    return this.type = e, this.hdrLoader.setDataType(e), this;
  }
}
class Mt extends E {
  constructor() {
    const e = Mt.SkyShader, i = new _e({
      name: "SkyShader",
      fragmentShader: e.fragmentShader,
      vertexShader: e.vertexShader,
      uniforms: dt.clone(e.uniforms),
      side: Ei,
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
class Ji {
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
      ), h = new L.Raycaster();
      h.setFromCamera(n, this.threeCamera);
      let d = h.intersectObjects(l, !0);
      const u = ["Line", "Line2", "Line3"], R = ["可视域视锥体"], f = (g) => !(R.indexOf(g.name) !== -1 || s.indexOf(g.name) !== -1);
      return d = d.filter(
        (g) => u.indexOf(g.object.type) === -1 && g.object.visible === !0 && f(g.object)
      ), d;
    }, this.changeCameraMode = (i) => {
      var t;
      if (i !== this.threeCamera.type) {
        if (this.removeCameraHelper(), this.threeCamera && (this.threeCamera = null, (t = this.threeOrbitControl) == null || t.dispose(), this.threeOrbitControl = null), i === "PerspectiveCamera") {
          const s = new L.PerspectiveCamera();
          s.position.set(2, 2, 2), this.threeCamera = s, this.threeOrbitControl = new Dt(this.threeCamera, this.threeContainer);
        } else if (i === "OrthographicCamera") {
          const s = new L.OrthographicCamera();
          s.position.set(0, 4, 0), this.threeCamera = s, this.threeOrbitControl = new Dt(this.threeCamera, this.threeContainer);
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
      ji.useTweenAnimate(
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
class es {
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
const Yt = new es(), Xt = "SSModuleUpdateScribe";
class ts {
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
      e.innerText = "调", e.className = Fe.menuicon, this._ssThreeObject.threeContainer.parentElement.append(e), ["relative", "absolute"].indexOf(
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
      e.className = Fe.drawer, this._ssThreeObject.threeContainer.parentElement.append(e);
      const i = document.createElement("div");
      i.className = Fe.drawerheader, e.append(i);
      const t = document.createElement("span");
      t.className = Fe.drawerheadertitle, t.innerText = "场景调试", i.append(t);
      const s = document.createElement("div");
      s.innerText = "X", s.className = Fe.drawerheaderclose, i.append(s), s.onpointerdown = () => {
        e.style.right = `-${e.offsetWidth}px`;
      };
      const n = document.createElement("div");
      n.className = Fe.contentview, e.append(n), this._menuContainer = n;
      const r = document.createElement("div");
      r.className = Fe.drawerfooter, e.append(r);
      const o = document.createElement("div");
      o.className = Fe.drawerfooterbtn, o.innerText = "导出配置", r.append(o), o.onclick = () => {
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
    }), qi.exportJson(e, "ssthreejs.setting.json");
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
    this._addDrawIcon(), this._addDrawerView(), this._debugGui === null && (this._debugGui = new Zi({
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
      const h = n[l], d = e[h];
      if (d instanceof L.Color) {
        i.addColor(
          {
            [h]: d.getRGB({})
          },
          h
        ).onChange((f) => {
          e[h] = f, t == null || t({
            key: h,
            value: f,
            data: e
          });
        });
        continue;
      }
      if (d instanceof Array && d.length > 0) {
        const f = i.addFolder(h);
        d.forEach((g, p) => {
          if (g instanceof Object) {
            const c = f.addFolder(p + 1);
            this._addDebugForObject(g, c, t, s);
          }
        });
        continue;
      }
      if (d instanceof Object && !(d instanceof Function)) {
        const f = i.addFolder(h);
        this._addDebugForObject(d, f, t, s);
        continue;
      }
      const u = s[h];
      if (u instanceof Array) {
        (r = i.add(e, h, u)) == null || r.onChange((f) => {
          e[h] = f, t == null || t({
            key: h,
            value: f,
            data: e
          });
        });
        continue;
      }
      const R = s[h] || {};
      (o = i.add(e, h, R.min, R.max, R.step)) == null || o.onChange((f) => {
        e[h] = f, t == null || t({
          key: h,
          value: f,
          data: e
        });
      });
    }
  }
}
class pi {
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
const Ve = new Ci(), Se = new _(), Ne = new _(), ae = new Me(), Zt = {
  X: new _(1, 0, 0),
  Y: new _(0, 1, 0),
  Z: new _(0, 0, 1)
}, Tt = { type: "change" }, qt = { type: "mouseDown" }, Kt = { type: "mouseUp", mode: null }, $t = { type: "objectChange" };
class is extends ut {
  constructor(e, i) {
    super(), i === void 0 && (console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.'), i = document), this.isTransformControls = !0, this.visible = !1, this.domElement = i, this.domElement.style.touchAction = "none";
    const t = new ls();
    this._gizmo = t, this.add(t);
    const s = new hs();
    this._plane = s, this.add(s);
    const n = this;
    function r(P, m) {
      let S = m;
      Object.defineProperty(n, P, {
        get: function() {
          return S !== void 0 ? S : m;
        },
        set: function(y) {
          S !== y && (S = y, s[P] = y, t[P] = y, n.dispatchEvent({ type: P + "-changed", value: y }), n.dispatchEvent(Tt));
        }
      }), n[P] = m, s[P] = m, t[P] = m;
    }
    r("camera", e), r("object", void 0), r("enabled", !0), r("axis", null), r("mode", "translate"), r("translationSnap", null), r("rotationSnap", null), r("scaleSnap", null), r("space", "world"), r("size", 1), r("dragging", !1), r("showX", !0), r("showY", !0), r("showZ", !0);
    const o = new _(), l = new _(), h = new Me(), d = new Me(), u = new _(), R = new Me(), f = new _(), g = new _(), p = new _(), c = 0, x = new _();
    r("worldPosition", o), r("worldPositionStart", l), r("worldQuaternion", h), r("worldQuaternionStart", d), r("cameraPosition", u), r("cameraQuaternion", R), r("pointStart", f), r("pointEnd", g), r("rotationAxis", p), r("rotationAngle", c), r("eye", x), this._offset = new _(), this._startNorm = new _(), this._endNorm = new _(), this._cameraScale = new _(), this._parentPosition = new _(), this._parentQuaternion = new Me(), this._parentQuaternionInv = new Me(), this._parentScale = new _(), this._worldScaleStart = new _(), this._worldQuaternionInv = new Me(), this._worldScale = new _(), this._positionStart = new _(), this._quaternionStart = new Me(), this._scaleStart = new _(), this._getPointer = ss.bind(this), this._onPointerDown = ns.bind(this), this._onPointerHover = rs.bind(this), this._onPointerMove = os.bind(this), this._onPointerUp = as.bind(this), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointermove", this._onPointerHover), this.domElement.addEventListener("pointerup", this._onPointerUp);
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
        this._offset.copy(this.pointEnd).sub(this.pointStart), n === "local" && i !== "XYZ" && this._offset.applyQuaternion(this._worldQuaternionInv), i.indexOf("X") === -1 && (this._offset.x = 0), i.indexOf("Y") === -1 && (this._offset.y = 0), i.indexOf("Z") === -1 && (this._offset.z = 0), n === "local" && i !== "XYZ" ? this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale) : this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale), s.position.copy(this._offset).add(this._positionStart), this.translationSnap && (n === "local" && (s.position.applyQuaternion(ae.copy(this._quaternionStart).invert()), i.search("X") !== -1 && (s.position.x = Math.round(s.position.x / this.translationSnap) * this.translationSnap), i.search("Y") !== -1 && (s.position.y = Math.round(s.position.y / this.translationSnap) * this.translationSnap), i.search("Z") !== -1 && (s.position.z = Math.round(s.position.z / this.translationSnap) * this.translationSnap), s.position.applyQuaternion(this._quaternionStart)), n === "world" && (s.parent && s.position.add(Se.setFromMatrixPosition(s.parent.matrixWorld)), i.search("X") !== -1 && (s.position.x = Math.round(s.position.x / this.translationSnap) * this.translationSnap), i.search("Y") !== -1 && (s.position.y = Math.round(s.position.y / this.translationSnap) * this.translationSnap), i.search("Z") !== -1 && (s.position.z = Math.round(s.position.z / this.translationSnap) * this.translationSnap), s.parent && s.position.sub(Se.setFromMatrixPosition(s.parent.matrixWorld))));
      else if (t === "scale") {
        if (i.search("XYZ") !== -1) {
          let o = this.pointEnd.length() / this.pointStart.length();
          this.pointEnd.dot(this.pointStart) < 0 && (o *= -1), Ne.set(o, o, o);
        } else
          Se.copy(this.pointStart), Ne.copy(this.pointEnd), Se.applyQuaternion(this._worldQuaternionInv), Ne.applyQuaternion(this._worldQuaternionInv), Ne.divide(Se), i.search("X") === -1 && (Ne.x = 1), i.search("Y") === -1 && (Ne.y = 1), i.search("Z") === -1 && (Ne.z = 1);
        s.scale.copy(this._scaleStart).multiply(Ne), this.scaleSnap && (i.search("X") !== -1 && (s.scale.x = Math.round(s.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap), i.search("Y") !== -1 && (s.scale.y = Math.round(s.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap), i.search("Z") !== -1 && (s.scale.z = Math.round(s.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap));
      } else if (t === "rotate") {
        this._offset.copy(this.pointEnd).sub(this.pointStart);
        const o = 20 / this.worldPosition.distanceTo(Se.setFromMatrixPosition(this.camera.matrixWorld));
        i === "E" ? (this.rotationAxis.copy(this.eye), this.rotationAngle = this.pointEnd.angleTo(this.pointStart), this._startNorm.copy(this.pointStart).normalize(), this._endNorm.copy(this.pointEnd).normalize(), this.rotationAngle *= this._endNorm.cross(this._startNorm).dot(this.eye) < 0 ? 1 : -1) : i === "XYZE" ? (this.rotationAxis.copy(this._offset).cross(this.eye).normalize(), this.rotationAngle = this._offset.dot(Se.copy(this.rotationAxis).cross(this.eye)) * o) : (i === "X" || i === "Y" || i === "Z") && (this.rotationAxis.copy(Zt[i]), Se.copy(Zt[i]), n === "local" && Se.applyQuaternion(this.worldQuaternion), this.rotationAngle = this._offset.dot(Se.cross(this.eye).normalize()) * o), this.rotationSnap && (this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap), n === "local" && i !== "E" && i !== "XYZE" ? (s.quaternion.copy(this._quaternionStart), s.quaternion.multiply(ae.setFromAxisAngle(this.rotationAxis, this.rotationAngle)).normalize()) : (this.rotationAxis.applyQuaternion(this._parentQuaternionInv), s.quaternion.copy(ae.setFromAxisAngle(this.rotationAxis, this.rotationAngle)), s.quaternion.multiply(this._quaternionStart).normalize());
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
function ss(b) {
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
function rs(b) {
  if (this.enabled)
    switch (b.pointerType) {
      case "mouse":
      case "pen":
        this.pointerHover(this._getPointer(b));
        break;
    }
}
function ns(b) {
  this.enabled && (document.pointerLockElement || this.domElement.setPointerCapture(b.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.pointerHover(this._getPointer(b)), this.pointerDown(this._getPointer(b)));
}
function os(b) {
  this.enabled && this.pointerMove(this._getPointer(b));
}
function as(b) {
  this.enabled && (this.domElement.releasePointerCapture(b.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.pointerUp(this._getPointer(b)));
}
function Et(b, e, i) {
  const t = e.intersectObject(b, !0);
  for (let s = 0; s < t.length; s++)
    if (t[s].object.visible || i)
      return t[s];
  return !1;
}
const gt = new Pi(), ie = new _(0, 1, 0), Jt = new _(0, 0, 0), ei = new Te(), vt = new Me(), xt = new Me(), Oe = new _(), ti = new Te(), ht = new _(1, 0, 0), Qe = new _(0, 1, 0), ct = new _(0, 0, 1), bt = new _(), ot = new _(), at = new _();
class ls extends ut {
  constructor() {
    super(), this.isTransformControlsGizmo = !0, this.type = "TransformControlsGizmo";
    const e = new Lt({
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      toneMapped: !1,
      transparent: !0
    }), i = new Oi({
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
    const h = e.clone();
    h.color.setHex(65280), h.opacity = 0.5;
    const d = e.clone();
    d.color.setHex(255), d.opacity = 0.5;
    const u = e.clone();
    u.opacity = 0.25;
    const R = e.clone();
    R.color.setHex(16776960), R.opacity = 0.25, e.clone().color.setHex(16776960);
    const g = e.clone();
    g.color.setHex(7895160);
    const p = new xe(0, 0.04, 0.1, 12);
    p.translate(0, 0.05, 0);
    const c = new ye(0.08, 0.08, 0.08);
    c.translate(0, 0.04, 0);
    const x = new Ot();
    x.setAttribute("position", new St([0, 0, 0, 1, 0, 0], 3));
    const P = new xe(75e-4, 75e-4, 0.5, 3);
    P.translate(0, 0.25, 0);
    function m($, ve) {
      const V = new rt($, 75e-4, 3, 64, ve * Math.PI * 2);
      return V.rotateY(Math.PI / 2), V.rotateX(Math.PI / 2), V;
    }
    function S() {
      const $ = new Ot();
      return $.setAttribute("position", new St([0, 0, 0, 1, 1, 1], 3)), $;
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
        [new E(new mt(0.1, 0), u.clone()), [0, 0, 0]]
      ],
      XY: [
        [new E(new ye(0.15, 0.15, 0.01), d.clone()), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.15, 0.15, 0.01), l.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.15, 0.15, 0.01), h.clone()), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ]
    }, B = {
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
        [new je(S(), s), null, null, null, "helper"]
      ],
      X: [
        [new je(x, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new je(x, s.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new je(x, s.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    }, F = {
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
        [new E(m(0.75, 1), R), null, [0, Math.PI / 2, 0]]
      ]
    }, D = {
      AXIS: [
        [new je(x, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ]
    }, W = {
      XYZE: [
        [new E(new Ri(0.25, 10, 8), t)]
      ],
      X: [
        [new E(new rt(0.5, 0.1, 4, 24), t), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]
      ],
      Y: [
        [new E(new rt(0.5, 0.1, 4, 24), t), [0, 0, 0], [Math.PI / 2, 0, 0]]
      ],
      Z: [
        [new E(new rt(0.5, 0.1, 4, 24), t), [0, 0, 0], [0, 0, -Math.PI / 2]]
      ],
      E: [
        [new E(new rt(0.75, 0.1, 2, 24), t)]
      ]
    }, N = {
      X: [
        [new E(c, n), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(P, n), [0, 0, 0], [0, 0, -Math.PI / 2]],
        [new E(c, n), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
      ],
      Y: [
        [new E(c, r), [0, 0.5, 0]],
        [new E(P, r)],
        [new E(c, r), [0, -0.5, 0], [0, 0, Math.PI]]
      ],
      Z: [
        [new E(c, o), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
        [new E(P, o), [0, 0, 0], [Math.PI / 2, 0, 0]],
        [new E(c, o), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
      ],
      XY: [
        [new E(new ye(0.15, 0.15, 0.01), d), [0.15, 0.15, 0]]
      ],
      YZ: [
        [new E(new ye(0.15, 0.15, 0.01), l), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
      ],
      XZ: [
        [new E(new ye(0.15, 0.15, 0.01), h), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
      ],
      XYZ: [
        [new E(new ye(0.1, 0.1, 0.1), u.clone())]
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
        [new je(x, s.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], "helper"]
      ],
      Y: [
        [new je(x, s.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], "helper"]
      ],
      Z: [
        [new je(x, s.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], "helper"]
      ]
    };
    function se($) {
      const ve = new ut();
      for (const V in $)
        for (let X = $[V].length; X--; ) {
          const re = $[V][X][0].clone(), ne = $[V][X][1], Ce = $[V][X][2], Pe = $[V][X][3], Ge = $[V][X][4];
          re.name = V, re.tag = Ge, ne && re.position.set(ne[0], ne[1], ne[2]), Ce && re.rotation.set(Ce[0], Ce[1], Ce[2]), Pe && re.scale.set(Pe[0], Pe[1], Pe[2]), re.updateMatrix();
          const De = re.geometry.clone();
          De.applyMatrix4(re.matrix), re.geometry = De, re.renderOrder = 1 / 0, re.position.set(0, 0, 0), re.rotation.set(0, 0, 0), re.scale.set(1, 1, 1), ve.add(re);
        }
      return ve;
    }
    this.gizmo = {}, this.picker = {}, this.helper = {}, this.add(this.gizmo.translate = se(y)), this.add(this.gizmo.rotate = se(F)), this.add(this.gizmo.scale = se(N)), this.add(this.picker.translate = se(B)), this.add(this.picker.rotate = se(W)), this.add(this.picker.scale = se(oe)), this.add(this.helper.translate = se(Y)), this.add(this.helper.rotate = se(D)), this.add(this.helper.scale = se(ge)), this.picker.translate.visible = !1, this.picker.rotate.visible = !1, this.picker.scale.visible = !1;
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
        r.visible = !1, r.name === "AXIS" ? (r.visible = !!this.axis, this.axis === "X" && (ae.setFromEuler(gt.set(0, 0, 0)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "Y" && (ae.setFromEuler(gt.set(0, 0, Math.PI / 2)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(Qe).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "Z" && (ae.setFromEuler(gt.set(0, Math.PI / 2, 0)), r.quaternion.copy(t).multiply(ae), Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) > 0.9 && (r.visible = !1)), this.axis === "XYZE" && (ae.setFromEuler(gt.set(0, Math.PI / 2, 0)), ie.copy(this.rotationAxis), r.quaternion.setFromRotationMatrix(ei.lookAt(Jt, ie, Qe)), r.quaternion.multiply(ae), r.visible = this.dragging), this.axis === "E" && (r.visible = !1)) : r.name === "START" ? (r.position.copy(this.worldPositionStart), r.visible = this.dragging) : r.name === "END" ? (r.position.copy(this.worldPosition), r.visible = this.dragging) : r.name === "DELTA" ? (r.position.copy(this.worldPositionStart), r.quaternion.copy(this.worldQuaternionStart), Se.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1), Se.applyQuaternion(this.worldQuaternionStart.clone().invert()), r.scale.copy(Se), r.visible = this.dragging) : (r.quaternion.copy(t), this.dragging ? r.position.copy(this.worldPositionStart) : r.position.copy(this.worldPosition), this.axis && (r.visible = this.axis.search(r.name) !== -1));
        continue;
      }
      r.quaternion.copy(t), this.mode === "translate" || this.mode === "scale" ? (r.name === "X" && Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "Y" && Math.abs(ie.copy(Qe).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "Z" && Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) > 0.99 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "XY" && Math.abs(ie.copy(ct).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "YZ" && Math.abs(ie.copy(ht).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1), r.name === "XZ" && Math.abs(ie.copy(Qe).applyQuaternion(t).dot(this.eye)) < 0.2 && (r.scale.set(1e-10, 1e-10, 1e-10), r.visible = !1)) : this.mode === "rotate" && (vt.copy(t), ie.copy(this.eye).applyQuaternion(ae.copy(t).invert()), r.name.search("E") !== -1 && r.quaternion.setFromRotationMatrix(ei.lookAt(this.eye, Jt, Qe)), r.name === "X" && (ae.setFromAxisAngle(ht, Math.atan2(-ie.y, ie.z)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae)), r.name === "Y" && (ae.setFromAxisAngle(Qe, Math.atan2(ie.x, ie.z)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae)), r.name === "Z" && (ae.setFromAxisAngle(ct, Math.atan2(ie.y, ie.x)), ae.multiplyQuaternions(vt, ae), r.quaternion.copy(ae))), r.visible = r.visible && (r.name.indexOf("X") === -1 || this.showX), r.visible = r.visible && (r.name.indexOf("Y") === -1 || this.showY), r.visible = r.visible && (r.name.indexOf("Z") === -1 || this.showZ), r.visible = r.visible && (r.name.indexOf("E") === -1 || this.showX && this.showY && this.showZ), r.material._color = r.material._color || r.material.color.clone(), r.material._opacity = r.material._opacity || r.material.opacity, r.material.color.copy(r.material._color), r.material.opacity = r.material._opacity, this.enabled && this.axis && (r.name === this.axis || this.axis.split("").some(function(l) {
        return r.name === l;
      })) && (r.material.color.setHex(16776960), r.material.opacity = 1);
    }
    super.updateMatrixWorld(e);
  }
}
class hs extends E {
  constructor() {
    super(
      new Di(1e5, 1e5, 2, 2),
      new Lt({ visible: !1, wireframe: !0, side: wt, transparent: !0, opacity: 0.1, toneMapped: !1 })
    ), this.isTransformControlsPlane = !0, this.type = "TransformControlsPlane";
  }
  updateMatrixWorld(e) {
    let i = this.space;
    switch (this.position.copy(this.worldPosition), this.mode === "scale" && (i = "local"), bt.copy(ht).applyQuaternion(i === "local" ? this.worldQuaternion : xt), ot.copy(Qe).applyQuaternion(i === "local" ? this.worldQuaternion : xt), at.copy(ct).applyQuaternion(i === "local" ? this.worldQuaternion : xt), ie.copy(ot), this.mode) {
      case "translate":
      case "scale":
        switch (this.axis) {
          case "X":
            ie.copy(this.eye).cross(bt), Oe.copy(bt).cross(ie);
            break;
          case "Y":
            ie.copy(this.eye).cross(ot), Oe.copy(ot).cross(ie);
            break;
          case "Z":
            ie.copy(this.eye).cross(at), Oe.copy(at).cross(ie);
            break;
          case "XY":
            Oe.copy(at);
            break;
          case "YZ":
            Oe.copy(bt);
            break;
          case "XZ":
            ie.copy(at), Oe.copy(ot);
            break;
          case "XYZ":
          case "E":
            Oe.set(0, 0, 0);
            break;
        }
        break;
      case "rotate":
      default:
        Oe.set(0, 0, 0);
    }
    Oe.length() === 0 ? this.quaternion.copy(this.cameraQuaternion) : (ti.lookAt(Se.set(0, 0, 0), Oe, ie), this.quaternion.setFromRotationMatrix(ti)), super.updateMatrixWorld(e);
  }
}
class cs {
  /**
   * 构造函数
   * @param ssThreeObject 绑定的物体
   * @param callBack 回调事件
   */
  constructor(e, i) {
    this.onControlChange = null, this._ssThreeObject = null, this._control = null, this._event = null, this._boxHeloper = null, this.focus = (t) => {
      const s = this._ssThreeObject.threeCamera;
      let n;
      const r = new L.Box3(), o = new L.Vector3(), l = new L.Sphere(), h = new L.Vector3();
      r.setFromObject(t), r.isEmpty() === !1 ? (r.getCenter(o), n = r.getBoundingSphere(l).radius) : (o.setFromMatrixPosition(t.matrixWorld), n = 0.1), h.set(0, 0, 1), h.applyQuaternion(s.quaternion), h.multiplyScalar(n * 2), s.position.copy(o).add(h), this._ssThreeObject.threeOrbitControl.target.copy(o), this._ssThreeObject.threeOrbitControl.update();
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
    this._control || (this._control = new is(
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
    }), this._event = new Rt(this._ssThreeObject.threeContainer), this._event.addEventListener(Rt.SSEventType.KEYDOWN, (i) => {
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
class it {
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
const ds = new Ai(-1, 1, 1, -1, 0, 1), It = new Ot();
It.setAttribute("position", new St([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
It.setAttribute("uv", new St([0, 2, 0, 0, 2, 0], 2));
class zt {
  constructor(e) {
    this._mesh = new E(It, e);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(e) {
    e.render(this._mesh, ds);
  }
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
}
class At extends it {
  constructor(e, i) {
    super(), this.textureID = i !== void 0 ? i : "tDiffuse", e instanceof _e ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = dt.clone(e.uniforms), this.material = new _e({
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
class ii extends it {
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
class us extends it {
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
      this._width = t.width, this._height = t.height, i = new Ee(this._width * this._pixelRatio, this._height * this._pixelRatio), i.texture.name = "EffectComposer.rt1";
    } else
      this._width = i.width, this._height = i.height;
    this.renderTarget1 = i, this.renderTarget2 = i.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new At(Bt), this.clock = new Li();
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
        ii !== void 0 && (r instanceof ii ? t = !0 : r instanceof us && (t = !1));
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
class fs extends it {
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
const ps = {
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
class tt extends it {
  constructor(e, i, t, s) {
    super(), this.strength = i !== void 0 ? i : 1, this.radius = t, this.threshold = s, this.resolution = e !== void 0 ? new Z(e.x, e.y) : new Z(256, 256), this.clearColor = new me(0, 0, 0), this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let n = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new Ee(n, r), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let u = 0; u < this.nMips; u++) {
      const R = new Ee(n, r);
      R.texture.name = "UnrealBloomPass.h" + u, R.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(R);
      const f = new Ee(n, r);
      f.texture.name = "UnrealBloomPass.v" + u, f.texture.generateMipmaps = !1, this.renderTargetsVertical.push(f), n = Math.round(n / 2), r = Math.round(r / 2);
    }
    const o = ps;
    this.highPassUniforms = dt.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = s, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new _e({
      uniforms: this.highPassUniforms,
      vertexShader: o.vertexShader,
      fragmentShader: o.fragmentShader,
      defines: {}
    }), this.separableBlurMaterials = [];
    const l = [3, 5, 7, 9, 11];
    n = Math.round(this.resolution.x / 2), r = Math.round(this.resolution.y / 2);
    for (let u = 0; u < this.nMips; u++)
      this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])), this.separableBlurMaterials[u].uniforms.texSize.value = new Z(n, r), n = Math.round(n / 2), r = Math.round(r / 2);
    this.compositeMaterial = this.getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = i, this.compositeMaterial.uniforms.bloomRadius.value = 0.1, this.compositeMaterial.needsUpdate = !0;
    const h = [1, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms.bloomFactors.value = h, this.bloomTintColors = [new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1), new _(1, 1, 1)], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
    const d = Bt;
    this.copyUniforms = dt.clone(d.uniforms), this.copyUniforms.opacity.value = 1, this.materialCopy = new _e({
      uniforms: this.copyUniforms,
      vertexShader: d.vertexShader,
      fragmentShader: d.fragmentShader,
      blending: ci,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new me(), this.oldClearAlpha = 1, this.basic = new Lt(), this.fsQuad = new zt(null);
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
      this.fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = tt.BlurDirectionX, e.setRenderTarget(this.renderTargetsHorizontal[l]), e.clear(), this.fsQuad.render(e), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = tt.BlurDirectionY, e.setRenderTarget(this.renderTargetsVertical[l]), e.clear(), this.fsQuad.render(e), o = this.renderTargetsVertical[l];
    this.fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, e.setRenderTarget(this.renderTargetsHorizontal[0]), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, n && e.state.buffers.stencil.setTest(!0), this.renderToScreen ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (e.setRenderTarget(t), this.fsQuad.render(e)), e.setClearColor(this._oldClearColor, this.oldClearAlpha), e.autoClear = r;
  }
  getSeperableBlurMaterial(e) {
    return new _e({
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
    return new _e({
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
tt.BlurDirectionX = new Z(1, 0);
tt.BlurDirectionY = new Z(0, 1);
class Ue extends it {
  constructor(e, i, t, s) {
    super(), this.renderScene = i, this.renderCamera = t, this.selectedObjects = s !== void 0 ? s : [], this.visibleEdgeColor = new me(1, 1, 1), this.hiddenEdgeColor = new me(0.1, 0.04, 0.02), this.edgeGlow = 0, this.usePatternTexture = !1, this.edgeThickness = 1, this.edgeStrength = 3, this.downSampleRatio = 2, this.pulsePeriod = 0, this._visibilityCache = /* @__PURE__ */ new Map(), this.resolution = e !== void 0 ? new Z(e.x, e.y) : new Z(256, 256);
    const n = Math.round(this.resolution.x / this.downSampleRatio), r = Math.round(this.resolution.y / this.downSampleRatio);
    this.renderTargetMaskBuffer = new Ee(this.resolution.x, this.resolution.y), this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask", this.renderTargetMaskBuffer.texture.generateMipmaps = !1, this.depthMaterial = new Bi(), this.depthMaterial.side = wt, this.depthMaterial.depthPacking = Ii, this.depthMaterial.blending = Nt, this.prepareMaskMaterial = this.getPrepareMaskMaterial(), this.prepareMaskMaterial.side = wt, this.prepareMaskMaterial.fragmentShader = d(this.prepareMaskMaterial.fragmentShader, this.renderCamera), this.renderTargetDepthBuffer = new Ee(this.resolution.x, this.resolution.y), this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth", this.renderTargetDepthBuffer.texture.generateMipmaps = !1, this.renderTargetMaskDownSampleBuffer = new Ee(n, r), this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample", this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = !1, this.renderTargetBlurBuffer1 = new Ee(n, r), this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1", this.renderTargetBlurBuffer1.texture.generateMipmaps = !1, this.renderTargetBlurBuffer2 = new Ee(Math.round(n / 2), Math.round(r / 2)), this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2", this.renderTargetBlurBuffer2.texture.generateMipmaps = !1, this.edgeDetectionMaterial = this.getEdgeDetectionMaterial(), this.renderTargetEdgeBuffer1 = new Ee(n, r), this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1", this.renderTargetEdgeBuffer1.texture.generateMipmaps = !1, this.renderTargetEdgeBuffer2 = new Ee(Math.round(n / 2), Math.round(r / 2)), this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2", this.renderTargetEdgeBuffer2.texture.generateMipmaps = !1;
    const o = 4, l = 4;
    this.separableBlurMaterial1 = this.getSeperableBlurMaterial(o), this.separableBlurMaterial1.uniforms.texSize.value.set(n, r), this.separableBlurMaterial1.uniforms.kernelRadius.value = 1, this.separableBlurMaterial2 = this.getSeperableBlurMaterial(l), this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(n / 2), Math.round(r / 2)), this.separableBlurMaterial2.uniforms.kernelRadius.value = l, this.overlayMaterial = this.getOverlayMaterial();
    const h = Bt;
    this.copyUniforms = dt.clone(h.uniforms), this.copyUniforms.opacity.value = 1, this.materialCopy = new _e({
      uniforms: this.copyUniforms,
      vertexShader: h.vertexShader,
      fragmentShader: h.fragmentShader,
      blending: Nt,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new me(), this.oldClearAlpha = 1, this.fsQuad = new zt(null), this.tempPulseColor1 = new me(), this.tempPulseColor2 = new me(), this.textureMatrix = new Te();
    function d(u, R) {
      const f = R.isPerspectiveCamera ? "perspective" : "orthographic";
      return u.replace(/DEPTH_TO_VIEW_Z/g, f + "DepthToViewZ");
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
      this.fsQuad.material = this.edgeDetectionMaterial, this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture, this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height), this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1, this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2, e.setRenderTarget(this.renderTargetEdgeBuffer1), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.separableBlurMaterial1, this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = Ue.BlurDirectionX, this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness, e.setRenderTarget(this.renderTargetBlurBuffer1), e.clear(), this.fsQuad.render(e), this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = Ue.BlurDirectionY, e.setRenderTarget(this.renderTargetEdgeBuffer1), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.separableBlurMaterial2, this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial2.uniforms.direction.value = Ue.BlurDirectionX, e.setRenderTarget(this.renderTargetBlurBuffer2), e.clear(), this.fsQuad.render(e), this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture, this.separableBlurMaterial2.uniforms.direction.value = Ue.BlurDirectionY, e.setRenderTarget(this.renderTargetEdgeBuffer2), e.clear(), this.fsQuad.render(e), this.fsQuad.material = this.overlayMaterial, this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture, this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture, this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture, this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture, this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength, this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow, this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture, n && e.state.buffers.stencil.setTest(!0), e.setRenderTarget(t), this.fsQuad.render(e), e.setClearColor(this._oldClearColor, this.oldClearAlpha), e.autoClear = r;
    }
    this.renderToScreen && (this.fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = t.texture, e.setRenderTarget(null), this.fsQuad.render(e));
  }
  getPrepareMaskMaterial() {
    return new _e({
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
    return new _e({
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
    return new _e({
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
    return new _e({
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
      blending: ci,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    });
  }
}
Ue.BlurDirectionX = new Z(1, 0);
Ue.BlurDirectionY = new Z(0, 1);
const ms = {
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
}, gs = {
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
var pe, Ie, ze, ke;
class vs {
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
    st(this, pe, null);
    /**
     * @type {RenderPass}
     */
    st(this, Ie, null);
    /**
     * 伽马矫正
     * @param {ShaderPass}
     */
    st(this, ze, null);
    /**
     * bloom pass
     * @param {UnrealBloomPass}
     */
    st(this, ke, null);
    /**
     * destory
     */
    le(this, "destroy", () => {
      if (this.closeRender(), this.effectComposer) {
        let e = this.getEffectComposer();
        e.passes.forEach((i) => {
          He.dispose(i);
        }), He.dispose(e.copyPass), Xe(this, pe, null), e.passes = [], e.renderTarget1.dispose(), e.renderTarget2.dispose(), e.writeBuffer = null, e.readBuffer = null, e.copyPass = null, e = null;
      }
    });
    /**
     * temp 基础后处理
     */
    le(this, "setup", () => {
      const e = new At(ms), i = this.ssThreeObject.threeRenderer.getPixelRatio();
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
      ee(this, Ie) === null && Xe(this, Ie, new fs(n, r)), t.passes.findIndex((o) => o === ee(this, Ie)) === -1 && t.addPass(ee(this, Ie)), ee(this, ze) === null && Xe(this, ze, new At(gs)), t.passes.findIndex((o) => o === ee(this, ze)) === -1 && t.addPass(ee(this, ze)), ee(this, pe) === null && (Xe(this, pe, new Ue(
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
      e.removePass(ee(this, pe)), e.removePass(ee(this, Ie)), e.removePass(ee(this, ze)), He.dispose(ee(this, pe)), He.dispose(ee(this, ze)), He.dispose(ee(this, Ie));
    });
    /**
     * add bloom
     */
    le(this, "addBloom", () => {
      const e = this.getEffectComposer();
      ee(this, ke) === null && Xe(this, ke, new tt(
        new L.Vector2(
          this.ssThreeObject.threeContainer.offsetWidth,
          this.ssThreeObject.threeContainer.offsetHeight
        )
      )), e.passes.findIndex((i) => i === ee(this, ke)) === -1 && this.effectComposer.addPass(ee(this, ke));
    });
    /**
     * remove bloom
     */
    le(this, "removeBloom", () => {
      var e, i;
      (i = (e = this.effectComposer) == null ? void 0 : e.removePass) == null || i.call(e, ee(this, ke)), He.dispose(ee(this, ke));
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
        i.isObject3D && (s = (t = i.userData) == null ? void 0 : t.tempMask) != null && s.isObject3D && (He.dispose((n = i.userData) == null ? void 0 : n.tempMask), i.userData.tempMask.removeFromParent(), i.userData.tempMask = null);
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
pe = new WeakMap(), Ie = new WeakMap(), ze = new WeakMap(), ke = new WeakMap();
const bs = 200 * 1024 * 1024, ys = "ss-threejsdb", Ct = 1, lt = "【ss-threejs】";
class xs {
  constructor(e) {
    this.targetDataBase = null, this._dbOptions = null, this._cachedSize = null, this.DATABASE_TABLES = [
      {
        name: "model",
        // 用于后续增量更新处理 <代表当前数据库的版本号>
        dbVersion: Ct,
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
        dbVersion: Ct,
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
    ], this.createDataTables = (i, t) => {
      for (let s = 0; s < t.length; s++) {
        const n = t[s], { name: r, columns: o = [], dbVersion: l } = n;
        if (l === i.version)
          if (i.objectStoreNames.contains(r)) {
            const h = i.transaction(r).objectStore(r);
            o.forEach((d) => {
              d.type === "add" ? h.createIndex(d.name, d.name, {
                unique: d.unique
              }) : d.type === "del" && h.deleteIndex(d.name);
            });
          } else {
            const h = o.filter((u) => u.primarykey === !0).map((u) => u.name) || [], d = i.createObjectStore(r, {
              keyPath: h[0]
            });
            o.forEach((u) => {
              u.type === "add" && d.createIndex(u.name, u.name, {
                unique: u.unique
              });
            });
          }
      }
    }, this.addDbObserver = (i) => {
      i.onabort = (t) => {
        console.log(`${lt}db abort`, t);
      }, i.onclose = (t) => {
        console.log(`${lt}db close`, t);
      }, i.onerror = (t) => {
        console.log(`${lt}db error`, t);
      }, i.onversionchange = (t) => {
        console.log(`${lt}db version change`, t);
      };
    }, this.insertModel = (i, t) => this.open().then(
      (s) => this.autoLRU(s, t.byteLength).then(
        () => new Promise((n, r) => {
          const o = this.DATABASE_TABLES[0].name, l = this.DATABASE_TABLES[1].name, h = s.transaction([o, l], "readwrite"), d = h.objectStore(o), u = h.objectStore(l);
          d.add({
            model_name: i,
            model_type: "",
            model_path: i,
            size: t.byteLength,
            create_time: (/* @__PURE__ */ new Date()).valueOf(),
            update_time: (/* @__PURE__ */ new Date()).valueOf()
          }), u.add({
            model_name: i,
            data: t
          }), h.oncomplete = () => {
            this.updateTotalSize(t.byteLength), n(!0);
          }, h.onerror = (R) => {
            r(R);
          }, h.onabort = (R) => {
            r(R);
          };
        })
      )
    ), this.getModel = (i) => {
      const t = this.DATABASE_TABLES[1].name;
      return this.get(i, t).then((s) => {
        if (s) {
          const n = this.DATABASE_TABLES[0].name;
          this.get(i, n).then((r) => r ? (r.update_time = (/* @__PURE__ */ new Date()).valueOf(), this.update(r, n)) : null);
        }
        return s;
      });
    }, this.deleteModels = (i, t = []) => t.length === 0 ? Promise.resolve() : new Promise((s, n) => {
      const r = this.DATABASE_TABLES[0].name, o = this.DATABASE_TABLES[1].name, l = i.transaction([r, o], "readwrite"), h = l.objectStore(r), d = l.objectStore(o);
      t.forEach((u) => {
        h.delete(u), d.delete(u);
      }), l.oncomplete = () => {
        s(!0);
      }, l.onerror = (u) => {
        n(u);
      }, l.onabort = (u) => {
        n(u);
      };
    }), this.get = (i, t) => new Promise((s, n) => {
      this.open().then((r) => {
        const h = r.transaction(t, "readwrite").objectStore(t).get(i);
        h.onsuccess = () => {
          const d = h.result;
          s(d);
        }, h.onerror = (d) => {
          n(d);
        };
      });
    }), this.update = (i, t) => new Promise((s, n) => {
      this.open().then((r) => {
        const h = r.transaction(t, "readwrite").objectStore(t).put(i);
        h.onsuccess = () => {
          s(h.result);
        }, h.onerror = (d) => {
          n(d);
        };
      });
    }), this.delete = (i, t) => new Promise((s, n) => {
      this.open().then((r) => {
        if (r instanceof IDBDatabase) {
          const h = r.transaction(t, "readwrite").objectStore(t).delete(i);
          h.onsuccess = () => {
            s(h.result);
          }, h.onerror = (d) => {
            n(d);
          };
        }
      });
    }), this.autoLRU = (i, t = 0) => this.getTotalSize(i).then((s) => {
      let n = this._dbOptions.maxStorageSize - (s + t);
      if (!(n > 0))
        return n = Math.abs(n), new Promise((r, o) => {
          const l = this.DATABASE_TABLES[0].name, u = i.transaction([l], "readonly").objectStore(l).getAll();
          u.onsuccess = () => {
            const f = (u.result || []).sort((x, P) => x.update_time - P.update_time), g = [];
            let p = 0, c = 0;
            for (; n > p && !(f.length <= c); ) {
              const x = f == null ? void 0 : f[c];
              p += x.size, g.push(x.model_name), c += 1;
            }
            n > p && console.error(
              `${lt}初始化缓存大小配置，请将CacheSize配置调大到${t / 1024 / 1024}M以上`
            ), r({
              modelNames: g,
              reduceSize: p
            });
          }, u.onerror = (R) => {
            o(R);
          };
        }).then(
          (r) => this.deleteModels(i, r.modelNames).then(() => {
            this.updateTotalSize(r.reduceSize * -1);
          })
        );
    }), this.getTotalSize = (i) => this._cachedSize != null ? Promise.resolve(this._cachedSize) : new Promise((t, s) => {
      const n = this.DATABASE_TABLES[0].name, l = i.transaction(n, "readonly").objectStore(n).getAll();
      l.onsuccess = () => {
        const d = l.result.reduce((u, R) => u + R.size, 0);
        this._cachedSize = d, t(d);
      }, l.onerror = (h) => {
        s(h);
      };
    }), this.updateTotalSize = (i) => {
      this._cachedSize !== null && (this._cachedSize += i);
    }, e ? this._dbOptions = e : this._dbOptions = {
      maxStorageSize: bs
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
    return this.targetDataBase ? Promise.resolve(this.targetDataBase) : new Promise((e, i) => {
      const t = window.indexedDB.open(ys, Ct);
      t.onsuccess = () => {
        const s = t.result;
        this.targetDataBase = s, e(this.targetDataBase);
      }, t.onerror = (s) => {
        this.targetDataBase = null, i(s);
      }, t.onupgradeneeded = (s) => {
        const n = t.result;
        this.createDataTables(n, this.DATABASE_TABLES), this.targetDataBase = n, e(n);
      }, t.onblocked = (s) => {
        i(s);
      };
    });
  }
}
class Ss {
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
    }, this.downloadUrl = (i, t) => fetch(i, {
      method: "GET",
      headers: { responseType: "arraybuffer" }
    }).then((s) => {
      if (!t)
        try {
          return s.arrayBuffer();
        } catch {
          return s.blob();
        }
      const n = s.body.getReader(), r = +s.headers.get("Content-Length");
      let o = 0, l = 0;
      const h = [], d = (u) => {
        if (console.log(" down load下载文件处理 ", u.done, l), u.done) {
          const R = new Uint8Array(o);
          let f = 0;
          return h.forEach((g) => {
            R.set(g, f), f += g.length;
          }), R.buffer;
        }
        return h.push(u.value), o += u.value.length, r ? l = o / r : (l += 0.01, l = Math.min(l, 0.99)), t == null || t(l, h), n.read().then(d);
      };
      return n.read().then(d);
    }), this.getModelFilePathByUrl = (i) => i.startsWith("data:") || i.startsWith("blob:") ? Promise.resolve(i) : this.db.getModel(i).then((t) => t ? URL.createObjectURL(new Blob([t == null ? void 0 : t.data])) : i), this.getModelDataByUrl = (i) => this.db.getModel(i).then((t) => t ? t.data : this.downloadUrl(i, (s) => {
      this._progressBgElement && (this._progressBgElement.style.opacity = "1"), this._progressTextElement && (this._progressTextElement.innerText = "模型下载中..."), this._progressElement && (this._progressElement.style.width = `${s * 100}%`);
    }).then((s) => (this.db.insertModel(i, s), s))), this.threeLoadingManager = new L.LoadingManager(), this.db = new xs(), this.messageQueue = new pi(), this.threeLoadingManager.setURLModifier((i) => i), this.addProgressView(e);
  }
  destory() {
    var e, i;
    (e = this.db) == null || e.destory(), this.db = null, this.threeLoadingManager = null, this.removeProgressView(), (i = this.messageQueue) == null || i.destory(), this.messageQueue = null;
  }
}
class zs {
  constructor() {
    this.ssThreeObject = null, this.ssModuleCenter = null, this.ssMessageQueue = null, this.ssTransformControl = null, this.ssPostProcessModule = null, this.threeScene = null, this.threeCamera = null, this.threeAmbientLight = null, this.threeRenderer = null, this.threeEvent = null, this.ssLoadingManager = null, this._axisControlHelper = null, this._statsJs = null, this.setup = (e) => {
      let i = null;
      if (typeof e == "string" ? i = document.getElementById(e) : e instanceof HTMLElement && (i = e), !(i instanceof HTMLElement))
        return null;
      if (!Wt.isWebGLAvailable()) {
        const h = Wt.getWebGLErrorMessage();
        return i.appendChild(h), null;
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
      return this.threeEvent = new Rt(i), this.ssLoadingManager = new Ss(i), de.setup(), this.ssMessageQueue = new pi(), this.ssThreeObject = new Ji({
        container: i,
        scene: t,
        camera: n,
        control: l,
        renderer: r
      }), this.ssThreeObject.autoWindowResize(), this.ssThreeObject.renderLoop(), this.ssModuleCenter = new ts(this.ssThreeObject), this.ssPostProcessModule = new vs(this.ssThreeObject), this.ssTransformControl = new cs(this.ssThreeObject), de.add(() => {
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
          new fi(this.ssLoadingManager.threeLoadingManager).load(
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
      const t = new $i(this.ssLoadingManager.threeLoadingManager);
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
      const n = [];
      e.forEach((r) => {
        this.ssMessageQueue.add(() => {
          let o = Promise.resolve();
          switch (r.type) {
            case "obj":
              o = nt.loadObj(
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
          o.then((l) => {
            var h;
            t == null || t(r, l), l instanceof L.Object3D ? l.traverse((d) => {
              d.receiveShadow = !0, d.castShadow = !0;
            }) : l.scene instanceof L.Object3D && l.scene.traverse((d) => {
              d.receiveShadow = !0, d.castShadow = !0;
            }), n.push(l), s == null || s(r, l), (h = this.ssMessageQueue) == null || h.remove();
          }).catch((l) => {
            var h;
            console.log("【SSThreejs】模型渲染失败 ", r, l), (h = this.ssMessageQueue) == null || h.remove();
          });
        });
      }), this.ssMessageQueue.add(() => {
        i == null || i(n), this.ssMessageQueue.remove();
      });
    }, this.getModelDirectory = (e = "") => {
      const i = e.split("/");
      return i.pop(), `${i.join("/")}/`;
    }, this.loadFbx = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => nt.loadFbxBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltf = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => nt.loadGltfBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltfDraco = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => nt.loadGltfDracoBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this.loadGltfOptKTX = (e) => this.ssLoadingManager.getModelDataByUrl(e).then(
      (i) => nt.loadGltfOptKTXBuffer(
        i,
        this.getModelDirectory(e),
        this.ssLoadingManager.threeLoadingManager
      )
    ), this._addOrbitControl = (e, i) => {
      const t = new Dt(
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
      const i = new Fi();
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
    (i = this.ssTransformControl) == null || i.destory(), this.ssTransformControl = null, (t = this.ssThreeObject) == null || t.destory(), (s = this.ssMessageQueue) == null || s.destory(), this.ssMessageQueue = null, (n = this.ssLoadingManager) == null || n.destory(), this.ssLoadingManager = null, e && de.destory(), (r = this.ssModuleCenter) == null || r.destroy(), this.ssModuleCenter = null, this._removeOrbitControl(), this.threeEvent.destory(), this.threeEvent = null, this.threeScene !== null && (He.dispose(this.threeScene), this.threeRenderer.info.programs.length !== 0 ? console.log("scene material has not released", this.threeRenderer.info) : this.threeRenderer.info.memory.geometries ? console.log("scene geometries has not released", this.threeRenderer.info) : this.threeRenderer.info.memory.textures && console.log("scene textures has not released", this.threeRenderer.info)), this.threeRenderer !== null && (this.threeRenderer.dispose(), this.threeRenderer.forceContextLoss(), this.ssThreeObject.threeContainer.removeChild(this.threeRenderer.domElement));
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
const ks = {
  /**
   * @description 先行
   */
  SSLinearGradientMaterial: Ni,
  /**
   * @description
   */
  SSLightScanMaterial: Hi
  /**
   * @description 墙体反射
   */
  // MeshReflectorMaterial
};
class ws extends ut {
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
const Ke = new _(), ri = new Te(), ni = new Te(), oi = new _(), ai = new _();
class Ms {
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
    }, this.render = function(f, g) {
      f.matrixWorldAutoUpdate === !0 && f.updateMatrixWorld(), g.parent === null && g.matrixWorldAutoUpdate === !0 && g.updateMatrixWorld(), ri.copy(g.matrixWorldInverse), ni.multiplyMatrices(g.projectionMatrix, ri), h(f, f, g), R(f);
    }, this.setSize = function(f, g) {
      t = f, s = g, n = t / 2, r = s / 2, l.style.width = f + "px", l.style.height = g + "px";
    };
    function h(f, g, p) {
      if (f.isCSS2DObject) {
        Ke.setFromMatrixPosition(f.matrixWorld), Ke.applyMatrix4(ni);
        const c = f.visible === !0 && Ke.z >= -1 && Ke.z <= 1 && f.layers.test(p.layers) === !0;
        if (f.element.style.display = c === !0 ? "" : "none", c === !0) {
          f.onBeforeRender(i, g, p);
          const P = f.element;
          P.style.transform = "translate(" + -100 * f.center.x + "%," + -100 * f.center.y + "%)translate(" + (Ke.x * n + n) + "px," + (-Ke.y * r + r) + "px)", P.parentNode !== l && l.appendChild(P), f.onAfterRender(i, g, p);
        }
        const x = {
          distanceToCameraSquared: d(p, f)
        };
        o.objects.set(f, x);
      }
      for (let c = 0, x = f.children.length; c < x; c++)
        h(f.children[c], g, p);
    }
    function d(f, g) {
      return oi.setFromMatrixPosition(f.matrixWorld), ai.setFromMatrixPosition(g.matrixWorld), oi.distanceToSquared(ai);
    }
    function u(f) {
      const g = [];
      return f.traverse(function(p) {
        p.isCSS2DObject && g.push(p);
      }), g;
    }
    function R(f) {
      const g = u(f).sort(function(c, x) {
        if (c.renderOrder !== x.renderOrder)
          return x.renderOrder - c.renderOrder;
        const P = o.objects.get(c).distanceToCameraSquared, m = o.objects.get(x).distanceToCameraSquared;
        return P - m;
      }), p = g.length;
      for (let c = 0, x = g.length; c < x; c++)
        g[c].element.style.zIndex = p - c;
    }
  }
}
const li = new _(), _s = new Me(), hi = new _();
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
const Re = new Te(), Ts = new Te();
class Es {
  constructor(e = {}) {
    const i = this;
    let t, s, n, r;
    const o = {
      camera: { fov: 0, style: "" },
      objects: /* @__PURE__ */ new WeakMap()
    }, l = e.element !== void 0 ? e.element : document.createElement("div");
    l.style.overflow = "hidden", this.domElement = l;
    const h = document.createElement("div");
    h.style.transformOrigin = "0 0", h.style.pointerEvents = "none", l.appendChild(h);
    const d = document.createElement("div");
    d.style.transformStyle = "preserve-3d", h.appendChild(d), this.getSize = function() {
      return {
        width: t,
        height: s
      };
    }, this.render = function(p, c) {
      const x = c.projectionMatrix.elements[5] * r;
      o.camera.fov !== x && (h.style.perspective = c.isPerspectiveCamera ? x + "px" : "", o.camera.fov = x), c.view && c.view.enabled ? (h.style.transform = `translate( ${-c.view.offsetX * (t / c.view.width)}px, ${-c.view.offsetY * (s / c.view.height)}px )`, h.style.transform += `scale( ${c.view.fullWidth / c.view.width}, ${c.view.fullHeight / c.view.height} )`) : h.style.transform = "", p.matrixWorldAutoUpdate === !0 && p.updateMatrixWorld(), c.parent === null && c.matrixWorldAutoUpdate === !0 && c.updateMatrixWorld();
      let P, m;
      c.isOrthographicCamera && (P = -(c.right + c.left) / 2, m = (c.top + c.bottom) / 2);
      const S = c.view && c.view.enabled ? c.view.height / c.view.fullHeight : 1, B = (c.isOrthographicCamera ? `scale( ${S} )scale(` + x + ")translate(" + u(P) + "px," + u(m) + "px)" + R(c.matrixWorldInverse) : `scale( ${S} )translateZ(` + x + "px)" + R(c.matrixWorldInverse)) + "translate(" + n + "px," + r + "px)";
      o.camera.style !== B && (d.style.transform = B, o.camera.style = B), g(p, p, c);
    }, this.setSize = function(p, c) {
      t = p, s = c, n = t / 2, r = s / 2, l.style.width = p + "px", l.style.height = c + "px", h.style.width = p + "px", h.style.height = c + "px", d.style.width = p + "px", d.style.height = c + "px";
    };
    function u(p) {
      return Math.abs(p) < 1e-10 ? 0 : p;
    }
    function R(p) {
      const c = p.elements;
      return "matrix3d(" + u(c[0]) + "," + u(-c[1]) + "," + u(c[2]) + "," + u(c[3]) + "," + u(c[4]) + "," + u(-c[5]) + "," + u(c[6]) + "," + u(c[7]) + "," + u(c[8]) + "," + u(-c[9]) + "," + u(c[10]) + "," + u(c[11]) + "," + u(c[12]) + "," + u(-c[13]) + "," + u(c[14]) + "," + u(c[15]) + ")";
    }
    function f(p) {
      const c = p.elements;
      return "translate(-50%,-50%)" + ("matrix3d(" + u(c[0]) + "," + u(c[1]) + "," + u(c[2]) + "," + u(c[3]) + "," + u(-c[4]) + "," + u(-c[5]) + "," + u(-c[6]) + "," + u(-c[7]) + "," + u(c[8]) + "," + u(c[9]) + "," + u(c[10]) + "," + u(c[11]) + "," + u(c[12]) + "," + u(c[13]) + "," + u(c[14]) + "," + u(c[15]) + ")");
    }
    function g(p, c, x, P) {
      if (p.isCSS3DObject) {
        const m = p.visible === !0 && p.layers.test(x.layers) === !0;
        if (p.element.style.display = m === !0 ? "" : "none", m === !0) {
          p.onBeforeRender(i, c, x);
          let S;
          p.isCSS3DSprite ? (Re.copy(x.matrixWorldInverse), Re.transpose(), p.rotation2D !== 0 && Re.multiply(Ts.makeRotationZ(p.rotation2D)), p.matrixWorld.decompose(li, _s, hi), Re.setPosition(li), Re.scale(hi), Re.elements[3] = 0, Re.elements[7] = 0, Re.elements[11] = 0, Re.elements[15] = 1, S = f(Re)) : S = f(p.matrixWorld);
          const y = p.element, B = o.objects.get(p);
          if (B === void 0 || B.style !== S) {
            y.style.transform = S;
            const Y = { style: S };
            o.objects.set(p, Y);
          }
          y.parentNode !== d && d.appendChild(y), p.onAfterRender(i, c, x);
        }
      }
      for (let m = 0, S = p.children.length; m < S; m++)
        g(p.children[m], c, x);
    }
  }
}
class Cs {
  constructor() {
    this.id = 0, this.object = null, this.z = 0, this.renderOrder = 0;
  }
}
class mi {
  constructor() {
    this.id = 0, this.v1 = new et(), this.v2 = new et(), this.v3 = new et(), this.normalModel = new _(), this.vertexNormalsModel = [new _(), new _(), new _()], this.vertexNormalsLength = 0, this.color = new me(), this.material = null, this.uvs = [new Z(), new Z(), new Z()], this.z = 0, this.renderOrder = 0;
  }
}
class et {
  constructor() {
    this.position = new _(), this.positionWorld = new _(), this.positionScreen = new di(), this.visible = !0;
  }
  copy(e) {
    this.positionWorld.copy(e.positionWorld), this.positionScreen.copy(e.positionScreen);
  }
}
class gi {
  constructor() {
    this.id = 0, this.v1 = new et(), this.v2 = new et(), this.vertexColors = [new me(), new me()], this.material = null, this.z = 0, this.renderOrder = 0;
  }
}
class vi {
  constructor() {
    this.id = 0, this.object = null, this.x = 0, this.y = 0, this.z = 0, this.rotation = 0, this.scale = new Z(), this.material = null, this.renderOrder = 0;
  }
}
class Ps {
  constructor() {
    let e, i, t = 0, s, n, r = 0, o, l, h = 0, d, u, R = 0, f, g, p = 0, c;
    const x = { objects: [], lights: [], elements: [] }, P = new _(), m = new di(), S = new Ht(new _(-1, -1, -1), new _(1, 1, 1)), y = new Ht(), B = new Array(3), Y = new Te(), F = new Te(), D = new Te(), W = new zi(), N = [], oe = [], ge = [], se = [], $ = [];
    function ve() {
      const v = [], G = [], w = [];
      let C = null;
      const j = new ui();
      function I(M) {
        C = M, j.getNormalMatrix(C.matrixWorld), v.length = 0, G.length = 0, w.length = 0;
      }
      function T(M) {
        const U = M.position, Q = M.positionWorld, K = M.positionScreen;
        Q.copy(U).applyMatrix4(c), K.copy(Q).applyMatrix4(F);
        const be = 1 / K.w;
        K.x *= be, K.y *= be, K.z *= be, M.visible = K.x >= -1 && K.x <= 1 && K.y >= -1 && K.y <= 1 && K.z >= -1 && K.z <= 1;
      }
      function A(M, U, Q) {
        s = Pe(), s.position.set(M, U, Q), T(s);
      }
      function H(M, U, Q) {
        v.push(M, U, Q);
      }
      function te(M, U, Q) {
        G.push(M, U, Q);
      }
      function he(M, U) {
        w.push(M, U);
      }
      function z(M, U, Q) {
        return M.visible === !0 || U.visible === !0 || Q.visible === !0 ? !0 : (B[0] = M.positionScreen, B[1] = U.positionScreen, B[2] = Q.positionScreen, S.intersectsBox(y.setFromPoints(B)));
      }
      function q(M, U, Q) {
        return (Q.positionScreen.x - M.positionScreen.x) * (U.positionScreen.y - M.positionScreen.y) - (Q.positionScreen.y - M.positionScreen.y) * (U.positionScreen.x - M.positionScreen.x) < 0;
      }
      function fe(M, U) {
        const Q = oe[M], K = oe[U];
        Q.positionScreen.copy(Q.position).applyMatrix4(D), K.positionScreen.copy(K.position).applyMatrix4(D), We(Q.positionScreen, K.positionScreen) === !0 && (Q.positionScreen.multiplyScalar(1 / Q.positionScreen.w), K.positionScreen.multiplyScalar(1 / K.positionScreen.w), d = De(), d.id = C.id, d.v1.copy(Q), d.v2.copy(K), d.z = Math.max(Q.positionScreen.z, K.positionScreen.z), d.renderOrder = C.renderOrder, d.material = C.material, C.material.vertexColors && (d.vertexColors[0].fromArray(G, M * 3), d.vertexColors[1].fromArray(G, U * 3)), x.elements.push(d));
      }
      function k(M, U, Q, K) {
        const be = oe[M], a = oe[U], O = oe[Q];
        if (z(be, a, O) !== !1 && (K.side === wt || q(be, a, O) === !0)) {
          o = Ge(), o.id = C.id, o.v1.copy(be), o.v2.copy(a), o.v3.copy(O), o.z = (be.positionScreen.z + a.positionScreen.z + O.positionScreen.z) / 3, o.renderOrder = C.renderOrder, P.subVectors(O.position, a.position), m.subVectors(be.position, a.position), P.cross(m), o.normalModel.copy(P), o.normalModel.applyMatrix3(j).normalize();
          for (let J = 0; J < 3; J++) {
            const ce = o.vertexNormalsModel[J];
            ce.fromArray(v, arguments[J] * 3), ce.applyMatrix3(j).normalize(), o.uvs[J].fromArray(w, arguments[J] * 2);
          }
          o.vertexNormalsLength = 3, o.material = K, K.vertexColors && o.color.fromArray(G, M * 3), x.elements.push(o);
        }
      }
      return {
        setObject: I,
        projectVertex: T,
        checkTriangleVisibility: z,
        checkBackfaceCulling: q,
        pushVertex: A,
        pushNormal: H,
        pushColor: te,
        pushUv: he,
        pushLine: fe,
        pushTriangle: k
      };
    }
    const V = new ve();
    function X(v) {
      if (v.visible === !1)
        return;
      if (v.isLight)
        x.lights.push(v);
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
      e = Ce(), e.id = v.id, e.object = v, P.setFromMatrixPosition(v.matrixWorld), P.applyMatrix4(F), e.z = P.z, e.renderOrder = v.renderOrder, x.objects.push(e);
    }
    this.projectScene = function(v, G, w, C) {
      l = 0, u = 0, g = 0, x.elements.length = 0, v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), G.parent === null && G.matrixWorldAutoUpdate === !0 && G.updateMatrixWorld(), Y.copy(G.matrixWorldInverse), F.multiplyMatrices(G.projectionMatrix, Y), W.setFromProjectionMatrix(F), i = 0, x.objects.length = 0, x.lights.length = 0, X(v), w === !0 && x.objects.sort(Ae);
      const j = x.objects;
      for (let I = 0, T = j.length; I < T; I++) {
        const A = j[I].object, H = A.geometry;
        if (V.setObject(A), c = A.matrixWorld, n = 0, A.isMesh) {
          let te = A.material;
          const he = Array.isArray(te), z = H.attributes, q = H.groups;
          if (z.position === void 0)
            continue;
          const fe = z.position.array;
          for (let k = 0, M = fe.length; k < M; k += 3) {
            let U = fe[k], Q = fe[k + 1], K = fe[k + 2];
            const be = H.morphAttributes.position;
            if (be !== void 0) {
              const a = H.morphTargetsRelative, O = A.morphTargetInfluences;
              for (let J = 0, ce = be.length; J < ce; J++) {
                const ue = O[J];
                if (ue === 0)
                  continue;
                const we = be[J];
                a ? (U += we.getX(k / 3) * ue, Q += we.getY(k / 3) * ue, K += we.getZ(k / 3) * ue) : (U += (we.getX(k / 3) - fe[k]) * ue, Q += (we.getY(k / 3) - fe[k + 1]) * ue, K += (we.getZ(k / 3) - fe[k + 2]) * ue);
              }
            }
            V.pushVertex(U, Q, K);
          }
          if (z.normal !== void 0) {
            const k = z.normal.array;
            for (let M = 0, U = k.length; M < U; M += 3)
              V.pushNormal(k[M], k[M + 1], k[M + 2]);
          }
          if (z.color !== void 0) {
            const k = z.color.array;
            for (let M = 0, U = k.length; M < U; M += 3)
              V.pushColor(k[M], k[M + 1], k[M + 2]);
          }
          if (z.uv !== void 0) {
            const k = z.uv.array;
            for (let M = 0, U = k.length; M < U; M += 2)
              V.pushUv(k[M], k[M + 1]);
          }
          if (H.index !== null) {
            const k = H.index.array;
            if (q.length > 0)
              for (let M = 0; M < q.length; M++) {
                const U = q[M];
                if (te = he === !0 ? A.material[U.materialIndex] : A.material, te !== void 0)
                  for (let Q = U.start, K = U.start + U.count; Q < K; Q += 3)
                    V.pushTriangle(k[Q], k[Q + 1], k[Q + 2], te);
              }
            else
              for (let M = 0, U = k.length; M < U; M += 3)
                V.pushTriangle(k[M], k[M + 1], k[M + 2], te);
          } else if (q.length > 0)
            for (let k = 0; k < q.length; k++) {
              const M = q[k];
              if (te = he === !0 ? A.material[M.materialIndex] : A.material, te !== void 0)
                for (let U = M.start, Q = M.start + M.count; U < Q; U += 3)
                  V.pushTriangle(U, U + 1, U + 2, te);
            }
          else
            for (let k = 0, M = fe.length / 3; k < M; k += 3)
              V.pushTriangle(k, k + 1, k + 2, te);
        } else if (A.isLine) {
          D.multiplyMatrices(F, c);
          const te = H.attributes;
          if (te.position !== void 0) {
            const he = te.position.array;
            for (let z = 0, q = he.length; z < q; z += 3)
              V.pushVertex(he[z], he[z + 1], he[z + 2]);
            if (te.color !== void 0) {
              const z = te.color.array;
              for (let q = 0, fe = z.length; q < fe; q += 3)
                V.pushColor(z[q], z[q + 1], z[q + 2]);
            }
            if (H.index !== null) {
              const z = H.index.array;
              for (let q = 0, fe = z.length; q < fe; q += 2)
                V.pushLine(z[q], z[q + 1]);
            } else {
              const z = A.isLineSegments ? 2 : 1;
              for (let q = 0, fe = he.length / 3 - 1; q < fe; q += z)
                V.pushLine(q, q + 1);
            }
          }
        } else if (A.isPoints) {
          D.multiplyMatrices(F, c);
          const te = H.attributes;
          if (te.position !== void 0) {
            const he = te.position.array;
            for (let z = 0, q = he.length; z < q; z += 3)
              m.set(he[z], he[z + 1], he[z + 2], 1), m.applyMatrix4(D), ne(m, A, G);
          }
        } else
          A.isSprite && (A.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, A.matrixWorld), m.set(c.elements[12], c.elements[13], c.elements[14], 1), m.applyMatrix4(F), ne(m, A, G));
      }
      return C === !0 && x.elements.sort(Ae), x;
    };
    function ne(v, G, w) {
      const C = 1 / v.w;
      v.z *= C, v.z >= -1 && v.z <= 1 && (f = Ye(), f.id = G.id, f.x = v.x * C, f.y = v.y * C, f.z = v.z, f.renderOrder = G.renderOrder, f.object = G, f.rotation = G.rotation, f.scale.x = G.scale.x * Math.abs(f.x - (v.x + w.projectionMatrix.elements[0]) / (v.w + w.projectionMatrix.elements[12])), f.scale.y = G.scale.y * Math.abs(f.y - (v.y + w.projectionMatrix.elements[5]) / (v.w + w.projectionMatrix.elements[13])), f.material = G.material, x.elements.push(f));
    }
    function Ce() {
      if (i === t) {
        const v = new Cs();
        return N.push(v), t++, i++, v;
      }
      return N[i++];
    }
    function Pe() {
      if (n === r) {
        const v = new et();
        return oe.push(v), r++, n++, v;
      }
      return oe[n++];
    }
    function Ge() {
      if (l === h) {
        const v = new mi();
        return ge.push(v), h++, l++, v;
      }
      return ge[l++];
    }
    function De() {
      if (u === R) {
        const v = new gi();
        return se.push(v), R++, u++, v;
      }
      return se[u++];
    }
    function Ye() {
      if (g === p) {
        const v = new vi();
        return $.push(v), p++, g++, v;
      }
      return $[g++];
    }
    function Ae(v, G) {
      return v.renderOrder !== G.renderOrder ? v.renderOrder - G.renderOrder : v.z !== G.z ? G.z - v.z : v.id !== G.id ? v.id - G.id : 0;
    }
    function We(v, G) {
      let w = 0, C = 1;
      const j = v.z + v.w, I = G.z + G.w, T = -v.z + v.w, A = -G.z + G.w;
      return j >= 0 && I >= 0 && T >= 0 && A >= 0 ? !0 : j < 0 && I < 0 || T < 0 && A < 0 ? !1 : (j < 0 ? w = Math.max(w, j / (j - I)) : I < 0 && (C = Math.min(C, j / (j - I))), T < 0 ? w = Math.max(w, T / (T - A)) : A < 0 && (C = Math.min(C, T / (T - A))), C < w ? !1 : (v.lerp(G, w), G.lerp(v, 1 - C), !0));
    }
  }
}
class Os {
  constructor() {
    let e, i, t, s, n, r, o, l, h, d, u, R = 0, f = null, g = 1, p, c;
    const x = this, P = new Ut(), m = new Ut(), S = new me(), y = new me(), B = new me(), Y = new me(), F = new me(), D = new me(), W = new _(), N = new _(), oe = new _(), ge = new ui(), se = new Te(), $ = new Te(), ve = [], V = new Ps(), X = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
      D.set(w);
    }, this.setPixelRatio = function() {
    }, this.setSize = function(w, C) {
      s = w, n = C, r = s / 2, o = n / 2, X.setAttribute("viewBox", -r + " " + -o + " " + s + " " + n), X.setAttribute("width", s), X.setAttribute("height", n), P.min.set(-r, -o), P.max.set(r, o);
    }, this.getSize = function() {
      return {
        width: s,
        height: n
      };
    }, this.setPrecision = function(w) {
      f = w;
    };
    function re() {
      for (R = 0; X.childNodes.length > 0; )
        X.removeChild(X.childNodes[0]);
    }
    function ne(w) {
      return f !== null ? w.toFixed(f) : w;
    }
    this.clear = function() {
      re(), X.style.backgroundColor = D.getStyle();
    }, this.render = function(w, C) {
      if (!(C instanceof ki)) {
        console.error("THREE.SVGRenderer.render: camera is not an instance of Camera.");
        return;
      }
      const j = w.background;
      j && j.isColor ? (re(), X.style.backgroundColor = j.getStyle()) : this.autoClear === !0 && this.clear(), x.info.render.vertices = 0, x.info.render.faces = 0, se.copy(C.matrixWorldInverse), $.multiplyMatrices(C.projectionMatrix, se), e = V.projectScene(w, C, this.sortObjects, this.sortElements), i = e.elements, t = e.lights, ge.getNormalMatrix(C.matrixWorldInverse), Ce(t), p = "", c = "";
      for (let I = 0, T = i.length; I < T; I++) {
        const A = i[I], H = A.material;
        if (!(H === void 0 || H.opacity === 0)) {
          if (m.makeEmpty(), A instanceof vi)
            l = A, l.x *= r, l.y *= -o, Ge(l, A, H);
          else if (A instanceof gi)
            l = A.v1, h = A.v2, l.positionScreen.x *= r, l.positionScreen.y *= -o, h.positionScreen.x *= r, h.positionScreen.y *= -o, m.setFromPoints([l.positionScreen, h.positionScreen]), P.intersectsBox(m) === !0 && De(l, h, H);
          else if (A instanceof mi) {
            if (l = A.v1, h = A.v2, d = A.v3, l.positionScreen.z < -1 || l.positionScreen.z > 1 || h.positionScreen.z < -1 || h.positionScreen.z > 1 || d.positionScreen.z < -1 || d.positionScreen.z > 1)
              continue;
            l.positionScreen.x *= r, l.positionScreen.y *= -o, h.positionScreen.x *= r, h.positionScreen.y *= -o, d.positionScreen.x *= r, d.positionScreen.y *= -o, this.overdraw > 0 && (Ae(l.positionScreen, h.positionScreen, this.overdraw), Ae(h.positionScreen, d.positionScreen, this.overdraw), Ae(d.positionScreen, l.positionScreen, this.overdraw)), m.setFromPoints([
              l.positionScreen,
              h.positionScreen,
              d.positionScreen
            ]), P.intersectsBox(m) === !0 && Ye(l, h, d, A, H);
          }
        }
      }
      v(), w.traverseVisible(function(I) {
        if (I.isSVGObject) {
          if (W.setFromMatrixPosition(I.matrixWorld), W.applyMatrix4($), W.z < -1 || W.z > 1)
            return;
          const T = W.x * r, A = -W.y * o, H = I.node;
          H.setAttribute("transform", "translate(" + T + "," + A + ")"), X.appendChild(H);
        }
      });
    };
    function Ce(w) {
      B.setRGB(0, 0, 0), Y.setRGB(0, 0, 0), F.setRGB(0, 0, 0);
      for (let C = 0, j = w.length; C < j; C++) {
        const I = w[C], T = I.color;
        I.isAmbientLight ? (B.r += T.r, B.g += T.g, B.b += T.b) : I.isDirectionalLight ? (Y.r += T.r, Y.g += T.g, Y.b += T.b) : I.isPointLight && (F.r += T.r, F.g += T.g, F.b += T.b);
      }
    }
    function Pe(w, C, j, I) {
      for (let T = 0, A = w.length; T < A; T++) {
        const H = w[T], te = H.color;
        if (H.isDirectionalLight) {
          const he = W.setFromMatrixPosition(H.matrixWorld).normalize();
          let z = j.dot(he);
          if (z <= 0)
            continue;
          z *= H.intensity, I.r += te.r * z, I.g += te.g * z, I.b += te.b * z;
        } else if (H.isPointLight) {
          const he = W.setFromMatrixPosition(H.matrixWorld);
          let z = j.dot(W.subVectors(he, C).normalize());
          if (z <= 0 || (z *= H.distance == 0 ? 1 : 1 - Math.min(C.distanceTo(he) / H.distance, 1), z == 0))
            continue;
          z *= H.intensity, I.r += te.r * z, I.g += te.g * z, I.b += te.b * z;
        }
      }
    }
    function Ge(w, C, j) {
      let I = C.scale.x * r, T = C.scale.y * o;
      j.isPointsMaterial && (I *= j.size, T *= j.size);
      const A = "M" + ne(w.x - I * 0.5) + "," + ne(w.y - T * 0.5) + "h" + ne(I) + "v" + ne(T) + "h" + ne(-I) + "z";
      let H = "";
      (j.isSpriteMaterial || j.isPointsMaterial) && (H = "fill:" + j.color.getStyle() + ";fill-opacity:" + j.opacity), We(H, A);
    }
    function De(w, C, j) {
      const I = "M" + ne(w.positionScreen.x) + "," + ne(w.positionScreen.y) + "L" + ne(C.positionScreen.x) + "," + ne(C.positionScreen.y);
      if (j.isLineBasicMaterial) {
        let T = "fill:none;stroke:" + j.color.getStyle() + ";stroke-opacity:" + j.opacity + ";stroke-width:" + j.linewidth + ";stroke-linecap:" + j.linecap;
        j.isLineDashedMaterial && (T = T + ";stroke-dasharray:" + j.dashSize + "," + j.gapSize), We(T, I);
      }
    }
    function Ye(w, C, j, I, T) {
      x.info.render.vertices += 3, x.info.render.faces++;
      const A = "M" + ne(w.positionScreen.x) + "," + ne(w.positionScreen.y) + "L" + ne(C.positionScreen.x) + "," + ne(C.positionScreen.y) + "L" + ne(j.positionScreen.x) + "," + ne(j.positionScreen.y) + "z";
      let H = "";
      T.isMeshBasicMaterial ? (S.copy(T.color), T.vertexColors && S.multiply(I.color)) : T.isMeshLambertMaterial || T.isMeshPhongMaterial || T.isMeshStandardMaterial ? (y.copy(T.color), T.vertexColors && y.multiply(I.color), S.copy(B), N.copy(w.positionWorld).add(C.positionWorld).add(j.positionWorld).divideScalar(3), Pe(t, N, I.normalModel, S), S.multiply(y).add(T.emissive)) : T.isMeshNormalMaterial && (oe.copy(I.normalModel).applyMatrix3(ge).normalize(), S.setRGB(oe.x, oe.y, oe.z).multiplyScalar(0.5).addScalar(0.5)), T.wireframe ? H = "fill:none;stroke:" + S.getStyle() + ";stroke-opacity:" + T.opacity + ";stroke-width:" + T.wireframeLinewidth + ";stroke-linecap:" + T.wireframeLinecap + ";stroke-linejoin:" + T.wireframeLinejoin : H = "fill:" + S.getStyle() + ";fill-opacity:" + T.opacity, We(H, A);
    }
    function Ae(w, C, j) {
      let I = C.x - w.x, T = C.y - w.y;
      const A = I * I + T * T;
      if (A === 0)
        return;
      const H = j / Math.sqrt(A);
      I *= H, T *= H, C.x += I, C.y += T, w.x -= I, w.y -= T;
    }
    function We(w, C) {
      c === w ? p += C : (v(), c = w, p = C);
    }
    function v() {
      p && (u = G(R++), u.setAttribute("d", p), u.setAttribute("style", c), X.appendChild(u)), p = "", c = "";
    }
    function G(w) {
      return ve[w] == null && (ve[w] = document.createElementNS("http://www.w3.org/2000/svg", "path"), g == 0 && ve[w].setAttribute("shape-rendering", "crispEdges")), ve[w];
    }
  }
}
class Fs {
  constructor(e) {
    this.css2dRender = null, this.css3dRender = null, this.svgRender = null, this._resizeObserver = null, this._ssThreeObject = null, this.destory = () => {
      this._removeResizeOBserver(), de.removeIds(["svgFrameHandle", "css2dFrameHandle", "css3dFrameHandle"]), this.cancelRender2D(), this.cancelRender3D(), this.cancelRenderSVG(), this._ssThreeObject = null;
    }, this.render2D = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.css2dRender && (this.css2dRender = new Ms(), this.css2dRender.domElement.style.position = "absolute", this.css2dRender.domElement.style.top = "0px", this.css2dRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.css2dRender.domElement), de.add(() => {
        this.css2dRender.render(i, t);
      }, "css2dFrameHandle"));
    }, this.cancelRender2D = () => {
      var i, t;
      de.removeId("css2dFrameHandle"), (t = (i = this.css2dRender) == null ? void 0 : i.domElement) == null || t.remove(), this.css2dRender = null;
    }, this.render3D = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.css3dRender && (this.css3dRender = new Es(), this.css3dRender.domElement.style.position = "absolute", this.css3dRender.domElement.style.top = "0px", this.css3dRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.css3dRender.domElement), de.add(() => {
        this.css3dRender.render(i, t);
      }, "css3dFrameHandle"));
    }, this.cancelRender3D = () => {
      var i, t;
      de.removeId("css3dFrameHandle"), (t = (i = this.css3dRender) == null ? void 0 : i.domElement) == null || t.remove(), this.css3dRender = null;
    }, this.renderSVG = () => {
      const { threeScene: i, threeCamera: t, threeContainer: s } = this._ssThreeObject;
      this._addResizeObserver(s), !this.svgRender && (this.svgRender = new Os(), this.svgRender.domElement.style.position = "absolute", this.svgRender.domElement.style.top = "0px", this.svgRender.setSize(s.offsetWidth, s.offsetHeight), s.appendChild(this.svgRender.domElement), de.add(() => {
        this.svgRender.render(i, t);
      }, "svgFrameHandle"));
    }, this.cancelRenderSVG = () => {
      var i, t;
      de.removeId("svgFrameHandle"), (t = (i = this.svgRender) == null ? void 0 : i.domElement) == null || t.remove(), this.svgRender = null;
    }, this.drawingLabel = (i, t, s, n) => {
      const r = [i, t, s], o = new L.LineBasicMaterial({ color: 51390, linewidth: 10 }), l = new L.BufferGeometry().setFromPoints(r), h = new L.Line(l, o), d = document.createElement("div");
      d.className = "label", d.style.fontSize = "40px", d.style.marginTop = "-42px", d.style.padding = "40px 80px", d.style.backgroundColor = "#fff", d.style.color = "#000000", d.style.border = "1px solid #16BFB0", d.textContent = n || "示例";
      const u = new ws(d);
      return u.position.set(s.x, s.y, s.z), {
        line: h,
        tagLabel: u
      };
    }, this.drawLines = (i, t, s = 1e-3) => {
      i.length() === 0 && (i.x = 1e-3);
      const n = 0, r = n * 2.5, o = n * n * 50, l = new L.Vector3(0, 0, 0), h = new L.Ray(l, this._getVCenter(i.clone(), t.clone())), d = h.at(
        o / h.at(1, new L.Vector3()).distanceTo(l),
        new L.Vector3()
      ), u = this._getLenVcetor(i.clone(), d, r), R = this._getLenVcetor(t.clone(), d, r), f = new L.CubicBezierCurve3(i, u, R, t), g = new Ui(), p = f.getPoints(50), c = [], x = [], P = new L.Color();
      for (let S = 0; S < p.length; S++)
        P.setHSL(0.31666 + S * 5e-3, 0.7, 0.7), x.push(P.r, P.g, P.b), c.push(p[S].x, p[S].y, p[S].z);
      g.setPositions(c), g.setColors(x);
      const m = new Gi({
        // linewidth: 0.0006,
        linewidth: s,
        vertexColors: !0,
        dashed: !1
      });
      return {
        curve: f,
        lineMesh: new Wi(g, m)
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
class Rs {
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
    const s = new Vi({
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
    const s = new Qi(
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
const Ns = {
  /**
   * @description 墙体材质
   */
  WallMesh: Yi,
  /**
   * @description 水波纹材质
   */
  WaterMesh: Xi,
  /**
   * @description 路径材质
   */
  PathMesh: Rs
};
export {
  ws as CSS2DObject,
  js as CSS3DObject,
  Fs as SSCssRenderer,
  He as SSDispose,
  ts as SSFileSetting,
  nt as SSLoader,
  ks as SSMaterial,
  Ns as SSMesh,
  Rt as SSThreeEvent,
  de as SSThreeLoop,
  Ji as SSThreeObject,
  ji as SSThreeTool,
  L as THREE,
  zs as default
};
