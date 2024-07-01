class SSMessageQueue {
  // 全部操作队列
  // 队列的消耗 先进先出
  _queueList = [];

  // 当前是否有动画在执行
  _runing = false;

  // 消息队列等待时间
  _delayTime = 0;

  constructor(delay = 0) {
    this._delayTime = delay;
  }

  /**
   * 队列 增加执行事件
   */
  add(fn = () => {}) {
    if (fn) {
      this._queueList.push(fn);
    }
    // 添加进队列，就继续执行
    this._excute();
  }

  /**
   * 队列 移除执行事件
   */
  remove() {
    const block = () => {
      this._runing = false;
      this._queueList.splice(0, 1);
      this._excute();
    };
    setTimeout(block, this._delayTime);
  }

  /**
   * 队列继续执行
   */
  _excute() {
    if (this._runing) {
      // console.log(`队列正在执行，${this._queueList.length}个人任务等待`);
      return;
    }
    // 将进入的第一个函数移除
    if (this._queueList.length > 0) {
      const fn = this._queueList[0];
      if (fn) {
        this._runing = true;
        fn();
      }
    }
  }

  /**
   * 事件销毁
   */
  destory() {
    this._queueList = [];
  }
}

export default SSMessageQueue;
