type SSLoopFn = (e?: any) => void;

interface SSLoopItem {
  uuid: string | Symbol;
  fn: SSLoopFn;
  interval?: number;
  lastTime?: number;
}

export default class SSThreeLoop {
  static renderLoopList: SSLoopItem[] = [];
  // is render
  static isRenderLoop = false;
  // is destory
  static isLoopDestory = false;
  // render handle
  static animateRenderRef = null;

  /**
   * @description setup
   */
  static setup = () => {
    this.isLoopDestory = false;
    this.isRenderLoop = false;
    this.renderLoopList = [];
    this.animateRenderRef = null;
  };

  /**
   * @description destory
   */
  static destory = () => {
    this.isLoopDestory = true;
    this.isRenderLoop = false;
    window.cancelAnimationFrame(this.animateRenderRef);
    this.renderLoopList = null;
  };

  /**
   * @description add new loop event
   * @param fn 执行函数
   * @param identifier 标识
   * @param interval 间隔时间 默认一帧 可选时间单位 ms
   * @returns
   */
  static add = (fn: SSLoopFn, identifier?: string, interval?: number) => {
    if (this.isLoopDestory) {
      return null;
    }
    if (!fn) {
      return null;
    }
    const isExist = this.renderLoopList.find((item) => item.uuid === identifier);
    if (isExist) {
      return '';
    }
    let uniqeid: string | Symbol = identifier || Symbol('render frame');
    this.renderLoopList.push({
      uuid: uniqeid,
      fn,
      interval
    });
    if (!this.isRenderLoop) {
      this.render();
    }
    return uniqeid;
  };

  /**
   * @description delete event
   * @param {string | Symbol} identifier 标识符
   */
  static removeId = (identifier) => {
    this.removeIds([identifier]);
  };

  /**
   * delete identifer
   * @param {Array<string | Symbol>} identifier string 标识符
   */
  static removeIds = (identifiers: (string | Symbol)[]) => {
    if (this.renderLoopList) {
      identifiers.forEach((e) => {
        const findIndex = this.renderLoopList.findIndex((item) => item.uuid === e);
        if (findIndex !== -1) {
          this.renderLoopList.splice(findIndex, 1);
        }
      });
    }
  };

  /**
   * render frame
   */
  static render = () => {
    if (this.isRenderLoop) return;
    this.isRenderLoop = true;
    const multiUpdate = () => {
      if (this.renderLoopList.length === 0) {
        return false;
      }
      for (let index = 0; index < this.renderLoopList.length; index++) {
        const element = this.renderLoopList[index];
        if (element.interval) {
          if (element.lastTime) {
            if ((performance.now() - element.lastTime) >= element.interval) {
              element.fn?.();
              element.lastTime = performance.now();
            }
          } else {
            element.fn?.();
            element.lastTime = performance.now();
          }
          continue;
        }
        element.fn?.();
      }
      return true;
    };

    const animateFrame = () => {
      if (this.isLoopDestory) {
        return;
      }
      const update = multiUpdate();
      if (update) {
        this.animateRenderRef = window.requestAnimationFrame(animateFrame);
      } else {
        this.isRenderLoop = false;
        window.cancelAnimationFrame(this.animateRenderRef);
      }
    };
    this.animateRenderRef = window.requestAnimationFrame(animateFrame);
  };
}
