/*
 * @Author: Kayson.Wan
 * @Date: 2022-11-14 15:46:13
 * @LastEditors: Kayson.Wan
 * @LastEditTime: 2022-11-14 16:15:59
 * @Description:
 */

import * as THREE from 'three';
import ThreeLoop from '../threeLoop';
import Rain from './rain/Rain';
import Snow from '../snow/Snow';

export default class Weather {
  threeJs = null;

  constructor(threejs) {
    this.threeJs = threejs;
  }

  snow = null;

  rain = null;

  #snow = null;

  #rain = null;

  /**
     * 添加天气
     * @param {string} type rain/snow/fog
     */
  addWeather = (type = '') => {
    if (!this.snow) {
      this.snow = new Snow();
    }
    if (!this.rain) {
      this.rain = new Rain(this.threeJs);
    }
    this.closeWeather();
    if (type === 'rain') {
      // // 下雨
      if (!this.#rain) {
        this.#rain = this.rain.addRain();
        this.#rain.scale.set(0.3, 0.3, 0.3);
        this.threeJs.threeScene.add(this.#rain);
      }
      this.#rain.visible = true;
    } else if (type === 'snow') {
      // 下雪
      if (!this.#snow) {
        this.#snow = this.snow.createPartical();
        this.threeJs.threeScene.add(this.#snow);
      }
      this.#snow.visible = true;
    } else if (type === 'fog') {
      // 雾
      this.threeJs.threeScene.fog = new THREE.Fog(
        new THREE.Color(5 / 255, 19 / 255, 38 / 255),
        0,
        1000
      ); // 0x001424
    }
  };

  /**
     * 关闭天气
     */
  closeWeather = () => {
    if (this.#rain) this.#rain.visible = false;
    if (this.#snow) this.#snow.visible = false;
    this.threeJs.threeScene.fog = null;
  };
}
