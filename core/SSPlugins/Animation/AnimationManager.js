/*
 * Author  Kayson.Wan
 * Date  2025-07-25 11:41:35
 * LastEditors  Kayson.Wan
 * LastEditTime  2025-07-25 15:24:48
 * Description
 */
// /*
//  * Author  Kayson.Wan
//  * Date  2025-07-25 11:41:35
//  * LastEditors  Kayson.Wan
//  * LastEditTime  2025-07-25 11:41:37
//  * Description
//  */
// export default class AnimationManager {
//   constructor() {
//     this.controllers = [];
//     this.globalSpeed = 1.0;
//     this.paused = false;
//   }

//   addController(controller) {
//     this.controllers.push(controller);
//     controller.setSpeed(this.globalSpeed);
//   }

//   removeController(controller) {
//     const index = this.controllers.indexOf(controller);
//     if (index !== -1) {
//       this.controllers.splice(index, 1);
//     }
//   }

//   update(delta) {
//     if (this.paused) return;
//     for (const controller of this.controllers) {
//       controller.update(delta * this.globalSpeed);
//     }
//   }

//   playAll(clipName) {
//     for (const controller of this.controllers) {
//       controller.play(clipName);
//     }
//   }

//   pauseAll() {
//     this.paused = true;
//     for (const controller of this.controllers) {
//       controller.pause();
//     }
//   }

//   resumeAll() {
//     this.paused = false;
//     for (const controller of this.controllers) {
//       controller.resume();
//     }
//   }

//   stopAll() {
//     for (const controller of this.controllers) {
//       controller.stop();
//     }
//   }

//   setGlobalSpeed(speed) {
//     this.globalSpeed = speed;
//     for (const controller of this.controllers) {
//       controller.setSpeed(speed);
//     }
//   }
// }
