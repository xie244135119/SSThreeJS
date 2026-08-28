/*
 * Author  hailie.pan
 * Date  2023-08-12 10:33:10
 * LastEditors  Murphy.xie
 * LastEditTime  2024-10-07 10:39:18
 * Description  机器人摄像头组件
 */
import React, { useEffect, useState } from 'react';
// import H5Stream from '@/js/h5s/h5stream';
import PerspectiveControl from './PerspectiveControl';
import styles from './RobotCamera.module.less';
import iconJiaoJUJia from './assets/icon-jiaoju-jia.png';
import iconJiaoJUJian from './assets/icon-jiaoju-jian.png';
import iconDuiJiaoJia from './assets/icon-duijiao-jia.png';
import iconDuiJiaoJian from './assets/icon-duijiao-jian.png';

const ActionList = [
  {
    name: '焦距 +',
    icon: iconJiaoJUJia
  },
  {
    name: '焦距 -',
    icon: iconJiaoJUJian
  },
  {
    name: '对焦 +',
    icon: iconDuiJiaoJia
  },
  {
    name: '对焦 -',
    icon: iconDuiJiaoJian
  }
];

export default function RobotCamera() {
  useEffect(() => {
    // // 机器人的视频流
    // let stream = new H5Stream('robotvideo', window.ENV.h5sHost);
    // stream.session = '';
    // stream.token = '';
    // stream.play();
    // return () => {
    //   stream.destory();
    //   stream = null;
    // };
  }, []);

  return (
    <div className={styles.robotCameraWrap}>
      {/* <img src={video} alt="" width="100%" height="100%" /> */}
      <video id="robotvideo" style={{ width: '100%', height: '100%', border: '1px solid red' }} />

      {/* 控制按钮 */}
      <PerspectiveControl
        className={styles.Perspective}
        onSelect={(e) => {
          console.log(' 机器选中控制 ', e);
        }}
        onDeselect={(e) => {
          console.log(' 机器取消选中控制 ', e);
        }}
      />

      <div className={styles.ControlBtn}>
        {ActionList.map((item) => (
          <div
            className={`${styles.btnItem}`}
            key={item.name}
            onPointerUp={() => {
              s;
            }}
          >
            <img src={item.icon} alt="" />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
