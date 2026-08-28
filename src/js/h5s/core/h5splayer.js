function createRTCSessionDescription(t) {
  return new RTCSessionDescription(t);
}
const gStrH5SPlayerVersion = 'h5splayer r15.0.1025';
function H5sPlayerWS(t) {
  this.sourceBuffer,
  (this.buffer = []),
  this.t,
  this.video,
  this.s,
  this.i,
  this.o,
  (this.h = 0),
  (this.l = 0),
  (this.u = 0),
  (this.S = !1),
  (this.v = !1),
  (this.C = !1),
  this.H,
  (this.p = 1),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  (this.R = t),
  !0 === this.P && console.log('[WS] Websocket Conf:', t),
  (this.k = t.videoid),
  (this.W = t.pbconf),
  (this.T = t.token),
  void 0 === this.k
    ? ((this.m = t.videodom),
    !0 === this.P && console.log('[WS] use dom directly', t.token))
    : ((this.m = document.getElementById(this.k)),
    !0 === this.P && console.log('[WS] use videoid', t.token)),
  (this.video = this.m),
  this.I,
  void 0 != this.W && this.W.showposter == 'false'
    ? ((this.I =
                  `${this.R.protocol
                  }//${
                    this.R.host
                  }${this.R.rootpath
                  }api/v1/GetLoadingImage?session=${
                    this.R.session
                  }&refresh=${
                    Math.floor(1e6 * Math.random())}`),
    !0 === this.P && console.log('[WS] connect src', t.token),
    this.m.setAttribute('poster', this.I))
    : ((this.I =
                  `${this.R.protocol
                  }//${
                    this.R.host
                  }${this.R.rootpath
                  }api/v1/h5swsapi?token=${
                    this.T
                  }&session=${
                    this.R.session
                  }&refresh=${
                    Math.floor(1e6 * Math.random())}`),
    !0 === this.P && console.log('[WS] connect src', t.token),
    this.m.setAttribute('poster', this.I));
}
function H5sPlayerRTC(t) {
  this.s,
  this.o,
  (this.S = !1),
  (this.v = !1),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  (this.R = t),
  (this.k = t.videoid),
  (this.W = t.pbconf),
  (this.T = t.token),
  (this.p = 1),
  void 0 === this.k
    ? ((this.m = t.videodom),
    !0 === this.P && console.log('[RTC] use dom directly', t.token))
    : ((this.m = document.getElementById(this.k)),
    !0 === this.P && console.log('[RTC] use videoid', t.token)),
  (this.video = this.m),
  (this.A = null),
  (this.M = { optional: [{ DtlsSrtpKeyAgreement: !0 }] }),
  (this.U = { mandatory: { offerToReceiveAudio: !0, offerToReceiveVideo: !0 } }),
  (this.O = { iceServers: [] }),
  (this.g = []),
  this.I,
  void 0 != this.W && this.W.showposter == 'false'
    ? ((this.I =
                  `${this.R.protocol
                  }//${
                    this.R.host
                  }${this.R.rootpath
                  }api/v1/GetLoadingImage?session=${
                    this.R.session
                  }&refresh=${
                    Math.floor(1e6 * Math.random())}`),
    !0 === this.P && console.log('[WS] connect src', t.token),
    this.m.setAttribute('poster', this.I))
    : ((this.I =
                  `${this.R.protocol
                  }//${
                    this.R.host
                  }${this.R.rootpath
                  }api/v1/h5swsapi?token=${
                    this.T
                  }&session=${
                    this.R.session
                  }&refresh=${
                    Math.floor(1e6 * Math.random())}`),
    !0 === this.P && console.log('[WS] connect src', t.token),
    this.m.setAttribute('poster', this.I));
}
function H5sPlayerHls(t) {
  this.s,
  this.o,
  (this.R = t),
  (this.k = t.videoid),
  (this.T = t.token),
  this.N,
  (this.J = t.hlsver),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  void 0 === this.k
    ? ((this.m = t.videodom),
    !0 === this.P && console.log('[HLS] use dom directly', t.token))
    : ((this.m = document.getElementById(this.k)),
    !0 === this.P && console.log('[HLS] use videoid', t.token)),
  (this.F = this.m),
  (this.F.type = 'application/x-mpegURL'),
  (this.D = 0),
  (this._ = 0);
  const s =
        `${this.R.protocol
        }//${
          window.location.host
        }/api/v1/h5swsapi?token=${
          this.T
        }&session=${
          this.R.session}`;
  this.m.setAttribute('poster', s);
}
function H5sPlayerAudio(t) {
  (this.buffer = []),
  this.s,
  (this.S = !1),
  (this.v = !1),
  (this.R = t),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  !0 === this.P && console.log('[AUD] Aduio Player Conf:', t),
  (this.T = t.token),
  (this.L = new AudioContext());
}
function H5sPlayerAudBack(t) {
  (this.buffer = []),
  this.s,
  (this.S = !1),
  (this.v = !1),
  (this.R = t),
  (this.B = 0),
  (this.K = 48e3),
  (this.V = !1),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  !0 === this.P && console.log('[AUDBACK] Aduio Back Conf:', t),
  (this.T = t.token),
  (this.L = new AudioContext()),
  !0 === this.P && console.log('[AUDBACK] sampleRate', this.L.sampleRate),
  this.G();
}
function float32ToInt16(t) {
  for (var s = t.length, e = new Int16Array(s); s--;) e[s] = 32767 * Math.min(1, t[s]);
  return e;
}
function H5sConference(t) {
  this.s,
  this.o,
  (this.S = !1),
  (this.v = !1),
  (this.j = !1),
  this.q,
  this.X,
  (this.Y = !1),
  (this.Z = !1),
  this.$,
  this.tt,
  (this.st = []),
  (this.et = []),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  void 0 !== t.it && t.it === 'true' && (this.Y = !0),
  void 0 !== t.ot && t.ot === 'true' && (this.Z = !0),
  (this.R = t),
  void 0 === t.localvideoid
    ? ((this.nt = t.localvideodom),
    !0 === this.P && console.log(t.token, '[CFE] local use dom directly'))
    : ((this.nt = document.getElementById(t.localvideoid)),
    !0 === this.P && console.log(t.token, '[CFE] local use videoid')),
  void 0 === t.remotevideoid
    ? ((this.ht = t.remotevideodom),
    !0 === this.P && console.log(t.token, '[CFE] remote use dom directly'))
    : ((this.ht = document.getElementById(t.remotevideoid)),
    !0 === this.P && console.log(t.token, '[CFE] remote use videoid')),
  (this.A = null),
  (this.M = { optional: [{ DtlsSrtpKeyAgreement: !0 }] }),
  (this.U = { mandatory: { offerToReceiveAudio: !0, offerToReceiveVideo: !0, ct: !1 } }),
  (this.O = { iceServers: [] }),
  (this.g = []);
}
function makeLink(t, s, e) {
  const i = new Blob(t, { type: 'video/webm' });
  const o = window.URL.createObjectURL(i);
  const n = document.createElement('a');
  (n.style.display = 'none'), (n.href = o);
  const h = new Date();
  const c =
        `${s
        }_${
          h.getFullYear()
        }-${
          h.getMonth() + 1
        }-${
          h.getDate()
        }-${
          h.getHours()
        }-${
          h.getMinutes()
        }-${
          h.getSeconds()
        }${e}`;
  (n.download = c),
  document.body.appendChild(n),
  n.click(),
  setTimeout(() => {
    document.body.removeChild(n), window.URL.revokeObjectURL(o);
  }, 100);
}
function H5sRTCPush(t) {
  this.s,
  this.o,
  (this.S = !1),
  (this.v = !1),
  (this.P = !0),
  void 0 !== t.consolelog && t.consolelog === 'false' && (this.P = !1),
  (this.R = t),
  (this.k = t.localvideoid),
  (this.rt = t.user),
  (this.p = 1),
  void 0 === this.k
    ? ((this.at = t.localvideodom),
    !0 === this.P && console.log('[PUSH] use dom directly', t.user))
    : ((this.at = document.getElementById(this.k)),
    !0 === this.P && console.log('[PUSH] use videoid', t.user)),
  (this.video = this.at),
  (this.A = null),
  (this.M = { optional: [{ DtlsSrtpKeyAgreement: !0 }] }),
  (this.U = { mandatory: { offerToReceiveAudio: !1, offerToReceiveVideo: !1 } }),
  (this.O = { iceServers: [] }),
  (this.g = []);
}
function H5sRTCGetCapability(t, s) {
  const i = {};
  const o = [];
  const n = [];
  const h = [];
  const c = [];
  if (
    (navigator.mediaDevices
      .getUserMedia({ audio: !0, video: !0 })
      .then((t) => {
        t &&
                    t.getTracks().forEach((t) => {
                      t.stop();
                    });
      })
      .catch((t) => {
        const s = `[PUSH] getUserMedia failed: ${t.name} ${t.message}`;
        alert(s);
      }),
    window.RTCRtpTransceiver && 'setCodecPreferences' in window.RTCRtpTransceiver.prototype)
  ) {
    const t = window.RTCRtpSender.getCapabilities('video').codecs;
    let r = !1;
    let a = !1;
    for (let s = 0; s !== t.length; ++s) {
      const e = t[s];
      ['video/red', 'video/ulpfec', 'video/rtx'].includes(e.mimeType) ||
                (['video/VP9'].includes(e.mimeType)
                  ? (r = !0)
                  : ['video/H264'].includes(e.mimeType) && (a = !0));
    }
    r == 1 && o.push('VP9'), a == 1 && o.push('H264');
  } else o.push('Default');
  navigator.mediaDevices
    .enumerateDevices()
    .then((s) => {
      for (let t = 0; t !== s.length; ++t) {
        const i = s[t];
        const e = {};
        (e.id = i.deviceId),
        (e.name = i.label),
        i.kind === 'audioinput'
          ? n.push(e)
          : i.kind === 'audiooutput'
            ? h.push(e)
            : i.kind === 'videoinput' && c.push(e);
      }
      (i.videocodec = o), (i.videoin = c), (i.audioin = n), (i.audioout = h), t(i);
    })
    .catch((t) => {
      alert('[PUSH] enumerateDevices failed', e);
    });
}
console.log('[h5s]', gStrH5SPlayerVersion),
(H5sPlayerWS.prototype.lt = function () {
  if (!0 === this.S) {
    !0 === this.P && console.log('[WS] Reconnect...');
    const t = `${this.I}&update=${this.p}`;
    this.m.setAttribute('poster', t),
    !0 === this.P && console.log('[WS] Reconnect image', t),
    this.p++,
    this.dt(this.T),
    (this.S = !1);
  }
}),
(H5sPlayerWS.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[WS] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sPlayerWS.prototype.ft = function () {
  if (this.sourceBuffer !== null && void 0 !== this.sourceBuffer) {
    if (this.buffer.length !== 0 && !this.sourceBuffer.updating) {
      try {
        const t = this.buffer.shift();
        const s = new Uint8Array(t);
        this.sourceBuffer.appendBuffer(s);
      } catch (t) {
        !0 === this.P && console.log(t), this.s.close();
      }
    }
  } else !0 === this.P && console.log('[WS] is null or undefined', this.sourceBuffer);
}),
(H5sPlayerWS.prototype.St = function () {
  try {
    const t = { cmd: 'H5_KEEPALIVE' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerWS.prototype.vt = function (t) {
  return (
    t.data,
    ArrayBuffer,
    typeof t.data === 'string'
      ? (!0 === this.P && console.log('[WS] string'),
      void (
        void 0 != this.W &&
                      void 0 != this.W.callback &&
                      this.W.callback(t.data, this.W.userdata)
      ))
      : !0 !== this.v
        ? !1 === this.C
          ? ((this.H = String.fromCharCode.apply(null, new Uint8Array(t.data))),
          this.Ct(this),
          void (this.C = !0))
          : (this.buffer.push(t.data), void this.ft())
        : void 0
  );
}),
(H5sPlayerWS.prototype.Ct = function (t) {
  try {
    (window.MediaSource = window.MediaSource || window.WebKitMediaSource),
    window.MediaSource ||
                    (!0 === t.P && console.log('[WS] MediaSource API is not available'));
    const s = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    'MediaSource' in window && MediaSource.isTypeSupported(s)
      ? !0 === t.P && console.log('[WS] MIME type or codec: ', s)
      : !0 === t.P && console.log('[WS] Unsupported MIME type or codec: ', s),
    (t.t = new window.MediaSource()),
    (t.video.autoplay = !0),
    !0 === t.P && console.log(t.k);
    (t.video.src = window.URL.createObjectURL(t.t)),
    t.t.addEventListener('sourceopen', t.Ht.bind(t), !1);
  } catch (s) {
    !0 === t.P && console.log(s);
  }
}),
(H5sPlayerWS.prototype.Ht = function () {
  !0 === this.P && console.log('[WS] Add SourceBuffer'),
  (this.sourceBuffer = this.t.addSourceBuffer(this.H)),
  (this.t.duration = 1 / 0),
  this.t.removeEventListener('sourceopen', this.Ht, !1),
  this.sourceBuffer.addEventListener('updateend', this.ft.bind(this), !1);
}),
(H5sPlayerWS.prototype.dt = function (t) {
  if (
    ((this.video.autoplay = !0),
    (window.MediaSource = window.MediaSource || window.WebKitMediaSource),
    window.MediaSource)
  ) {
    let s = 'false';
    const e = 'video/mp4; codecs="hev1.1.6.L93.B0, mp4a.40.2"';
    'MediaSource' in window && MediaSource.isTypeSupported(e)
      ? (s = 'true')
      : (!0 === this.P && console.log('[WS] Unsupported MIME type or codec: ', e),
      (s = 'false'));
    let i = 'api/v1/h5swsapi';
    let o = 'main';
    if ((void 0 === this.R.streamprofile || (o = this.R.streamprofile), void 0 === this.W)) {
      i =
                    `${this.R.rootpath +
                    i
                    }?token=${
                      t
                    }&hevc=${
                      s
                    }&profile=${
                      o
                    }&session=${
                      this.R.session}`;
    } else {
      let n = 'false';
      let h = 'fake';
      void 0 === this.W.serverpb || (n = this.W.serverpb),
      void 0 === this.W.filename || (h = this.W.filename),
      (i =
                        `${this.R.rootpath +
                        i
                        }?token=${
                          t
                        }&playback=true&profile=${
                          o
                        }&serverpb=${
                          n
                        }&begintime=${
                          encodeURIComponent(this.W.begintime)
                        }&endtime=${
                          encodeURIComponent(this.W.endtime)
                        }&filename=${
                          h
                        }&session=${
                          this.R.session}`);
    }
    this.R.session,
    !0 === this.P && console.log(i),
    (this.s = this.ut(i)),
    !0 === this.P && console.log('[WS] setupWebSocket', this.s),
    (this.s.binaryType = 'arraybuffer'),
    (this.s.yt = this),
    (this.s.onmessage = this.vt.bind(this)),
    (this.s.onopen = function () {
      !0 === this.yt.P && console.log('[WS] wsSocket.onopen', this.yt),
      (this.yt.i = setInterval(this.yt.pt.bind(this.yt), 1e4)),
      (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3)),
      void 0 != this.yt.W && this.yt.W.autoplay === 'true' && this.yt.start();
    }),
    (this.s.onclose = function () {
      !0 === this.yt.P && console.log('[WS] wsSocket.onclose', this.yt),
      !0 === this.yt.v
        ? !0 === this.yt.P && console.log('[WS] wsSocket.onclose disconnect')
        : (this.yt.S = !0);
      try {
        this.yt.Pt(this.yt);
      } catch (t) {}
      this.yt.wt(this.yt), (this.yt.H = ''), (this.yt.C = !1);
    });
  } else !0 === this.P && console.log('[WS] MediaSource API is not available');
}),
(H5sPlayerWS.prototype.Pt = function (t) {
  !0 === t.P && console.log('[WS] Cleanup Source Buffer', t);
  try {
    t.sourceBuffer.removeEventListener('updateend', t.ft, !1),
    t.sourceBuffer.abort(),
    document.documentMode || /Edge/.test(navigator.userAgent)
      ? !0 === t.P && console.log('[WS] IE or EDGE!')
      : t.t.removeSourceBuffer(t.sourceBuffer),
    (t.sourceBuffer = null),
    (t.t = null),
    (t.buffer = []);
  } catch (s) {
    !0 === t.P && console.log(s);
  }
}),
(H5sPlayerWS.prototype.wt = function (t) {
  !0 === t.P && console.log('[WS] CleanupWebSocket', t),
  clearInterval(t.o),
  clearInterval(t.i),
  (t.h = 0),
  (t.l = 0),
  (t.u = 0);
}),
(H5sPlayerWS.prototype.pt = function () {
  if (void 0 === this.W) {
    if (void 0 === this.R.Rt);
    else if (this.R.Rt == 'false') {
      return void (
        !0 === this.P && console.log('[WS] Stream check has been disabled ', this)
      );
    }
    !0 === this.v &&
                (!0 === this.P && console.log('[WS] CheckSourceBuffer has been disconnect', this),
                clearInterval(this.o),
                clearInterval(this.i),
                clearInterval(this.kt));
    try {
      if (
        (!0 === this.P && console.log('[WS] CheckSourceBuffer', this),
        this.sourceBuffer.buffered.length <= 0)
      ) {
        if ((this.h++, this.h > 8)) {
          return (
            !0 === this.P && console.log('[WS] CheckSourceBuffer Close 1'),
            clearInterval(this.o),
            void this.s.close()
          );
        }
      } else {
        this.h = 0;
        this.sourceBuffer.buffered.start(0);
        const t = this.sourceBuffer.buffered.end(0);
        const s = t - this.video.currentTime;
        if (s > 5) {
          return (
            !0 === this.P && console.log('[WS] CheckSourceBuffer Close 2', s),
            clearInterval(this.o),
            void this.s.close()
          );
        }
        if (t == this.l) {
          if ((this.u++, this.u > 3)) {
            return (
              !0 === this.P && console.log('[WS] CheckSourceBuffer Close 3'),
              clearInterval(this.o),
              void this.s.close()
            );
          }
        } else this.u = 0;
        this.l = t;
      }
    } catch (t) {
      !0 === this.P && console.log(t), clearInterval(this.o), this.s.close();
    }
  }
}),
(H5sPlayerWS.prototype.connect = function () {
  this.dt(this.T), (this.kt = setInterval(this.lt.bind(this), 800));
}),
(H5sPlayerWS.prototype.disconnect = function () {
  !0 === this.P && console.log('[WS] disconnect', this),
  (this.v = !0),
  clearInterval(this.kt);
  try {
    this.s != null && (this.s.close(), (this.s = null));
  } catch (t) {}
  !0 === this.P && console.log('[WS] disconnect', this);
}),
(H5sPlayerWS.prototype.start = function () {
  try {
    const t = { cmd: 'H5_START' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerWS.prototype.pause = function () {
  try {
    const t = { cmd: 'H5_PAUSE' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerWS.prototype.resume = function () {
  try {
    const t = { cmd: 'H5_RESUME' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerWS.prototype.seek = function (t) {
  try {
    const s = { cmd: 'H5_SEEK' };
    (s.nSeekTime = t), this.s.send(JSON.stringify(s));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerWS.prototype.speed = function (t) {
  try {
    const s = { cmd: 'H5_SPEED' };
    (s.nSpeed = t), this.s.send(JSON.stringify(s));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.lt = function () {
  if (!0 === this.S) {
    !0 === this.P && console.log('[RTC] Reconnect...');
    const t = `${this.I}&update=${this.p}`;
    this.m.setAttribute('poster', t),
    !0 === this.P && console.log('[RTC] Reconnect image', t),
    this.p++,
    this.dt(this.T),
    (this.S = !1);
  }
}),
(H5sPlayerRTC.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[RTC] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sPlayerRTC.prototype.St = function () {
  try {
    const t = { type: 'keepalive' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.Et = function (t) {
  if (t.candidate) {
    let s;
    !0 === this.P && console.log('[RTC] onIceCandidate currentice', t.candidate),
    (s = t.candidate),
    !0 === this.P && console.log('[RTC] onIceCandidate currentice', JSON.stringify(s));
    const e = JSON.parse(JSON.stringify(s));
    (e.type = 'remoteice'),
    !0 === this.P &&
                    console.log('[RTC] onIceCandidate currentice new', JSON.stringify(e)),
    this.s.send(JSON.stringify(e));
  } else !0 === this.P && console.log('End of candidates.');
}),
(H5sPlayerRTC.prototype.Wt = function (t) {
  let s;
  !0 === this.P && console.log(`[RTC] Remote track added:${JSON.stringify(t)}`),
  (s = t.Tt ? t.Tt[0] : t.stream);
  const e = this.m;
  (e.srcObject = s), e.play();
}),
(H5sPlayerRTC.prototype.It = function () {
  !0 === this.P &&
            console.log(
              `[RTC] createPeerConnection  config: ${
                JSON.stringify(this.O)
              } option:${
                JSON.stringify(this.M)}`
            );
  const t = new RTCPeerConnection(this.O, this.M);
  const s = this;
  return (
    (t.onicecandidate = function (t) {
      s.Et.call(s, t);
    }),
    void 0 !== t.At
      ? (t.At = function (t) {
        s.Wt.call(s, t);
      })
      : (t.onaddstream = function (t) {
        s.Wt.call(s, t);
      }),
    (t.oniceconnectionstatechange = function (e) {
      !0 === s.P &&
                    console.log(`[RTC] oniceconnectionstatechange  state: ${t.iceConnectionState}`);
    }),
    !0 === this.P &&
                console.log(
                  `[RTC] Created RTCPeerConnnection with config: ${
                    JSON.stringify(this.O)
                  }option:${
                    JSON.stringify(this.M)}`
                ),
    t
  );
}),
(H5sPlayerRTC.prototype.bt = function (t) {
  !0 === this.P && console.log('[RTC] ProcessRTCOffer', t);
  try {
    (this.A = this.It()), (this.g.length = 0);
    const s = this;
    !0 === this.P && console.log('[RTC] createRTCSessionDescription '),
    this.A.setRemoteDescription(createRTCSessionDescription(t)),
    this.A.createAnswer(this.U).then(
      (t) => {
        !0 === s.P && console.log(`[RTC] Create answer:${JSON.stringify(t)}`),
        s.A.setLocalDescription(
          t,
          () => {
            !0 === s.P &&
                                        console.log('[RTC] ProcessRTCOffer createAnswer', t),
            s.s.send(JSON.stringify(t));
          },
          () => {}
        );
      },
      (t) => {
        alert(`[RTC] Create awnser error:${JSON.stringify(t)}`);
      }
    );
  } catch (t) {
    this.disconnect(), alert(`[RTC] connect error: ${t}`);
  }
}),
(H5sPlayerRTC.prototype.Mt = function (t) {
  !0 === this.P && console.log('[RTC] ProcessRemoteIce', t);
  try {
    const s = new RTCIceCandidate({ sdpMLineIndex: t.sdpMLineIndex, candidate: t.candidate });
    !0 === this.P && console.log('[RTC] ProcessRemoteIce', s),
    !0 === this.P && console.log(`[RTC] Adding ICE candidate :${JSON.stringify(s)}`),
    this.A.addIceCandidate(
      s,
      () => {},
      (t) => {
        console.log(`[RTC] addIceCandidate error:${JSON.stringify(t)}`);
      }
    );
  } catch (t) {
    alert(`connect ProcessRemoteIce error: ${t}`);
  }
}),
(H5sPlayerRTC.prototype.vt = function (t) {
  t.data, ArrayBuffer, t.data, !0 === this.P && console.log('[RTC] RTC received ', t.data);
  const s = JSON.parse(t.data);
  return (
    !0 === this.P && console.log('[RTC] Get Message type ', s.type),
    s.type === 'offer'
      ? (!0 === this.P && console.log('[RTC] Process Message type ', s.type),
      void this.bt(s))
      : s.type === 'iceserver'
        ? (!0 === this.P && console.log('[RTC] Process Message type ', s.type),
        (this.O.iceServers = s.iceServers),
        (this.O.iceTransportPolicy = s.iceTransportPolicy),
        void (!0 === this.P && console.log('[RTC] Iceserver:', this.O)))
        : s.type === 'remoteice'
          ? (!0 === this.P && console.log('[RTC] Process Message type ', s.type),
          void this.Mt(s))
          : void (
            void 0 != this.W &&
                      void 0 != this.W.callback &&
                      this.W.callback(t.data, this.W.userdata)
          )
  );
}),
(H5sPlayerRTC.prototype.dt = function (t) {
  this.video.autoplay = !0;
  let s = 'api/v1/h5srtcapi';
  void 0 === this.R.rtcengine || (this.R.rtcengine === 'v2' && (s = 'api/v1/h5srtcapi2')),
  !0 === this.P && console.log('[RTC] API path', s);
  let e = 'main';
  void 0 === this.R.streamprofile || (e = this.R.streamprofile);
  let i = 'false';
  const o = 'video/mp4; codecs="hev1.1.6.L93.B0, mp4a.40.2"';
  if (
    ('MediaSource' in window && MediaSource.isTypeSupported(o)
      ? (i = 'true')
      : (!0 === this.P && console.log('[RTC] Unsupported MIME type or codec: ', o),
      (i = 'false')),
    void 0 === this.W)
  ) {
    s =
                `${this.R.rootpath +
                s
                }?token=${
                  t
                }&hevc=${
                  i
                }&profile=${
                  e
                }&session=${
                  this.R.session}`;
  } else {
    let n = 'false';
    let h = 'fake';
    void 0 === this.W.serverpb || (n = this.W.serverpb),
    void 0 === this.W.filename || (h = this.W.filename),
    (s =
                    `${this.R.rootpath +
                    s
                    }?token=${
                      t
                    }&playback=true&hevc=${
                      i
                    }&profile=${
                      e
                    }&serverpb=${
                      n
                    }&begintime=${
                      encodeURIComponent(this.W.begintime)
                    }&endtime=${
                      encodeURIComponent(this.W.endtime)
                    }&filename=${
                      h
                    }&session=${
                      this.R.session}`);
  }
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[RTC] setupWebSocket', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = function () {
    !0 === this.yt.P && console.log('[RTC] wsSocket.onopen', this.yt);
    const t = { type: 'open' };
    this.yt.s.send(JSON.stringify(t)),
    (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3)),
    void 0 != this.yt.W && this.yt.W.autoplay === 'true' && this.yt.start();
  }),
  (this.s.onclose = function () {
    !0 === this.P && console.log('[RTC] wsSocket.onclose', this.yt),
    !0 === this.yt.v
      ? !0 === this.yt.P && console.log('[RTC] wsSocket.onclose disconnect')
      : (this.yt.S = !0),
    this.yt.wt(this.yt);
  });
}),
(H5sPlayerRTC.prototype.wt = function (t) {
  !0 === t.P && console.log('[RTC] CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sPlayerRTC.prototype.connect = function () {
  this.dt(this.T), (this.kt = setInterval(this.lt.bind(this), 3e3));
}),
(H5sPlayerRTC.prototype.disconnect = function () {
  if (
    (!0 === this.P && console.log('[RTC] disconnect', this),
    (this.v = !0),
    clearInterval(this.kt),
    this.s != null && (this.s.close(), (this.s = null)),
    this.m && (this.m.src = ''),
    this.A)
  ) {
    try {
      this.A.close();
    } catch (t) {
      !0 === this.P && console.log(`[RTC] close peer connection failed:${t}`);
    }
    this.A = null;
  }
  !0 === this.P && console.log('[RTC] disconnect', this);
}),
(H5sPlayerRTC.prototype.start = function () {
  try {
    const t = { cmd: 'H5_START' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.pause = function () {
  try {
    const t = { cmd: 'H5_PAUSE' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.resume = function () {
  try {
    const t = { cmd: 'H5_RESUME' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.seek = function (t) {
  try {
    const s = { cmd: 'H5_SEEK' };
    (s.nSeekTime = t), this.s.send(JSON.stringify(s));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerRTC.prototype.speed = function (t) {
  try {
    const s = { cmd: 'H5_SPEED' };
    (s.nSpeed = t), this.s.send(JSON.stringify(s));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerHls.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[HLS] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log('[HLS] ', this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sPlayerHls.prototype.St = function () {
  try {
    const t = { type: 'keepalive' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerHls.prototype.vt = function (t) {
  !0 === this.P && console.log('[HLS] HLS received ', t.data);
}),
(H5sPlayerHls.prototype.dt = function (t) {
  let s = 'api/v1/h5swscmnapi';
  (s = `${this.R.rootpath + s}?token=${t}&session=${this.R.session}`),
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[HLS] setupWebSocket', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = function () {
    !0 === this.yt.P && console.log('[HLS] wsSocket.onopen', this.yt),
    (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3));
  }),
  (this.s.onclose = function () {
    !0 === this.yt.P && console.log('[HLS] wsSocket.onclose', this.yt),
    this.yt.wt(this.yt);
  });
}),
(H5sPlayerHls.prototype.wt = function (t) {
  !0 === t.P && console.log('[HLS] H5sPlayerHls CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sPlayerHls.prototype.Ut = function () {
  !0 === this.P && console.log('[HLS]  video.ended', this.F.ended),
  !0 === this.P && console.log('[HLS] video.currentTime', this.F.currentTime);
  const t = this.F.currentTime;
  const s = t - this.D;
  !0 === this.P && console.log('[HLS]  diff', s),
  s === 0 && this._++,
  (this.D = t),
  this._ > 3 &&
                (this.s != null && (this.s.close(), (this.s = null)),
                this.dt(this.T),
                !0 === this.P && console.log('[HLS] reconnect'),
                (this.F.src = ''),
                (this.D = 0),
                (this._ = 0),
                (this.F.src =
                    `${this.R.protocol
                    }//${
                      this.R.host
                    }${this.R.rootpath
                    }hls/${
                      this.J
                    }/${
                      this.T
                    }/hls.m3u8`),
                this.F.play());
}),
(H5sPlayerHls.prototype.connect = function () {
  this.dt(this.T),
  (this.D = 0),
  (this._ = 0),
  (this.F.onended = function (t) {
    !0 === this.P && console.log('[HLS] The End');
  }),
  (this.F.onpause = function (t) {
    !0 === this.P && console.log('[HLS] Pause');
  }),
  (this.F.onplaying = function (t) {
    !0 === this.P && console.log('[HLS] Playing');
  }),
  (this.F.onseeking = function (t) {
    !0 === this.P && console.log('[HLS] seeking');
  }),
  (this.F.onvolumechange = function (t) {
    !0 === this.P && console.log('[HLS] volumechange');
  }),
  (this.F.src =
                `${this.R.protocol
                }//${
                  this.R.host
                }${this.R.rootpath
                }hls/${
                  this.J
                }/${
                  this.T
                }/hls.m3u8`),
  this.F.play(),
  (this.N = setInterval(this.Ut.bind(this), 3e3));
}),
(H5sPlayerHls.prototype.disconnect = function () {
  clearInterval(this.N),
  (this.D = 0),
  (this._ = 0),
  this.s != null && (this.s.close(), (this.s = null)),
  !0 === this.P && console.log('[HLS] disconnect', this);
}),
(H5sPlayerAudio.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[AUD] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sPlayerAudio.prototype.St = function () {
  try {
    this.s.send('keepalive');
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerAudio.prototype.vt = function (t) {
  for (
    var s = new Int16Array(t.data), e = s.length, i = this.L.createBuffer(1, e, 8e3), o = 0;
    o < 1;
    o++
  ) for (let n = i.getChannelData(o), h = 0; h < e; h++) n[h] = s[h] / 16383.5;
  const c = this.L.createBufferSource();
  (c.buffer = i), c.connect(this.L.destination), c.start();
}),
(H5sPlayerAudio.prototype.wt = function (t) {
  !0 === t.P && console.log('[AUD] CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sPlayerAudio.prototype.dt = function (t) {
  let s = 'api/v1/h5saudapi';
  (s = `${this.R.rootpath + s}?token=${t}&session=${this.R.session}`),
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[AUD] setupWebSocket for audio', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = function () {
    !0 === this.yt.P && console.log('[AUD] wsSocket.onopen', this.yt),
    (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3));
  }),
  (this.s.onclose = function () {
    !0 === this.yt.P && console.log('[AUD] wsSocket.onclose', this.yt),
    this.yt.wt(this.yt);
  });
}),
(H5sPlayerAudio.prototype.connect = function () {
  this.dt(this.T);
}),
(H5sPlayerAudio.prototype.disconnect = function () {
  !0 === this.P && console.log('[AUD] disconnect', this),
  this.s != null && (this.s.close(), (this.s = null)),
  !0 === this.P && console.log('[AUD] disconnect', this);
}),
(H5sPlayerAudBack.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[AUDBACK] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sPlayerAudBack.prototype.St = function () {
  try {
    this.s.send('keepalive');
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sPlayerAudBack.prototype.vt = function (t) {}),
(H5sPlayerAudBack.prototype.wt = function (t) {
  !0 === this.P && console.log('[AUDBACK] CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sPlayerAudBack.prototype.G = function () {
  !0 === this.P && console.log('[AUDBACK] sampleRate', this.L.sampleRate),
  (navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.Ot);
  try {
    navigator.getUserMedia({ video: !1, audio: !0 }, this.gt.bind(this));
  } catch (s) {
    const t = `[AUDBACK] Audio back getUserMedia failed: ${s.name} ${s.message}`;
    return void alert(t);
  }
}),
(H5sPlayerAudBack.prototype.Nt = function () {
  this.V = !0;
}),
(H5sPlayerAudBack.prototype.dt = function (t) {
  let s = 'api/v1/h5saudbackapi';
  (s =
            `${this.R.rootpath +
            s
            }?token=${
              t
            }&samplerate=${
              this.K
            }&session=${
              this.R.session}`),
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[AUDBACK] setupWebSocket for audio back', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = this.Nt.bind(this)),
  (this.s.onclose = function () {
    !0 === this.P && console.log('[AUDBACK] wsSocket.onclose', this.yt),
    this.yt.wt(this.yt);
  });
}),
(H5sPlayerAudBack.prototype.Jt = function (t) {
  const s = float32ToInt16(t.inputBuffer.getChannelData(0));
  !0 === this.V && this.s && this.s.send(s);
}),
(H5sPlayerAudBack.prototype.gt = function (t) {
  try {
    const s = this.L.createMediaStreamSource(t);
    const e = this.L.createScriptProcessor(1024, 1, 1);
    s.connect(e), e.connect(this.L.destination), (e.onaudioprocess = this.Jt.bind(this));
  } catch (t) {
    return void alert('Audio intecomm error', t);
  }
}),
(H5sPlayerAudBack.prototype.connect = function () {
  this.dt(this.T);
}),
(H5sPlayerAudBack.prototype.disconnect = function () {
  !0 === this.P && console.log('[AUDBACK] disconnect', this),
  this.s != null && (this.s.close(), (this.s = null)),
  !0 === this.P && console.log('[AUDBACK] disconnect', this);
}),
(H5sConference.prototype.lt = function () {
  !0 === this.S &&
            (!0 === this.P && console.log('Reconnect...'), this.dt(this.T), (this.S = !1));
}),
(H5sConference.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[CFE] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sConference.prototype.St = function () {
  try {
    const t = { type: 'CFE_CMD_KEEPALIVE' };
    const s = {};
    (s.strId = this.q), (t.keepalive = s), this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sConference.prototype.Et = function (t) {
  if (t.candidate) {
    let s;
    !0 === this.P && console.log('[CFE] onIceCandidate currentice', t.candidate),
    (s = t.candidate),
    !0 === this.P && console.log('[CFE] onIceCandidate currentice', JSON.stringify(s));
    const e = { type: 'CFE_CMD_REMOTE_ICE' };
    const i = {};
    console.log('[CFE] remote Ice to', this.X),
    (i.strTo = this.X),
    (i.msg = s),
    (e.remoteIce = i),
    this.s.send(JSON.stringify(e));
  } else !0 === this.P && console.log('[CFE] End of candidates.');
}),
(H5sConference.prototype.Ft = function (t) {
  !0 === this.P && console.log('[CFE] ondataavailableLocal', t.data),
  this.st.push(t.data),
  this.$.state == 'inactive' && makeLink(this.st, 'local', '.webm');
}),
(H5sConference.prototype.Dt = function (t) {
  !0 === this.P && console.log('[CFE] ondataavailableRemote', t.data),
  this.et.push(t.data),
  this.tt.state == 'inactive' && makeLink(this.et, 'remote', '.webm');
}),
(H5sConference.prototype.Wt = function (t) {
  let s;
  !0 === this.P && console.log(`[CFE] Remote track added:${JSON.stringify(t)}`),
  (s = t.Tt ? t.Tt[0] : t.stream);
  const e = this.ht;
  if (e.srcObject !== s) {
    (e.srcObject = s), e.play();
    try {
      this.Y == 1 &&
                    (!0 === this.P && console.log('[CFE] Start local record...'),
                    (this.$ = new MediaRecorder(this._t)),
                    (this.$.ondataavailable = this.Ft.bind(this)),
                    this.$.start()),
      this.Z == 1 &&
                        (!0 === this.P && console.log('[CFE] Start remote record...'),
                        (this.tt = new MediaRecorder(s)),
                        (this.tt.ondataavailable = this.Dt.bind(this)),
                        this.tt.start());
    } catch (t) {
      alert(`start record error: ${t}`);
    }
  }
}),
(H5sConference.prototype.It = function () {
  !0 === this.P &&
            console.log(
              `[CFE] createPeerConnection  config: ${
                JSON.stringify(this.O)
              } option:${
                JSON.stringify(this.M)}`
            );
  const t = new RTCPeerConnection(this.O, this.M);
  const s = this;
  return (
    (t.onicecandidate = function (t) {
      s.Et.call(s, t);
    }),
    void 0 !== t.At
      ? (t.At = function (t) {
        s.Wt.call(s, t);
      })
      : (t.onaddstream = function (t) {
        s.Wt.call(s, t);
      }),
    (t.oniceconnectionstatechange = function (s) {
      !0 === this.P &&
                    console.log(`[CFE] oniceconnectionstatechange  state: ${t.iceConnectionState}`);
    }),
    !0 === this.P &&
                console.log(
                  `[CFE] Created RTCPeerConnnection with config: ${
                    JSON.stringify(this.O)
                  }option:${
                    JSON.stringify(this.M)}`
                ),
    t
  );
}),
(H5sConference.prototype.Lt = function (t) {
  !0 === this.P && console.log('[CFE] ProcessOffer', t);
  try {
    (this.A = this.It()), (this.g.length = 0);
    const s = this;
    const e = this._t.getVideoTracks();
    const i = this._t.getAudioTracks();
    e.length > 0 && console.log('[CFE] Using video device:', e[0].label),
    i.length > 0 && console.log('[CFE] Using audio device:', i[0].label),
    this._t.getTracks().forEach((t) => this.A.addTrack(t, this._t)),
    !0 === this.P && console.log('[CFE] createRTCSessionDescription '),
    this.A.setRemoteDescription(createRTCSessionDescription(t)),
    this.A.createAnswer(this.U).then(
      (t) => {
        !0 === s.P && console.log(`[CFE] Create answer:${JSON.stringify(t)}`),
        s.A.setLocalDescription(
          t,
          () => {
            !0 === s.P && console.log('[CFE] ProcessOffer createAnswer', t);
            const e = { type: 'CFE_CMD_CALL_ANSWER' };
            const i = {};
            console.log('[CFE] createAnswer to', s.X),
            (i.strTo = s.X),
            (i.msg = t),
            (e.answer = i),
            s.s.send(JSON.stringify(e));
          },
          () => {}
        );
      },
      (t) => {
        alert(`[CFE ]Create awnser error:${JSON.stringify(t)}`);
      }
    );
  } catch (t) {
    this.disconnect(), alert(`connect error: ${t}`);
  }
}),
(H5sConference.prototype.Bt = function (t) {
  !0 === this.P && console.log('[CFE] ProcessAnswer', t);
  try {
    this.A.setRemoteDescription(createRTCSessionDescription(t));
  } catch (t) {
    this.disconnect(), alert(`connect error: ${t}`);
  }
}),
(H5sConference.prototype.zt = function () {
  !0 === this.P && console.log('[CFE] CreateOffer');
  try {
    (this.A = this.It()), (this.g.length = 0);
    const t = this;
    const s = this._t.getVideoTracks();
    const e = this._t.getAudioTracks();
    return (
      s.length > 0 && console.log('[CFE] Using video device:', s[0].label),
      e.length > 0 && console.log('[CFE] Using audio device:', e[0].label),
      this._t.getTracks().forEach((t) => this.A.addTrack(t, this._t)),
      void this.A.createOffer(this.U).then(
        (s) => {
          !0 === t.P && console.log(`[CFE] Create answer:${JSON.stringify(s)}`),
          t.A.setLocalDescription(
            s,
            () => {
              !0 === t.P && console.log('[CFE] ProcessOffer createAnswer', s);
              const e = s;
              !0 === t.P &&
                                        console.log('[CFE] createOffer ', JSON.stringify(e));
              const i = { type: 'CFE_CMD_CALL_OFFER' };
              const o = {};
              !0 === t.P && console.log('[CFE] createOffer to', t.X),
              (o.strTo = t.X),
              (o.msg = e),
              (i.offer = o),
              t.s.send(JSON.stringify(i));
            },
            () => {}
          );
        },
        (t) => {
          alert(`[CFE ]Create offer error:${JSON.stringify(t)}`);
        }
      )
    );
  } catch (t) {
    this.disconnect(), alert(`connect error: ${t}`);
  }
}),
(H5sConference.prototype.Mt = function (t) {
  !0 === this.P && console.log('[CFE] ProcessRemoteIce', t);
  try {
    const s = new RTCIceCandidate({ sdpMLineIndex: t.sdpMLineIndex, candidate: t.candidate });
    !0 === this.P && console.log('[CFE] ProcessRemoteIce', s),
    !0 === this.P && console.log(`[CFE] Adding ICE candidate :${JSON.stringify(s)}`),
    this.A.addIceCandidate(
      s,
      () => {},
      (t) => {
        console.log(`[CFE] addIceCandidate error:${JSON.stringify(t)}`);
      }
    );
  } catch (t) {
    alert(`connect ProcessRemoteIce error: ${t}`);
  }
}),
(H5sConference.prototype.vt = function (t) {
  !0 === this.P && console.log('[CFE] received ', t.data);
  const s = JSON.parse(t.data);
  if (
    (!0 === this.P && console.log('[CFE] Get Message type ', s.type),
    s.type !== 'CFE_CMD_INVITE_REQ')
  ) {
    if (s.type === 'CFE_CMD_INVITE_RESP') return (this.X = s.inviteResp.strFrom), void this.zt();
    if (s.type !== 'CFE_CMD_CALL_OFFER') {
      if (s.type !== 'CFE_CMD_CALL_ANSWER') {
        if (s.type !== 'CFE_CMD_REMOTE_ICE') {
          if (s.type === 'CFE_EVENT_ID_ASSIGN') {
            (this.q = s.idAssign.strId),
            s.idAssign.bEnableRelay == 1 &&
                                    ((this.O.iceServers = s.idAssign.iceServers),
                                    (this.O.iceTransportPolicy = s.idAssign.iceTransportPolicy),
                                    !0 === this.P && console.log('[CFE] Iceserver:', this.O));
            const e = { type: 'CFE_EVENT_ID_ASSIGN', idAssign: {} };
            return (
              (e.idAssign.strId = s.idAssign.strId),
              void (
                void 0 != this.R.callback &&
                                    this.R.callback(JSON.stringify(e), this.R.userdata)
              )
            );
          }
          void 0 != this.R.callback && this.R.callback(t.data, this.R.userdata);
        } else this.Mt(s.remoteIce.msg);
      } else this.Bt(s.answer.msg);
    } else this.Lt(s.offer.msg);
  }
}),
(H5sConference.prototype.dt = function (t) {
  (this.nt.autoplay = !0), (this.ht.autoplay = !0);
  let s = 'api/v1/h5sconference';
  (s =
            void 0 === this.q
              ? `${this.R.rootpath + s}?name=${this.R.user}&session=${this.R.session}`
              : `${this.R.rootpath +
                  s
              }?name=${
                this.R.user
              }?id=${
                this.q
              }&session=${
                this.R.session}`),
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[CFE] setupWebSocket', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = function () {
    !0 === this.yt.P && console.log('[CFE] wsSocket.onopen', this.yt),
    (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3)),
    void 0 != this.yt.W && this.yt.W.autoplay === 'true' && this.yt.start();
  }),
  (this.s.onclose = function () {
    !0 === this.yt.P && console.log('[CFE] wsSocket.onclose', this.yt),
    !0 === this.yt.v
      ? !0 === this.yt.P && console.log('[CFE] wsSocket.onclose disconnect')
      : (this.yt.S = !0),
    this.yt.wt(this.yt);
  });
}),
(H5sConference.prototype.wt = function (t) {
  !0 === t.P && console.log('[CFE] CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sConference.prototype.connect = function () {
  this.dt(this.T), (this.kt = setInterval(this.lt.bind(this), 3e3));
}),
(H5sConference.prototype.call = function (t, s, e, i, o) {
  if (this.j != 1) {
    (this.xt = e), (this.Kt = o), (this.Vt = i);
    let n = 1280;
    let h = 720;
    i == 'QVGA'
      ? ((n = 320), (h = 240))
      : i == 'VGA'
        ? ((n = 640), (h = 480))
        : i == 'D1'
          ? ((n = 720), (h = 576))
          : i == '720P'
            ? ((n = 1280), (h = 720))
            : i == '1080P'
              ? ((n = 1920), (h = 1080))
              : i == '4K'
                ? ((n = 4096), (h = 2160))
                : i == '8K' && ((n = 7680), (h = 4320));
    try {
      try {
        let c;
        c = t != 0 && {
          deviceId: { exact: e },
          width: { exact: n },
          height: { exact: h }
        };
        const r = this;
        navigator.mediaDevices
          .getUserMedia({ audio: { deviceId: { exact: o } }, video: c })
          .then((e) => {
            t == 1 && (r.nt.srcObject = e), (r._t = e);
            const i = { type: 'CFE_CMD_INVITE_REQ' };
            const o = {};
            (o.strFrom = r.q),
            (o.strTo = s),
            (i.inviteReq = o),
            r.s.send(JSON.stringify(i));
          })
          .catch((t) => {
            const s = `[CFE] getUserMedia failed: ${t.name} ${t.message}`;
            alert(s);
          });
      } catch (t) {
        const a = `[CFE] getUserMedia failed: ${err.name} ${err.message}`;
        alert(a);
      }
    } catch (t) {
      !0 === this.P && console.log(t);
    }
    this.j = !0;
  }
}),
(H5sConference.prototype.answer = function (t, s, e, i, o) {
  if (this.j != 1) {
    (this.xt = e), (this.Kt = o), (this.Vt = i);
    let n = 1280;
    let h = 720;
    i == 'QVGA'
      ? ((n = 320), (h = 240))
      : i == 'VGA'
        ? ((n = 640), (h = 480))
        : i == 'D1'
          ? ((n = 720), (h = 576))
          : i == '720P'
            ? ((n = 1280), (h = 720))
            : i == '1080P'
              ? ((n = 1920), (h = 1080))
              : i == '4K'
                ? ((n = 4096), (h = 2160))
                : i == '8K' && ((n = 7680), (h = 4320));
    try {
      try {
        let c;
        c = t != 0 && {
          deviceId: { exact: e },
          width: { exact: n },
          height: { exact: h }
        };
        const r = this;
        navigator.mediaDevices
          .getUserMedia({ audio: { deviceId: { exact: o } }, video: c })
          .then((e) => {
            t == 1 && (r.nt.srcObject = e), (r._t = e);
            const i = { type: 'CFE_CMD_INVITE_RESP' };
            const o = {};
            (o.strFrom = r.q),
            (o.strTo = s),
            (r.X = s),
            (i.inviteResp = o),
            r.s.send(JSON.stringify(i));
          })
          .catch((t) => {
            const s = `[CFE] getUserMedia failed: ${t.name} ${t.message}`;
            alert(s);
          });
      } catch (t) {
        const a = `[CFE] getUserMedia failed: ${err.name} ${err.message}`;
        alert(a);
      }
    } catch (t) {
      !0 === this.P && console.log(t);
    }
    this.j = !0;
  }
}),
(H5sConference.prototype.hangup = function () {
  if (this.j != 0) {
    try {
      this.Y == 1 && this.$.stop(), this.Z == 1 && this.tt.stop();
    } catch (t) {
      alert(`stop record error: ${t}`);
    }
    try {
      const t = { cmd: 'H5_PAUSE' };
      this.s.send(JSON.stringify(t));
    } catch (t) {
      !0 === this.P && console.log(t);
    }
    if (
      (this.nt && (this.nt.src = ''),
      this.ht && (this.ht.src = ''),
      this._t && (this._t = null),
      this.A)
    ) {
      try {
        this.A.close();
      } catch (t) {
        !0 === this.P && console.log(`[CFE] close peer connection failed:${t}`);
      }
      this.A = null;
    }
    this.j = !1;
  }
}),
(H5sConference.prototype.disconnect = function () {
  !0 === this.P && console.log('[CFE] disconnect', this),
  (this.v = !0),
  clearInterval(this.kt),
  this.hangup(),
  this.s != null && (this.s.close(), (this.s = null)),
  !0 === this.P && console.log('[CFE] disconnect', this);
}),
(H5sRTCPush.prototype.lt = function () {
  !0 === this.S &&
            (!0 === this.P && console.log('[PUSH] Reconnect...'), this.dt(this.rt), (this.S = !1));
}),
(H5sRTCPush.prototype.ut = function (t) {
  let s;
  !0 === this.P && console.log('[PUSH] H5SWebSocketClient');
  try {
    this.R.protocol == 'http:' &&
                (s =
                    typeof MozWebSocket !== 'undefined'
                      ? new MozWebSocket(`ws://${this.R.host}${t}`)
                      : new WebSocket(`ws://${this.R.host}${t}`)),
    this.R.protocol == 'https:' &&
                    (!0 === this.P && console.log(this.R.host),
                    (s =
                        typeof MozWebSocket !== 'undefined'
                          ? new MozWebSocket(`wss://${this.R.host}${t}`)
                          : new WebSocket(`wss://${this.R.host}${t}`))),
    !0 === this.P && console.log(this.R.host);
  } catch (t) {
    return void alert('WebSocketClient error');
  }
  return s;
}),
(H5sRTCPush.prototype.St = function () {
  try {
    const t = { type: 'keepalive' };
    this.s.send(JSON.stringify(t));
  } catch (t) {
    !0 === this.P && console.log(t);
  }
}),
(H5sRTCPush.prototype.Et = function (t) {
  if (t.candidate) {
    let s;
    !0 === this.P && console.log('[PUSH] onIceCandidate currentice', t.candidate),
    (s = t.candidate),
    !0 === this.P && console.log('[PUSH] onIceCandidate currentice', JSON.stringify(s));
    const e = JSON.parse(JSON.stringify(s));
    (e.type = 'remoteice'),
    !0 === this.P &&
                    console.log('[PUSH] onIceCandidate currentice new', JSON.stringify(e)),
    this.s.send(JSON.stringify(e));
  } else !0 === this.P && console.log('End of candidates.');
}),
(H5sRTCPush.prototype.Wt = function (t) {
  !0 === this.P && console.log(`[PUSH] Remote track added:${JSON.stringify(t)}`),
  t.Tt ? t.Tt[0] : t.stream;
}),
(H5sRTCPush.prototype.It = function () {
  !0 === this.P &&
            console.log(
              `[PUSH] createPeerConnection  config: ${
                JSON.stringify(this.O)
              } option:${
                JSON.stringify(this.M)}`
            );
  const t = new RTCPeerConnection(this.O, this.M);
  const s = this;
  return (
    (t.onicecandidate = function (t) {
      s.Et.call(s, t);
    }),
    void 0 !== t.At
      ? (t.At = function (t) {
        s.Wt.call(s, t);
      })
      : (t.onaddstream = function (t) {
        s.Wt.call(s, t);
      }),
    (t.oniceconnectionstatechange = function (e) {
      !0 === s.P &&
                    console.log(
                      `[PUSH] oniceconnectionstatechange  state: ${t.iceConnectionState}`
                    );
    }),
    !0 === this.P &&
                console.log(
                  `[PUSH] Created RTCPeerConnnection with config: ${
                    JSON.stringify(this.O)
                  }option:${
                    JSON.stringify(this.M)}`
                ),
    t
  );
}),
(H5sRTCPush.prototype.Gt = function (t, s) {
  if (
    (adapter.browserDetails.browser === 'chrome' ||
                adapter.browserDetails.browser === 'safari' ||
                (adapter.browserDetails.browser === 'firefox' &&
                    adapter.browserDetails.version >= 64)) &&
            'RTCRtpSender' in window &&
            'setParameters' in window.RTCRtpSender.prototype
  ) {
    const e = t.getSenders();
    for (let t = 0; t !== e.length; ++t) {
      const i = e[t];
      if (i.track.kind == 'video') {
        const t = i.getParameters();
        t.encodings || (t.encodings = [{}]),
        (t.encodings[0].maxBitrate = 1e3 * s),
        i
          .setParameters(t)
          .then(() => {})
          .catch((t) => console.error(t));
      }
    }
  }
}),
(H5sRTCPush.prototype.zt = function () {
  !0 === this.P && console.log('[PUSH] CreateOffer');
  try {
    (this.A = this.It()), (this.g.length = 0);
    const t = this;
    const i = this._t.getVideoTracks();
    const o = this._t.getAudioTracks();
    if (
      (i.length > 0 && console.log('[PUSH] Using video device:', i[0].label),
      o.length > 0 && console.log('[PUSH] Using audio device:', o[0].label),
      this._t.getTracks().forEach((t) => this.A.addTrack(t, this._t)),
      window.RTCRtpTransceiver &&
                    'setCodecPreferences' in window.RTCRtpTransceiver.prototype)
    ) {
      let s = 'video/H264';
      this.Qt == 'VP9' ? (s = 'video/VP9') : this.Qt == 'H264' && (s = 'video/H264');
      const i = window.RTCRtpSender.getCapabilities('video').codecs;
      const e = [];
      for (let t = 0; t !== i.length; ++t) {
        const o = i[t];
        [s].includes(o.mimeType) && e.push(o);
      }
      !0 === t.P && console.log('[PUSH] Select codec:', e),
      this.A.getTransceivers()
        .find((t) => t.sender && t.sender.track === this._t.getVideoTracks()[0])
        .setCodecPreferences(e);
    }
    return void this.A.createOffer(this.U).then(
      (s) => {
        !0 === t.P && console.log(`[PUSH] Create offer:${JSON.stringify(s)}`),
        t.A.setLocalDescription(
          s,
          () => {
            const e = s;
            t.s.send(JSON.stringify(e));
          },
          () => {}
        );
      },
      (t) => {
        alert(`[PUSH ]Create offer error:${JSON.stringify(t)}`);
      }
    );
  } catch (t) {
    this.disconnect(), alert(`connect error: ${t}`);
  }
}),
(H5sRTCPush.prototype.Bt = function (t) {
  !0 === this.P && console.log('[PUSH] ProcessAnswer', t);
  try {
    this.A.setRemoteDescription(createRTCSessionDescription(t));
  } catch (t) {
    this.disconnect(), alert(`connect error: ${t}`);
  }
  this.Gt(this.A, this.jt);
}),
(H5sRTCPush.prototype.Mt = function (t) {
  !0 === this.P && console.log('[PUSH] ProcessRemoteIce', t);
  try {
    const s = new RTCIceCandidate({
      sdpMid: t.sdpMid,
      sdpMLineIndex: t.sdpMLineIndex,
      candidate: t.candidate
    });
    !0 === this.P && console.log('[PUSH] ProcessRemoteIce', s),
    !0 === this.P && console.log(`[PUSH] Adding ICE candidate :${JSON.stringify(s)}`),
    this.A.addIceCandidate(
      s,
      () => {},
      (t) => {
        console.log(`[PUSH] addIceCandidate error:${JSON.stringify(t)}`),
        console.log(t);
      }
    );
  } catch (t) {
    alert(`connect ProcessRemoteIce error: ${t}`);
  }
}),
(H5sRTCPush.prototype.vt = function (t) {
  t.data, ArrayBuffer, t.data, !0 === this.P && console.log('[PUSH] RTC received ', t.data);
  const s = JSON.parse(t.data);
  return (
    !0 === this.P && console.log('[PUSH] Get Message type ', s.type),
    s.type === 'iceserver'
      ? (!0 === this.P && console.log('[PUSH] Process Message type ', s.type),
      (this.O.iceServers = s.iceServers),
      !0 === this.P && console.log('[PUSH] Iceserver:', this.O),
      void this.zt())
      : s.type === 'answer'
        ? (!0 === this.P && console.log('[PUSH] Process Message type ', s.type),
        void this.Bt(s))
        : s.type === 'remoteice'
          ? (!0 === this.P && console.log('[PUSH] Process Message type ', s.type),
          void this.Mt(s))
          : void (void 0 != this.R.callback && this.R.callback(t.data, this.R.userdata))
  );
}),
(H5sRTCPush.prototype.dt = function (t) {
  this.video.autoplay = !0;
  let s = 'api/v1/h5srtcpushapi';
  (s =
            `${this.R.rootpath +
            s
            }?token=${
              t
            }&type=${
              this.R.type
            }&audio=${
              this.R.audio
            }&session=${
              this.R.session}`),
  !0 === this.P && console.log(s),
  (this.s = this.ut(s)),
  !0 === this.P && console.log('[PUSH] setupWebSocket', this.s),
  (this.s.binaryType = 'arraybuffer'),
  (this.s.yt = this),
  (this.s.onmessage = this.vt.bind(this)),
  (this.s.onopen = function () {
    !0 === this.yt.P && console.log('[PUSH] wsSocket.onopen', this.yt);
    const t = { type: 'open' };
    this.yt.s.send(JSON.stringify(t)),
    (this.yt.o = setInterval(this.yt.St.bind(this.yt), 1e3)),
    void 0 != this.yt.W && this.yt.W.autoplay === 'true' && this.yt.start();
  }),
  (this.s.onclose = function () {
    !0 === this.P && console.log('[PUSH] wsSocket.onclose', this.yt),
    !0 === this.yt.v
      ? !0 === this.yt.P && console.log('[PUSH] wsSocket.onclose disconnect')
      : (this.yt.S = !0),
    this.yt.wt(this.yt);
  });
}),
(H5sRTCPush.prototype.wt = function (t) {
  !0 === t.P && console.log('[PUSH] CleanupWebSocket', t), clearInterval(t.o);
}),
(H5sRTCPush.prototype.connect = function (t, s, e, i, o, n) {
  (this.xt = t),
  (this.Qt = s),
  (this.jt = e),
  (this.Vt = i),
  (this.Kt = o),
  !0 === this.P &&
                console.log(
                  '[PUSH] videoin:',
                  t,
                  'codec:',
                  s,
                  'bitrate:',
                  e,
                  'resolution:',
                  i,
                  'audioin:',
                  o
                );
  let h;
  let c = 1280;
  let r = 720;
  i == 'QVGA'
    ? ((c = 320), (r = 240))
    : i == 'VGA'
      ? ((c = 640), (r = 480))
      : i == 'D1'
        ? ((c = 720), (r = 576))
        : i == '720P'
          ? ((c = 1280), (r = 720))
          : i == '1080P'
            ? ((c = 1920), (r = 1080))
            : i == '4K'
              ? ((c = 4096), (r = 2160))
              : i == '8K' && ((c = 7680), (r = 4320));
  let a = '';
  let l = !1;
  void 0 !== this.R.facingmode &&
            ((a = this.R.facingmode),
            !0 === this.P && console.log('[PUSH] facing mode:', a),
            (l = !0)),
  (h = this.R.audio == 'true' && { deviceId: { exact: o } });
  try {
    const s = {
      audio: h,
      video: l
        ? { facingMode: { exact: a }, width: { exact: c }, height: { exact: r } }
        : { deviceId: { exact: t }, width: { exact: c }, height: { exact: r } }
    };
    try {
      const d = this;
      n == 0
        ? navigator.mediaDevices
          .getUserMedia(s)
          .then((t) => {
            (d.at.srcObject = t), (d._t = t), d.dt(d.rt);
          })
          .catch((t) => {
            const s = `[PUSH] getUserMedia failed: ${t.name} ${t.message}`;
            alert(s);
          })
        : navigator.mediaDevices
          .getDisplayMedia({ video: !0 })
          .then((t) => {
            (d.at.srcObject = t), (d._t = t), d.dt(d.rt);
          })
          .catch((t) => {
            alert('[PUSH] getUserMedia failed:', `${t.name}: ${t.message}`);
          });
    } catch (t) {
      const u = `[PUSH] getUserMedia failed: ${err.name} ${err.message}`;
      return void alert(u);
    }
  } catch (t) {
    return void (!0 === this.P && console.log(t));
  }
}),
(H5sRTCPush.prototype.send = function (t, s) {
  const e = { type: 'message' };
  (e.user = this.rt), (e.token = t), (e.msg = s), this.s.send(JSON.stringify(e));
}),
(H5sRTCPush.prototype.disconnect = function () {
  if (
    (!0 === this.P && console.log('[PUSH] disconnect', this),
    (this.v = !0),
    clearInterval(this.kt),
    this.s != null && (this.s.close(), (this.s = null)),
    this.at && (this.at.src = ''),
    this.A)
  ) {
    try {
      this.A.close();
    } catch (t) {
      !0 === this.P && console.log(`[PUSH] close peer connection failed:${t}`);
    }
    this.A = null;
  }
  !0 === this.P && console.log('[PUSH] disconnect', this);
});
export {
  H5sPlayerWS,
  H5sPlayerHls,
  H5sPlayerRTC,
  H5sPlayerAudBack,
  H5sConference,
  H5sRTCPush,
  H5sRTCGetCapability
};
