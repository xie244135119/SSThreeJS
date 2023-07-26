import * as THREE from 'three';
import DB from './db';
import MessageQueue from './MessageQueue';

export default class SSLoadManager {
  // share instance
  static shareInstance = new SSLoadManager();

  // loading manager
  threeLoadingManager = new THREE.LoadingManager();

  // message queue
  #messageQueue = new MessageQueue(5 * 1000);

  // progress html element
  #progressBgElement = null;

  // progress text element
  #progressTextElement = null;

  // progress element
  #progressElement = null;

  destory() {
    this.removeProgressView();
    this.#messageQueue.destory();
    this.#messageQueue = null;
  }

  constructor() {
    this.threeLoadingManager.setURLModifier((url) => url);
  }

  /**
   * loadding progress
   */
  addProgressView = (parentContainer = document.body) => {
    if (document.getElementById('threeloadingprogress')) {
      return;
    }
    const bgDiv = document.createElement('div');
    bgDiv.id = 'threeloadingprogress';
    bgDiv.style.height = '20px';
    bgDiv.style.borderRadius = '10px';
    bgDiv.style.border = '1px solid #00E8ff';
    bgDiv.style.padding = '1px';
    bgDiv.style.width = '15%';
    bgDiv.style.position = 'absolute';
    // bgDiv.style.bottom = '50%';
    bgDiv.style.bottom = '10%';
    bgDiv.style.left = '50%';
    bgDiv.style.transform = 'translateX(-50%)';
    bgDiv.style.transition = 'opacity 1s linear';
    bgDiv.style.opacity = 0;
    parentContainer.appendChild(bgDiv);
    this.#progressBgElement = bgDiv;

    const progress = document.createElement('div');
    progress.style.backgroundColor = '#2fa1d6';
    progress.style.maxWidth = '100%';
    progress.style.height = '100%';
    progress.style.borderRadius = '9px';
    bgDiv.appendChild(progress);
    this.#progressElement = progress;

    const textDiv = document.createElement('div');
    textDiv.innerText = '模型渲染中...';
    textDiv.style.position = 'absolute';
    textDiv.style.bottom = '100%';
    textDiv.style.color = '#2fa1d6';
    textDiv.style.width = '100%';
    textDiv.style.height = '30px';
    textDiv.style.lineHeight = '30px';
    textDiv.style.textAlign = 'center';
    textDiv.style.fontSize = '16px';
    bgDiv.appendChild(textDiv);
    this.#progressTextElement = textDiv;

    this.threeLoadingManager.onStart = (url, loaded, total) => {
      bgDiv.style.opacity = 1;
      textDiv.innerText = '模型渲染中...';
    };

    this.threeLoadingManager.onLoad = () => {
      bgDiv.style.opacity = 0;
    };

    this.threeLoadingManager.onProgress = (url, loaded, total) => {
      progress.style.width = `${(loaded / total) * 100}%`;
    };
    this.threeLoadingManager.onError = (url) => {
      bgDiv.style.opacity = 0;
    };
  };

  /**
   * remove progress
   */
  removeProgressView = () => {
    if (this.#progressBgElement) {
      this.#progressBgElement.remove();
    }
  };

  /**
   * download url
   */
  downloadUrl = (aUrl) =>
    fetch(aUrl, {
      method: 'GET'
    }).then((res) => {
      if (res.status === 200) {
        let blob = null;
        try {
          blob = res.arrayBuffer();
        } catch (error) {
          blob = res.blob();
        }
        return blob;
      }
      return Promise.reject(new Error('model fetch error'));
    });

  downloadUrl2 = async (aUrl = '', onProgress = () => {}) => {
    const response = await fetch(aUrl, {
      method: 'GET',
      headers: { responseType: 'arraybuffer' }
    });
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0; // 当前接收到了这么多字节
    const chunks = []; // 接收到的二进制块的数组（包括 body）
    let excuteLoop = true;
    let percent = 0;
    while (excuteLoop) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) {
        excuteLoop = false;
        onProgress?.(1, chunks);
        break;
      }

      chunks.push(value);
      receivedLength += value.length;
      percent += 0.01;
      percent = Math.min(percent, 0.99);
      onProgress?.(contentLength >= 0 ? percent : receivedLength / contentLength, chunks);
      // console.log(`Received ${receivedLength} of ${contentLength}`);
    }
    const chunksAll = new Uint8Array(receivedLength); // (4.1)
    let position = 0;
    chunks.forEach((chunk) => {
      chunksAll.set(chunk, position); // (4.2)
      position += chunk.length;
    });
    return chunksAll.buffer;
  };

  // /**
  //  * background queue
  //  */
  // addToDownloadQueue = (aUrl) => {
  //     if (this.#pendingDownloadFilePaths.indexOf(aUrl) !== -1) {
  //         return;
  //     }
  //     this.#pendingDownloadFilePaths.push(aUrl);

  //     // remove
  //     const removeQueue = (fileUrl = '') => {
  //         const findIndex = this.#pendingDownloadFilePaths.findIndex((item) => item === fileUrl);
  //         this.#pendingDownloadFilePaths.splice(findIndex, 1);
  //         this.#messageQueue.remove();
  //     };

  //     this.#messageQueue.add(() => {
  //         this.downloadUrl(aUrl)
  //             .then((res) => DB.shareInstance.insertModel(aUrl, res))
  //             .then((res) => {
  //                 const blobUrl = URL.createObjectURL(new Blob([res]));
  //                 this.#cacheFileBlobMap[aUrl] = blobUrl;
  //                 removeQueue(aUrl);
  //             })
  //             .catch((e) => {
  //                 console.log(` fetch ${aUrl} error `, e);
  //                 removeQueue(aUrl);
  //             });
  //     });
  //     // });
  // };

  /**
   * query model local path
   * @param {*} aUrl load url
   * @returns
   */
  getModelFilePathByUrl = (aUrl) => {
    if (aUrl.startsWith('data:') || aUrl.startsWith('blob:')) {
      return Promise.resolve(aUrl);
    }
    return DB.shareInstance.getModel(aUrl).then((res) => {
      // console.log(' getModelFilePathByUrl 获取到的数据信息 ', res);
      if (res) {
        const blobUrl = URL.createObjectURL(new Blob([res?.data]));
        return blobUrl;
      }
      return aUrl;
    });
  };

  /**
   * query model local path
   * @param {*} aUrl load url
   * @returns
   */
  getModelDataByUrl = (aUrl) =>
    DB.shareInstance.getModel(aUrl).then((res) => {
      if (res) {
        return res.data;
      }
      return this.downloadUrl2(aUrl, (percent) => {
        if (this.#progressBgElement) {
          this.#progressBgElement.style.opacity = 1;
        }
        if (this.#progressTextElement) {
          this.#progressTextElement.innerText = '模型下载中...';
        }
        if (this.#progressElement) {
          this.#progressElement.style.width = `${percent * 100}%`;
        }
      }).then((datares) => {
        DB.shareInstance.insertModel(aUrl, datares);
        return datares;
      });
    });
}
