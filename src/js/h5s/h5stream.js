/*
 * Author  Kayson.Wan
 * Date  2024-08-05 11:08:36
 * LastEditors  Giuly.Zhang
 * LastEditTime  2025-10-09 18:30:32
 * Description h5 stream 摄像头视频流
 */

import { H5sPlayerAudBack, H5sPlayerWS } from './core/h5splayer';

// 单次直播最大观看时长（秒）
const H5S_MAX_WATCH_SECONDS = -600;

export default class H5Stream {
  /**
   * video dom
   * @type {HTMLVideoElement}
   */
  videoDom = null;

  /**
   * 播放器 Host
   * @type {string}
   */
  playerHost = null;

  /**
   * ws player播放器
   * @type {H5sPlayerWS}
   */
  playerWSObj = null;

  /**
   * 语音对讲对象
   * @type {H5sPlayerAudBack}
   */
  playerAudObj = null;

  /**
   * 开始播放的时候
   * @type {function (Event) : void}
   */
  onPlayStart = null;

  /**
   * 开始播放的时候
   * @type {function (Event) : void}
   */
  onPlay = null;

  /**
   * 播放出错
   * @type {function (Event) : void}
   */
  onPlayError = null;

  // 基础配置
  _baseConfig = null;

  /**
   * 音量
   * @type {number}
   */
  _volume = null;

  /**
   * 最长观看时长计时器
   * @type {number | null}
   */
  _maxWatchTimer = null;

  /**
   *
   * @param {string | HTMLVideoElement} aVideo video标签或者videoId
   * @param {string} host
   */
  constructor(aVideo, host, { begintime, endtime } = {}) {
    if (aVideo instanceof HTMLVideoElement) {
      this.videoDom = aVideo;
    } else if (aVideo instanceof String) {
      this.videoDom = document.getElementById(aVideo);
    }
    // console.log(' h5s stream videodom ', aVideo, this.videoDom);
    this.playerHost = host;

    this._baseConfig = {
      // videoid: this.videoDomId,
      videodom: this.videoDom,
      protocol: 'http:',
      host: this.playerHost,
      rootpath: '/',
      token: null,
      // {string} - stream profile, main/sub or other predefine transcoding profile
      streamprofile: 'main',
      // v1 is for ts, v2 is for fmp4
      hlsver: 'v1',
      // session got from login
      session: null,
      // 'true' or 'false' enable/disable console.log
      consolelog: 'false'
    };

    let pbConfig = null;
    console.log('time', begintime, endtime);

    if (begintime && endtime) {
      pbConfig = {
        begintime,
        endtime,
        autoplay: 'true', // 'true'代表自动播放
        showposter: 'true', // 'true' 代表显示 poster
        serverpb: 'false', // 'true' or 'false' playback from h5stream record, default false
        // filename: 'token1.mp4', // file name need to playback (begintime == 0 & endtime == 0 and serverpb is true)
        callback: (event) => {
          try {
            const msgEvent = JSON.parse(event);
            playback?.(msgEvent);
          } catch (error) {
            //
          }
        }, // 回调函数，形如 {function}(event(string), userdata(object))
        userdata: {} // 回调参数
      };
    }
    if (pbConfig) {
      this._baseConfig.pbconf = pbConfig;
    }
  }

  /**
   * 移除加载
   */
  destory = () => {
    this._clearMaxWatchTimer();
    if (this.videoDom) {
      this.videoDom.removeEventListener('play', this.onPlay);
      this.videoDom.removeEventListener('error', this.onPlayError);
    }
    this._baseConfig = null;
    this.token = null;
    this.session = null;
    if (this.playerWSObj) {
      this.playerWSObj.disconnect();
      this.playerWSObj = null;
    }
    if (this.playerAudObj) {
      this.playerAudObj.disconnect();
      this.playerAudObj = null;
    }
  };

  /**
   * 播放器播放
   */
  play = () => {
    this._clearMaxWatchTimer();
    if (this.videoDom) {
      this.videoDom.muted = false;
      this.videoDom.volume = 0;
      this.videoDom.playsInline = true;
      this.videoDom.addEventListener('play', this.onPlay);
      this.videoDom.addEventListener('error', this.onPlayError);
    }
    this.onPlayStart?.();
    this.playerWSObj = new H5sPlayerWS(this._baseConfig);
    this.playerWSObj.connect();
    this._startMaxWatchTimer();
  };

  /**
   * 开始最长观看时长计时
   */
  _startMaxWatchTimer = () => {
    if (!H5S_MAX_WATCH_SECONDS || H5S_MAX_WATCH_SECONDS <= 0) {
      return;
    }
    this._maxWatchTimer = window.setTimeout(() => {
      if (this.playerWSObj) {
        this.playerWSObj.disconnect();
        this.playerWSObj = null;
      }
      this._clearMaxWatchTimer();
    }, H5S_MAX_WATCH_SECONDS * 1000);
  };

  /**
   * 清理最长观看时长计时
   */
  _clearMaxWatchTimer = () => {
    if (this._maxWatchTimer !== null) {
      window.clearTimeout(this._maxWatchTimer);
      this._maxWatchTimer = null;
    }
  };

  /**
   * 开始语音对讲
   */
  startTalk = () => {
    this.playerAudObj = new H5sPlayerAudBack(this._baseConfig);
    this.playerAudObj.connect();
    console.log(' playerAudObj ', this.playerAudObj);
  };

  /**
   * 结束语音对讲
   */
  stopTalk = () => {
    if (this.playerAudObj) {
      this.playerAudObj.disconnect();
      delete this.playerAudObj;
      this.playerAudObj = undefined;
      // this.playerAudObj = null;
    }
  };

  set token(text) {
    if (this._baseConfig) {
      this._baseConfig.token = text;
    }
  }

  set session(text) {
    if (this._baseConfig) {
      this._baseConfig.session = text;
    }
  }

  /**
   * 设置音量
   */
  set volume(number) {
    this._volume = Math.min(Math.max(0, number), 1);
    if (this.videoDom) {
      this.videoDom.volume = this._volume;
      console.log(' 当前音量 ', this.videoDom.volume);
    }
  }

  /**
   * 获取音量
   */
  get volume() {
    return this._volume;
  }
}
