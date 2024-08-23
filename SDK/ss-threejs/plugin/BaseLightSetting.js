import * as r from "three";
import u from "lil-gui";
class C {
  constructor(c, p, w = !0) {
    this.threeJs = null, this.lightTarget = new r.Object3D(), this.cubeMap = null, this.guiSetting = null, this.defaultSetting = {
      controllers: { 输出设置: "" },
      folders: {
        环境: { controllers: { tone曝光度: 1, toneMaping: 1 }, folders: {} },
        灯光: {
          controllers: {
            环境光强度: 0.2,
            环境光颜色: "#ababab",
            启用平行光: !0,
            平行光强度: 2,
            平行光颜色: "#f2e1be",
            平行光位置x: -89,
            平行光位置y: 160,
            平行光位置z: 27
          },
          folders: {}
        },
        阴影: {
          controllers: {
            接收阴影: !0,
            阴影分辨率: [1024, 2048, 4096],
            阴影范围上下宽度: 100,
            阴影范围左右宽度: 148,
            阴影贴图偏差: -0.0013000000000000002,
            shadowCamera最远距离: 500,
            shadowCamera最近距离: 0
          },
          folders: {}
        },
        雾: {
          controllers: { 启用雾: !0, 雾颜色: "#c5e7ff", 雾最近距离: 0, 雾最远距离: 1e4 },
          folders: {}
        },
        天空盒: {
          controllers: { 启用背景: !0, environment: { none: "none", blueSky: "blueSky" } },
          folders: {}
        }
      }
    }, this.startShadowTest = (d) => {
      const a = this.threeJs.threeAmbientLight, s = this.threeJs.threeDirectionalLight;
      s.castShadow = !0, s.shadow.mapSize.width = 4096, s.shadow.mapSize.height = 4096, s.shadow.camera.near = 0.1, s.shadow.camera.far = 1e3, s.shadow.camera.top = 500, s.shadow.camera.bottom = -500, s.shadow.camera.left = -500, s.shadow.camera.right = 500, s.shadow.bias = 1e-3, this.threeJs.threeScene.add(this.lightTarget), s.target = this.lightTarget, this.lightTarget.position.set(0, 0, 0), this.initGui(a, s, d);
    }, this.initGui = (d, a, s) => {
      const n = this.guiSetting.folders;
      console.log("setting", n);
      const t = new u(), o = {
        savePreset() {
          this.guiSetting = t.save(), console.log("this.guiSetting:", JSON.stringify(this.guiSetting)), o.outPutSetting = JSON.stringify(this.guiSetting);
        },
        outPutSetting: "",
        // loadPreset() {
        //   gui.load(this.guiSetting);
        // },
        toneMappingExposure: n.环境.controllers.tone曝光度,
        toneMapping: [
          {
            ACES: r.ACESFilmicToneMapping,
            Reinhard: r.ReinhardToneMapping,
            Linear: r.LinearToneMapping
          }
        ],
        ambientLightColor: n.灯光.controllers.环境光颜色,
        ambientIntensity: n.灯光.controllers.环境光强度,
        directionalLightColor: n.灯光.controllers.平行光颜色,
        directionalIntensity: n.灯光.controllers.平行光强度,
        visible: n.灯光.controllers.启用平行光,
        shadowPosition_x: n.灯光.controllers.平行光位置x,
        shadowPosition_y: n.灯光.controllers.平行光位置y,
        shadowPosition_z: n.灯光.controllers.平行光位置z,
        //
        castShadow: n.阴影.controllers.接收阴影,
        mapSize: [1024, 2048, 4096],
        // exponent: setting.exponent,
        // target: setting.target,
        near: n.阴影.controllers.shadowCamera最近距离,
        far: n.阴影.controllers.shadowCamera最远距离,
        topBottom: n.阴影.controllers.阴影范围上下宽度,
        leftRight: n.阴影.controllers.阴影范围左右宽度,
        bias: n.阴影.controllers.阴影贴图偏差,
        // radius: setting.radius,
        // 雾
        fog_visible: n.雾.controllers.启用雾,
        fog_color: n.雾.controllers.雾颜色,
        fog_near: n.雾.controllers.雾最近距离,
        fog_far: n.雾.controllers.雾最远距离,
        background: n.天空盒.controllers.启用背景,
        environment: { none: "none", blueSky: "blueSky" }
      };
      t.domElement.style.position = "absolute", t.domElement.style.right = "0rem", t.domElement.style.zIndex = 100, t.name = "灯光阴影效果调试配置", t.width = 300, t.closed = !0, t.load(this.guiSetting), t.add(o, "savePreset").name("保存设置"), t.add(o, "outPutSetting").name("输出设置").listen();
      const m = t.addFolder("环境");
      this.threeJs.threeRenderer.toneMappingExposure = o.toneMappingExposure, m.add(o, "toneMappingExposure", -10, 10, 0.01).name("tone曝光度").onChange((e) => {
        this.threeJs.threeRenderer.toneMappingExposure = e;
      }), this.threeJs.threeRenderer.toneMapping = o.toneMapping, m.add(o, "toneMappingExposure", {
        NoTone: r.NoToneMapping,
        Cineon: r.CineonToneMapping,
        ACES: r.ACESFilmicToneMapping,
        Reinhard: r.ReinhardToneMapping,
        Linear: r.LinearToneMapping
      }).name("toneMaping").onChange((e) => {
        console.log("e", e), this.threeJs.threeRenderer.toneMapping = e;
      });
      const h = t.addFolder("灯光");
      d.intensity = o.ambientIntensity, h.add(o, "ambientIntensity", 0, 5).name("环境光强度").onChange((e) => {
        console.log("ambientLight e", d, e), d.intensity = e;
      }), d.color = new r.Color(o.ambientLightColor), h.addColor(o, "ambientLightColor").name("环境光颜色").onChange((e) => {
        d.color = new r.Color(e);
      }), h.add(o, "visible").name("启用平行光").onChange((e) => {
        a.visible = e;
      }), a.intensity = o.directionalIntensity, h.add(o, "directionalIntensity", 0, 5).name("平行光强度").onChange((e) => {
        a.intensity = e;
      }), a.color = new r.Color(o.directionalLightColor), h.addColor(o, "directionalLightColor").name("平行光颜色").onChange((e) => {
        a.color = new r.Color(e);
      }), a.shadow.camera.far = o.far, h.add(o, "shadowPosition_x").name("平行光位置x").onChange((e) => {
        a.position.x = e;
      }), h.add(o, "shadowPosition_y").name("平行光位置y").onChange((e) => {
        a.position.y = e;
      }), h.add(o, "shadowPosition_z").name("平行光位置z").onChange((e) => {
        a.position.z = e;
      });
      const i = t.addFolder("阴影");
      a.position.set(
        o.shadowPosition_x,
        o.shadowPosition_y,
        o.shadowPosition_z
      ), a.castShadow = o.castShadow, i.add(o, "castShadow").name("接收阴影").onChange((e) => {
        a.castShadow = e;
      }), i.add(o, "mapSize", { low: 512, height: 1024, moreHeight: 2048 }).name("阴影分辨率").onChange((e) => {
        console.log("e", e), a.shadow.mapSize.width = e, a.shadow.mapSize.height = e, a.shadow.needsUpdate = !0, this.threeJs.threeRenderer.render(this.threeJs.threeScene, this.threeJs.threeCamera);
      }), a.shadow.camera.top = o.topBottom, a.shadow.camera.bottom = -o.topBottom, i.add(o, "topBottom", 10, 2e3, 1).name("阴影范围上下宽度").onChange((e) => {
        a.shadow.camera.top = e, a.shadow.camera.bottom = -e, a.shadow.camera.updateWorldMatrix(), a.shadow.camera.updateProjectionMatrix();
      }), a.shadow.camera.left = o.leftRight, a.shadow.camera.right = -o.leftRight, i.add(o, "leftRight", 10, 2e3, 1).name("阴影范围左右宽度").onChange((e) => {
        a.shadow.camera.left = e, a.shadow.camera.right = -e, a.shadow.camera.updateWorldMatrix(), a.shadow.camera.updateProjectionMatrix();
      }), a.shadow.bias = o.bias, i.add(o, "bias", -0.1, 0.1, 1e-4).name("阴影贴图偏差").onChange((e) => {
        a.shadow.bias = e, a.shadow.camera.updateWorldMatrix(), a.shadow.camera.updateProjectionMatrix();
      }), i.add(o, "far", 0, 3e3, 1).name("shadowCamera最远距离").onChange((e) => {
        a.shadow.camera.far = e, a.shadow.camera.updateWorldMatrix(), a.shadow.camera.updateProjectionMatrix();
      }), a.shadow.camera.near = o.near, i.add(o, "near", 0, 100, 0.01).name("shadowCamera最近距离").onChange((e) => {
        a.shadow.camera.near = e, a.shadow.camera.updateWorldMatrix(), a.shadow.camera.updateProjectionMatrix();
      });
      const l = t.addFolder("雾");
      this.threeJs.threeScene.fog = o.fog_visible ? new r.Fog(o.fog_color, o.fog_near, o.fog_far) : null, l.add(o, "fog_visible").name("启用雾").onChange((e) => {
        console.log("e", e), this.threeJs.threeScene.fog = o.fog_visible ? new r.Fog(o.fog_color, o.fog_near, o.fog_far) : null;
      }), l.addColor(o, "fog_color").name("雾颜色").onChange((e) => {
        this.threeJs.threeScene.fog.color = new r.Color(e);
      }), l.add(o, "fog_near", 0, 6e4, 1).name("雾最近距离").onChange((e) => {
        this.threeJs.threeScene.fog.near = e;
      }), l.add(o, "fog_far", 0, 6e4, 1).name("雾最远距离").onChange((e) => {
        this.threeJs.threeScene.fog.far = e;
      });
      const g = t.addFolder("天空盒");
      g.add(o, "background").name("启用背景").onChange((e) => {
        this.threeJs.ssThreeObject.threeScene.background = e ? this.cubeMap : null;
      }), g.add(o, "environment", { none: "none", blueSky: "blueSky" }).onChange((e) => {
        e === "blueSky" && (this.threeJs.threeScene.environment = this.cubeMap), e === "none" && (this.threeJs.threeScene.environment = null);
      }), s || t.destroy();
    }, this.destory = () => {
    }, this.threeJs = c, this.guiSetting = p || this.defaultSetting, this.startShadowTest(w);
  }
}
export {
  C as default
};
