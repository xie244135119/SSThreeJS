let renderLoopList = [];
// is render
let isRenderLoop = false;
// is destory
let isLoopDestory = false;
// render handle
let animateRenderRef = null;

export default class SSThreeLoop {
  /**
   * setup
   */
  static setup = () => {
    isLoopDestory = false;
    isRenderLoop = false;
    renderLoopList = [];
    animateRenderRef = null;
    window.renderLoopList = renderLoopList;
  };

  /**
   * destory
   */
  static destory = () => {
    isLoopDestory = true;
    isRenderLoop = false;
    window.cancelAnimationFrame(animateRenderRef);
    renderLoopList = [];
    window.renderLoopList = [];
  };

  /**
   * add new event
   * @param {func} fn render fps
   * @param {string} identifier identifer
   * @returns
   */
  static add = (fn = () => {}, identifier = '') => {
    if (isLoopDestory) {
      return null;
    }
    if (!fn) {
      return null;
    }
    const isExist = renderLoopList.find((item) => item.type === identifier);
    if (isExist) {
      return '';
    }
    let uniqeid = identifier;
    if (!identifier) {
      uniqeid = Symbol('render frame');
    }
    renderLoopList.push({
      type: uniqeid,
      fn
    });
    if (!isRenderLoop) {
      this.render();
    }
    return uniqeid;
  };

  /**
   * delete event
   * @param {*} identifier string 标识符
   */
  static removeId = (identifier) => {
    this.removeIds([identifier]);
  };

  /**
   * delete identifer
   * @param {*} identifier string 标识符
   */
  static removeIds = (identifiers = []) => {
    identifiers.forEach((e) => {
      const findIndex = renderLoopList.findIndex((item) => item.type === e);
      if (findIndex !== -1) {
        renderLoopList.splice(findIndex, 1);
      }
    });
  };

  /**
   * render frame
   */
  static render = () => {
    if (isRenderLoop) return;
    isRenderLoop = true;
    const multiUpdate = () => {
      if (renderLoopList.length === 0) {
        return false;
      }
      renderLoopList.forEach((item) => {
        item.fn?.();
      });
      return true;
    };

    //
    const animateFrame = () => {
      if (isLoopDestory) {
        return;
      }
      // console.log(' 每帧渲染中 ', renderLoopList);
      const update = multiUpdate();
      if (update) {
        animateRenderRef = window.requestAnimationFrame(animateFrame);
      } else {
        isRenderLoop = false;
        console.log(' 取消渲染 ');
        window.cancelAnimationFrame(animateRenderRef);
      }
    };

    animateRenderRef = window.requestAnimationFrame(animateFrame);
  };
}
