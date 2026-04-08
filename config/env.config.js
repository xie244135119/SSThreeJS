/*
 * Author  Kayson.Wan
 * Date  2023-06-08 17:53:40
 * LastEditors  Kayson.Wan
 * LastEditTime  2026-04-08 18:23:38
 * Description
 */
window.ENV = (() => ({
  // runtime config
  WEB_VERSION: 'v1.0.0',
  // runtime console
  console: true,
  DEBUG: false
  //
}))();

if (window.ENV.console === false) {
  console.log = function (oriLogFunc) {
    return function () {
      // eslint-disable-next-line prefer-rest-params
      oriLogFunc.apply(this, arguments);
    };
  };
}
