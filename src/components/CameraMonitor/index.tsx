/*
 * Author  Murphy.xie
 * Date  2021-08-12 14:50:22
 * LastEditors  Giuly.Zhang
 * LastEditTime  2025-10-09 18:37:44
 * Description 监控视频窗口
 */

import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useRecoilValue } from 'recoil';
import styles from './index.module.less';
import H5sStreamJs from '@/js/h5s/h5stream';
import api from '@/services/api';
import CloseIcon from './assets/index_camera_close.png';
import ZoomIcon from './assets/index_camera_zoom.png';
import VideoTalkIcon from './assets/index_camera_videotalk.png';
import PerspectiveControl from './PerspectiveControl';
import RecoilConstVars from '@/stores/RecoilConstVars';
import TimeRuler from '@/components/TimeRuler';
import dayjs from 'dayjs';

interface Props {
  /**
   * css 样式
   */
  className?: string;
  style?: React.CSSProperties;
  // 数据对象信息
  data?: {
    h5s_token?: string;
    h5sToken?: string;
    stationId?: string;
    cameraNameEn?: string;
    nameEn?: string;
    rtspUrl?: string;
    isVideo?: number;
  };
  /**
   * 摄像头名称
   */
  title?: string;
  /**
   * 放大模式下
   */
  transformOrigin?:
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright'
    | 'topright1'
    | 'bottomright1';
  /**
   * 放大倍数
   */
  transformScale?: number;
  /**
   * 放大
   */
  zoom?: boolean;
  /**
   * 使用全屏模式（当为 true 时，点击放大使用 video 元素的 requestFullscreen API）
   */
  useFullscreen?: boolean;
  /**
   *
   */
  showBig?: boolean;
  /**
   * 外部指定初始/当前尺寸模式；大窗内可直接传 big 展示控制组件
   */
  sizeMode?: 'default' | 'big';
  /**
   * 填满父容器，适用于九宫格或弹窗容器
   */
  fitContainer?: boolean;
  /**
   * 是否展示视频流回放日期选择器
   * 暂时全局隐藏回放，需要时再显式传 true
   */
  showPlayback?: boolean;
}

