export default class SSFile {
  /**
   * 导出json 文件
   * @param {*} aJsonObject json结构数据
   * @param {*} aFileName 文件名称
   */
  static exportJson = (aJsonObject = {}, aFileName = '') => {
    try {
      const jsonData = JSON.stringify(aJsonObject);
      const blob = new Blob([jsonData], { type: 'text/json' });
      this.download(blob, aFileName);
    } catch (error) {
      //   console.log(' 文件导出数据 ', error);
    }
  };

  /**
   * 下载文件
   * @param {*} url 下载的地址
   * @param {*} savename 保存的文件名
   */
  static download = (url, savename) => {
    let newUrl = url;
    if (typeof url === 'object' && url instanceof Blob) {
      newUrl = URL.createObjectURL(url);
    }

    const alink = document.createElement('a');
    alink.href = newUrl;
    alink.download = savename;
    let event;
    if (window.PointerEvent) {
      event = new PointerEvent('click');
    }
    alink.dispatchEvent(event);
  };
}
