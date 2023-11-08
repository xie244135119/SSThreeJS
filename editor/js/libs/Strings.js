export default class Strings {
  _localeJson = null;

  /**
   * 应用某种格式文件
   * @param {*} json
   */
  use = (json) => {
    this._localeJson = json;
  };

  getKey = (key) => this._localeJson?.[key] || key;
}