export default function Camera(props: Props) {
  const { t } = useTranslation();
  const {
    showBig = true,
    showPlayback = false,
    style = {},
    fitContainer = false
  } = props;
  // console.log(props);
  // 视频 加载中
  const [videoLoadingObj, setVideoLoadingObj] = useState({
    visible: false,
    text: t('视频流加载中...')
  });
  // 语音对讲状态
  const [voiceIntercoming, setVoiceIntercoming] = useState(false);
  // 父类dom引用
  const bgDomRef = useRef<HTMLDivElement>();
  // 视频父类 dom引用
  const videoParentDomRef = useRef<HTMLDivElement>();
  // 头部 dom引用
  const headerDomRef = useRef<HTMLDivElement>();
  // 放大模式
  const [sizeMode, setSizeMode] = useState<'default' | 'big'>(props.sizeMode || 'default');
  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  // h5sref
  const h5sRef = useRef<H5sStreamJs>();
  // 音量引用
  const volumeTimerRef = useRef<NodeJS.Timeout>();
  // video dom Ref
  const videoDomRef = useRef<HTMLVideoElement>();
  // 摄像头session
  const h5sSession = useRecoilValue(RecoilConstVars.H5sSession);

  // 选中的日期
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();

  // type:camera robot
  // cameraType:可见光vl_cam 红外 ir_cam
  const normalizeCameraData = (data: Props['data'] = {}) => {
    const rawToken = data.h5s_token || data.h5sToken || '';
    let token = rawToken;
    if (rawToken && data.isVideo !== 1 && data.rtspUrl !== 'H5_STREAM') {
      if (data.rtspUrl === 'H5_DEV_HIK' && !rawToken.endsWith('--1')) {
        token = `${rawToken}--1`;
      } else if (data.rtspUrl === 'H5_DEV_DH' && !rawToken.endsWith('--0')) {
        token = `${rawToken}--0`;
      }
    }
    return {
      ...data,
      h5s_token: token,
      cameraNameEn: data.cameraNameEn || data.nameEn || ''
    };
  };

  const cameraData = normalizeCameraData(props.data);
  const {
    stationId,
    h5s_token
  } = cameraData;

  useEffect(() => {
    if (props.sizeMode) {
      setSizeMode(props.sizeMode);
    }
  }, [props.sizeMode]);

  useEffect(() => {
    if (!(h5s_token && h5sSession)) {
      if (h5sRef.current) {
        h5sRef.current.destory();
        h5sRef.current = null;
      }
      return;
    }
    onReset();

    const time = {};
    console.log('startTime', startTime);
    console.log('endTime', endTime);
    try {
      if (startTime && endTime) {
        const sTimeISO = dayjs(startTime).toISOString();
        const eTimeISO = dayjs(endTime).toISOString();
        time.begintime = sTimeISO;
        time.endtime = eTimeISO;

        if (sizeMode !== 'big') {
          delete time.begintime;
          delete time.endtime;
          setStartTime('');
          setEndTime('');
        }
        console.log('++++++', sTimeISO, eTimeISO);
      }
    } catch (error) {
      console.error('时间格式转换错误:', error);
    }

    const stream = new H5sStreamJs(videoDomRef.current, window.ENV.h5sHost, time);
    h5sRef.current = stream;
    stream.session = h5sSession;
    stream.token = cameraData.h5s_token;
    // temp test
    // stream.session = '1d71e7ea-2c6b-4ca8-83ae-b7e2161a7262';
    // stream.token = '662e--35';

    stream.onPlayStart = () => {
      setVideoLoadingObj({
        visible: true,
        text: t('视频流加载中...')
      });
    };
    stream.onPlay = () => {
      setVideoLoadingObj({
        visible: false,
        text: t('视频流加载中...')
      });
    };
    stream.onPlayError = () => {
      setVideoLoadingObj({
        visible: true,
        text: t('视频流加载中...')
      });
    };
    stream.play();
    return () => {
      stream.destory();
    };
  }, [h5s_token, h5sSession, startTime, endTime, sizeMode]);

  useEffect(() => {
    let observer = new ResizeObserver(() => {
      if (fitContainer) {
        videoParentDomRef.current.style.width = '100%';
        videoParentDomRef.current.style.height = '100%';
        bgDomRef.current.style.height = '100%';
        return;
      }
      const width = bgDomRef.current?.offsetWidth;
      const height = (width * 9) / 16;
      videoParentDomRef.current.style.width = `${width}px`;
      videoParentDomRef.current.style.height = `${height}px`;
      bgDomRef.current.style.height = `${height + (headerDomRef.current?.offsetHeight || 0)}px`;
    });
    observer.observe(bgDomRef.current);
    return () => {
      observer.disconnect();
      observer = null;
      clearInterval(volumeTimerRef.current);
    };
  }, [fitContainer]);

  const onCameraControl = (operation = 'top', stopFlag = 0, data = cameraData) => {
    // 控制类型 1：上仰 2：下俯 3：左转 4：右转 5：焦距变大 6：焦距变小
    const typeDict = {
      top: 1,
      bottom: 2,
      left: 3,
      right: 4,
      near: 5,
      far: 6
    };
    const params = {
      stationId,
      nameEn: data.cameraNameEn,
      controlType: typeDict[operation],
      stopFlag
    };
    if (['near', 'far'].includes(operation)) {
      api.cameraManager.Camera.cameraControl(params);
    } else {
      api.cameraManager.Camera.cameraControl(params);
    }
  };

  // /**
  //  *
  //  * @param {*} operation 上下左右 near far
  //  * @param {*} cameraType 可见光vl_cam 红外 ir_cam
  //  */
  // const onRobotControl = (operation) => {
  //   const robtId = window.ENV.robot110kV.robotId;
  //   if (['FOCUS_INCREACE', 'FOCUS_REDUCE'].includes(operation)) {
  //     const params = {
  //       cameraId: window.ENV.robot110kV.cameraId,
  //       command: operation,
  //       control: {
  //         speed: 2
  //       }
  //     };
  //     api.camera.patrolCameraControl(robtId, params);
  //   } else {
  //     const controlMap = {
  //       top: 'TURN_UP',
  //       bottom: 'TURN_DOWN',
  //       left: 'TURN_LEFT',
  //       right: 'TURN_RIGHT'
  //     };
  //     const params = {
  //       command: controlMap[operation],
  //       speed: 2,
  //       ptzName: cameraType
  //     };
  //     api.camera.patrolYTControl(robtId, params);
  //   }
  // };

  /**
   * 音量控制
   */
  const onVolumeControl = (operation = '+', stopFlag = 0) => {
    if (stopFlag === 1) {
      clearInterval(volumeTimerRef.current);
    } else {
      volumeTimerRef.current = setInterval(() => {
        const scale = 0.05;
        if (operation === '+') {
          h5sRef.current.volume += scale;
        } else {
          h5sRef.current.volume -= scale;
        }
      }, 0.2 * 1000);
    }
  };

  /**
   * 摄像头重置
   */
  const onReset = () => {
    setVideoLoadingObj({
      visible: true,
      text: t('视频流加载中...')
    });
    videoDomRef.current.poster = '';
    videoDomRef.current.src = '';
  };

  useEffect(() => {
    const { transformScale } = props;
    const bigWidth = 650;
    // console.log('sizeMode :>> ', sizeMode);
    if (sizeMode === 'big') {
      // 放大的比例
      const finalwidth = videoParentDomRef.current.offsetWidth * transformScale;
      const finalheight = videoParentDomRef.current.offsetHeight * transformScale;
      let left = 0;
      let top = 0;
      switch (props.transformOrigin) {
        case 'topright':
          left = videoParentDomRef.current.offsetWidth - finalwidth;
          top = 0;
          break;
        case 'topright1':
          left = videoParentDomRef.current.offsetWidth - finalwidth + bigWidth;
          top = 0;
          break;
        case 'topleft':
          left = 0;
          top = 0;
          break;
        case 'bottomright':
          left = videoParentDomRef.current.offsetWidth - finalwidth;
          top = videoParentDomRef.current.offsetHeight - finalheight;
          break;
        case 'bottomright1':
          left = videoParentDomRef.current.offsetWidth - finalwidth + bigWidth;
          top = videoParentDomRef.current.offsetHeight - finalheight;
          break;
        case 'bottomleft':
          left = 0;
          top = videoParentDomRef.current.offsetHeight - finalheight;
          break;

        default:
          break;
      }
      videoParentDomRef.current.style.position = 'absolute';
      // 左侧平移
      videoParentDomRef.current.style.left = `${left}px`;
      // 右侧平移
      videoParentDomRef.current.style.top = `${top + (headerDomRef.current?.offsetHeight || 0)}px`;
      videoParentDomRef.current.style.width = `${finalwidth}px`;
      videoParentDomRef.current.style.height = `${finalheight}px`;
      videoParentDomRef.current.style.zIndex = '10';
    } else {
      const { offsetWidth, offsetHeight } = videoParentDomRef.current;
      videoParentDomRef.current.style.position = 'relative';
      videoParentDomRef.current.style.left = 'unset';
      videoParentDomRef.current.style.top = 'unset';
      videoParentDomRef.current.style.width = `${offsetWidth / transformScale}px`;
      videoParentDomRef.current.style.height = `${offsetHeight / transformScale}px`;
      videoParentDomRef.current.style.zIndex = '1';
    }
  }, [sizeMode]);

  // 处理全屏功能
  const handleFullscreen = async () => {
    if (!videoDomRef.current) return;

    try {
      if (!isFullscreen) {
        // 进入全屏
        if (videoDomRef.current.requestFullscreen) {
          await videoDomRef.current.requestFullscreen();
        } else if ((videoDomRef.current as any).webkitRequestFullscreen) {
          // Safari
          await (videoDomRef.current as any).webkitRequestFullscreen();
        } else if ((videoDomRef.current as any).mozRequestFullScreen) {
          // Firefox
          await (videoDomRef.current as any).mozRequestFullScreen();
        } else if ((videoDomRef.current as any).msRequestFullscreen) {
          // IE/Edge
          await (videoDomRef.current as any).msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      // 如果退出全屏，同步更新 sizeMode
      if (!isCurrentlyFullscreen && sizeMode === 'big' && props.useFullscreen) {
        setSizeMode('default');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [sizeMode, props.useFullscreen]);

  const handleTimeSelect = (time) => {
    const sTimeTmp = dayjs()
      .set('year', selectedDate.year())
      .set('month', selectedDate.month())
      .set('date', selectedDate.date())
      .set('hour', time.hours)
      .set('minute', time.minutes)
      .set('second', 0);

    const eTimeTmp = sTimeTmp.endOf('day');

    setStartTime(sTimeTmp);
    setEndTime(eTimeTmp);

    // 将时间格式转换为ISO 8601格式
    const sTimeISO = dayjs(sTimeTmp).toISOString();
    const eTimeISO = dayjs(eTimeTmp).toISOString();

    console.log('startTime (ISO 8601):>> ', sTimeISO);
    console.log('endTime (ISO 8601):>> ', eTimeISO);
  };

  const { title } = props;
  return (
    <div
      ref={bgDomRef}
      className={classNames(styles.background, props.className)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={style}
    >
      {title && (
        <div ref={headerDomRef} className={styles.headerTitle}>
          <span style={{ margin: '0 12px' }}>{title}</span>
        </div>
      )}
      {/* 视频展示 */}
      <div ref={videoParentDomRef} className={classNames(styles.contentview)}>
        {/* 放大做小 */}
        {props.zoom && (
          <div
            className={styles.zoomIcon}
            onClick={async () => {
              if (props.useFullscreen) {
                // 使用全屏 API
                await handleFullscreen();
              } else {
                // 原有的放大功能
                console.log('sizeMode :>> ', sizeMode);
                setSizeMode(sizeMode === 'big' ? 'default' : 'big');
              }
            }}
          >
            <img src={isFullscreen || sizeMode === 'big' ? CloseIcon : ZoomIcon} />
          </div>
        )}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={styles.contentCorner} />
        ))}
        {/* 监控视频 */}
        <video ref={videoDomRef} className={styles.videoview} muted autoPlay />
        {videoLoadingObj.visible && (
          <span className={styles.loadingtext}>{videoLoadingObj.text}</span>
        )}
        {sizeMode === 'big' && showBig && (
          <>
            {/* 方向控制盘 */}
            <PerspectiveControl
              className={styles.perspectivecontrol}
              onSelect={(e) => {
                // if (type === 'robot') {
                //   onRobotControl(e);
                //   return;
                // }
                onCameraControl(e, 0);
              }}
              onDeselect={(e) => {
                // if (type === 'robot') {
                //   return;
                // }
                onCameraControl(e, 1);
              }}
            />
            {/* 时间轴刻度尺 */}
            {/* <div className={styles.timeRulerContainer}>
              <TimeRuler onTimeSelect={handleTimeSelect} />
            </div> */}
            {/* 底部控制按钮 */}
            <div className={styles.operationview}>
              <div
                className={styles.btnItem}
                onPointerDown={() => {
                  onVolumeControl('+', 0);
                }}
                onPointerUp={() => {
                  onVolumeControl('+', 1);
                }}
              >
                {t('音量')} +
              </div>
              <div
                className={styles.btnItem}
                onPointerDown={() => {
                  onVolumeControl('-', 0);
                }}
                onPointerUp={() => {
                  onVolumeControl('-', 1);
                }}
              >
                {t('音量')} -
              </div>
              <div
                className={styles.btnItem}
                onPointerDown={() => {
                  // 区分视频摄像头和机器人摄像头
                  // if (type === 'robot') {
                  //   onRobotControl('FOCUS_INCREACE');
                  //   return;
                  // }
                  onCameraControl('near');
                }}
                onPointerUp={() => {
                  // if (type === 'robot') {
                  //   return;
                  // }
                  onCameraControl('near', 1);
                }}
              >
                {t('放大')}
              </div>
              <div
                className={styles.btnItem}
                onPointerDown={() => {
                  // 区分视频摄像头和机器人摄像头
                  // if (type === 'robot') {
                  //   onRobotControl('FOCUS_REDUCE');
                  //   return;
                  // }
                  onCameraControl('far', 0);
                }}
                onPointerUp={() => {
                  // if (type === 'robot') {
                  //   return;
                  // }
                  onCameraControl('far', 1);
                }}
              >
                {t('缩小')}
              </div>
              {showPlayback && (
                <DatePicker
                  onChange={(date) => {
                    setSelectedDate(dayjs(date));
                    // setStartTime(dayjs(date).startOf('day'));
                    // setEndTime(dayjs(date).endOf('day'));
                  }}
                  placeholder={t('视频流回放')}
                  style={{ width: '300px' }}
                  size="small"
                  allowClear={false}
                  popupClassName={styles.datePickerPopup}
                />
              )}
              {/* <Tooltip title={voiceIntercoming ? '关闭语音对讲' : '打开语音对讲'}>
                <div
                  className={classNames(styles.talkview, voiceIntercoming && styles.talkviewactive)}
                  onPointerUp={() => {
                    if (!voiceIntercoming) {
                      GlobalSignals.destorySpeech.dispatch();
                      h5sRef.current.startTalk();
                    } else {
                      h5sRef.current.stopTalk();
                      GlobalSignals.createSpeech.dispatch();
                    }
                    setVoiceIntercoming(!voiceIntercoming);
                  }}
                >
                  <img src={VideoTalkIcon} />
                </div>
              </Tooltip> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Camera.defaultProps = {
  data: {},
  transformOrigin: 'bottomright',
  transformScale: 3,
  zoom: true
};
