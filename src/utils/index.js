/*
 * Author  xie244135119
 * Date  2023-04-11 18:00:50
 * LastEditors  xie244135119
 * LastEditTime  2023-06-08 15:55:19
 * Description
 */
/**
 * 防抖函数
 * @param {*} fn
 * @param {*} wait
 * @param {*} immediate 是否立刻执行
 * @returns
 */
function debounce(fn, wait = 50, immediate = false) {
  let timer;
  return function block() {
    if (immediate) {
      fn.apply(this);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this);
    }, wait);
  };
}

/**
 * 节流
 * @param {*} fn
 * @param {*} wait
 * @returns
 */
function throttle(fn, wait = 300) {
  let prev = new Date();
  return function block() {
    // const args = arguments;
    const now = new Date();
    if (now - prev > wait) {
      fn.apply(this);
      prev = new Date();
    }
  };
}

/**
 * color 二进制转化
 * @param {*} hex
 * @param {*} opacity
 * @returns
 */
function hexToRgba(hex, opacity = 1) {
  return `rgba(${parseInt(`0x${hex.slice(1, 3)}`, 10)},${parseInt(
    `0x${hex.slice(3, 5)}`,
    10
  )},${parseInt(`0x${hex.slice(5, 7)}`, 10)},${opacity})`;
}

export default {
  debounce,
  throttle,
  hexToRgba
};
