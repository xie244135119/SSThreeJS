export default class SSThreeLoop {
  static renderLoopList = [];
  // is render
  static isRenderLoop = false;
  // is destory
  static isLoopDestory = false;
  // render handle
  static animateRenderRef = null;

  /**
   * setup
   */
  static setup = () => {
    this.isLoopDestory = false;
    this.isRenderLoop = false;
    this.renderLoopList = [];
    this.animateRenderRef = null;
  };

  /**
   * destory
   */
  static destory = () => {
    this.isLoopDestory = true;
    this.isRenderLoop = false;
    window.cancelAnimationFrame(this.animateRenderRef);
    this.renderLoopList = null;
  };

  /**
   * add new event
   * @param {func} fn render fps
   * @param {string} identifier identifer
   * @returns
   */
  static add = (fn = () => {}, identifier = '') => {
    if (this.isLoopDestory) {
      return null;
    }
    if (!fn) {
      return null;
    }
    const isExist = this.renderLoopList.find((item) => item.type === identifier);
    if (isExist) {
      return '';
    }
    let uniqeid: string | Symbol = identifier;
    if (!identifier) {
      uniqeid = Symbol('render frame');
    }
    this.renderLoopList.push({
      type: uniqeid,
      fn
    });
    if (!this.isRenderLoop) {
      this.render();
    }
    return uniqeid;
  };

  /**
   * delete event
   * @param {string | Symbol} identifier 标识符
   */
  static removeId = (identifier) => {
    this.removeIds([identifier]);
  };

  /**
   * delete identifer
   * @param {Array<string | Symbol>} identifier string 标识符
   */
  static removeIds = (identifiers = []) => {
    if (this.renderLoopList) {
      identifiers.forEach((e) => {
        const findIndex = this.renderLoopList.findIndex((item) => item.type === e);
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
      this.renderLoopList.forEach((item) => {
        item.fn?.();
      });
      return true;
    };

    //
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
