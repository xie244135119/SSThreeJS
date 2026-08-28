/*
 * Author  Murphy.xie
 * Date  2021-08-12 14:50:22
 * LastEditors  Murphy.xie
 * LastEditTime  2023-07-21 13:15:43
 * Description 监控视频窗口
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import ModalWindow from '@/components/AssemblyCustom/ModalWindow'
import styles from './modal.module.less';
// 相关icon
import CameraIcon from './assets/icon_camera.svg';
import CloseIcon from './assets/common_close.svg';

export default class Index extends Component {
  static propTypes = {
    // 关闭事件
    onClose: PropTypes.func,
    //
    className: PropTypes.string,
    style: PropTypes.object,
    // 播放的视频url
    // data: PropTypes.string,
    // 播放的视频流地址
    src: PropTypes.string,
    //
    title: PropTypes.string
  };

  static defaultProps = {
    //
    // data: '',
    title: '监控视频',
    src: ''
  };

  componentDidMount() {
    // setTimeout(() => {
    //     this.onWebrtcPlay()
    // }, 1 * 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const checkKeys = ['title', 'src'];
    const check = checkKeys.some((item) => nextProps[item] != this.props[item]);
    if (check) {
      return true;
    }
    return false;
  }

  // /**
  //   *
  //   * @returns
  // */
  // onWebrtcPlay = () => {
  //     const { requestConfig = {} } = window.ENV;
  //     const { src } = this.props;
  //     const videoRef = document.getElementById(`repotvideo_${src}`);
  //     var url = requestConfig.cameraStream + src;
  //     var player = new window.JSWebrtc.Player(url, {
  //         video: videoRef,
  //         autoplay: true,
  //         onPlay: (obj) => { console.log("start play", obj) }
  //     });
  //     // console.log(' webrtc player webrtcUrl', webrtcUrl);
  //     player.play();
  // }

  render() {
    const { onClose, title, src } = this.props;
    return (
      <div className={classNames(styles.background, this.props.className)} style={this.props.style}>
        {/* 头部信息 */}
        {/* <div className={styles.headerview}>
                <img className={styles.cameraicredon} src={CameraIcon} />
                <span className={styles.title}>{title}</span>
                <img className={styles.closeicon} src={CloseIcon} onClick={onClose} />
            </div> */}
        {/* 视频展示 */}
        <div className={styles.contentview}>
          {/* <img className={styles.photo} src={cameraExampleIcon} /> */}
          <video muted id={`repotvideo_${src}`} autoPlay style={{ width: '100%', height: '100%', objectFit: 'fill' }}>
            {/* <source src={src || VideoMp4} /> */}
          </video>
        </div>
      </div>
    );
  }
}

// 录屏视频播放
export class AssemblyVideoModal extends Component {
  static propTypes = {
    // 关闭事件
    onClose: PropTypes.func,
    //
    className: PropTypes.string,
    style: PropTypes.object,
    // 播放的视频流地址
    src: PropTypes.string,
    //
    title: PropTypes.string
  };

  static defaultProps = {
    //
    title: '监控视频',
    src: ''
  };

  componentDidMount() {
    // setTimeout(() => {
    //     this.onWebrtcPlay()
    // }, 1 * 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const checkKeys = ['title', 'src'];
    const check = checkKeys.some((item) => nextProps[item] != this.props[item]);
    if (check) {
      return true;
    }
    return false;
  }

  render() {
    const { onClose, title, src } = this.props;
    console.log(' 当前视频地址 ', src);
    return (
      <div className={classNames(styles.videobackground, this.props.className)} style={this.props.style}>
        {/* 头部信息 */}
        <div className={styles.headerview}>
          <img className={styles.cameraicredon} src={CameraIcon} />
          <span className={styles.title}>{title}</span>
          <img className={styles.closeicon} src={CloseIcon} onClick={onClose} />
        </div>
        {/* 视频展示 */}
        <div className={styles.contentview}>
          <video muted autoPlay style={{ width: '100%', height: '100%', objectFit: 'fill' }}>
            <source src={src} />
          </video>
        </div>
      </div>
    );
  }
}
