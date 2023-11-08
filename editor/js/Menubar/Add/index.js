import * as THREE from 'three';
import { UIPanel, UIRow, UIHorizontalRule } from '../../UIKit/UI';
import SSCommand from '../../Command/commands';
import SEComponent from '../../SEComponent';

export default class SEMenubarAdd extends SEComponent {
  //
  constructor(controller) {
    const container = new UIPanel();
    container.setClass('menu');
    super(controller, container.dom);

    const { strings } = this.controller;

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/add'));
    container.add(title);

    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // Group
    let option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/group'));
    option.onClick(() => {
      const mesh = new THREE.Group();
      mesh.name = 'Group';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // Box
    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/box'));
    option.onClick(() => {
      const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Box';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Capsule

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/capsule'));
    option.onClick(() => {
      const geometry = new THREE.CapsuleGeometry(1, 1, 4, 8);
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'Capsule';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Circle

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/circle'));
    option.onClick(() => {
      const geometry = new THREE.CircleGeometry(1, 32, 0, Math.PI * 2);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Circle';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Cylinder

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/cylinder'));
    option.onClick(() => {
      const geometry = new THREE.CylinderGeometry(1, 1, 1, 32, 1, false, 0, Math.PI * 2);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Cylinder';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Dodecahedron

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/dodecahedron'));
    option.onClick(() => {
      const geometry = new THREE.DodecahedronGeometry(1, 0);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Dodecahedron';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Icosahedron

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/icosahedron'));
    option.onClick(() => {
      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Icosahedron';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Lathe

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/lathe'));
    option.onClick(() => {
      const geometry = new THREE.LatheGeometry();
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })
      );
      mesh.name = 'Lathe';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Octahedron

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/octahedron'));
    option.onClick(() => {
      const geometry = new THREE.OctahedronGeometry(1, 0);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Octahedron';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Plane

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/plane'));
    option.onClick(() => {
      const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'Plane';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Ring

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/ring'));
    option.onClick(() => {
      const geometry = new THREE.RingGeometry(0.5, 1, 32, 1, 0, Math.PI * 2);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Ring';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Sphere

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/sphere'));
    option.onClick(() => {
      const geometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Sphere';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Sprite

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/sprite'));
    option.onClick(() => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial());
      sprite.name = 'Sprite';

      this.controller.execute(new SSCommand.AddObject(this.controller, sprite));
    });
    options.add(option);

    // Tetrahedron

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/tetrahedron'));
    option.onClick(() => {
      const geometry = new THREE.TetrahedronGeometry(1, 0);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Tetrahedron';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Torus

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/torus'));
    option.onClick(() => {
      const geometry = new THREE.TorusGeometry(1, 0.4, 12, 48, Math.PI * 2);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Torus';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // TorusKnot

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/torusknot'));
    option.onClick(() => {
      const geometry = new THREE.TorusKnotGeometry(1, 0.4, 64, 8, 2, 3);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'TorusKnot';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    // Tube

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/tube'));
    option.onClick(() => {
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2, 2, -2),
        new THREE.Vector3(2, -2, -0.6666666666666667),
        new THREE.Vector3(-2, -2, 0.6666666666666667),
        new THREE.Vector3(-2, 2, 2)
      ]);

      const geometry = new THREE.TubeGeometry(path, 64, 1, 8, false);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      mesh.name = 'Tube';

      this.controller.execute(new SSCommand.AddObject(this.controller, mesh));
    });
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // AmbientLight

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/ambientlight'));
    option.onClick(() => {
      const color = 0x222222;

      const light = new THREE.AmbientLight(color);
      light.name = 'AmbientLight';

      this.controller.execute(new SSCommand.AddObject(this.controller, light));
    });
    options.add(option);

    // DirectionalLight

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/directionallight'));
    option.onClick(() => {
      const color = 0xffffff;
      const intensity = 1;

      const light = new THREE.DirectionalLight(color, intensity);
      light.name = 'DirectionalLight';
      light.target.name = 'DirectionalLight Target';

      light.position.set(5, 10, 7.5);

      this.controller.execute(new SSCommand.AddObject(this.controller, light));
    });
    options.add(option);

    // HemisphereLight

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/hemispherelight'));
    option.onClick(() => {
      const skyColor = 0x00aaff;
      const groundColor = 0xffaa00;
      const intensity = 1;

      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      light.name = 'HemisphereLight';

      light.position.set(0, 10, 0);

      this.controller.execute(new SSCommand.AddObject(this.controller, light));
    });
    options.add(option);

    // PointLight

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/pointlight'));
    option.onClick(() => {
      const color = 0xffffff;
      const intensity = 1;
      const distance = 0;

      const light = new THREE.PointLight(color, intensity, distance);
      light.name = 'PointLight';

      this.controller.execute(new SSCommand.AddObject(this.controller, light));
    });
    options.add(option);

    // SpotLight

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/spotlight'));
    option.onClick(() => {
      const color = 0xffffff;
      const intensity = 1;
      const distance = 0;
      const angle = Math.PI * 0.1;
      const penumbra = 0;

      const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
      light.name = 'SpotLight';
      light.target.name = 'SpotLight Target';

      light.position.set(5, 10, 7.5);

      this.controller.execute(new SSCommand.AddObject(this.controller, light));
    });
    options.add(option);

    //

    options.add(new UIHorizontalRule());

    // OrthographicCamera

    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/orthographiccamera'));
    option.onClick(() => {
      const { aspect } = this.controller.camera;
      const camera = new THREE.OrthographicCamera(-aspect, aspect);
      camera.name = 'OrthographicCamera';

      this.controller.execute(new SSCommand.AddObject(this.controller, camera));
    });
    options.add(option);

    // PerspectiveCamera
    option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/perspectivecamera'));
    option.onClick(() => {
      const camera = new THREE.PerspectiveCamera();
      camera.name = 'PerspectiveCamera';

      this.controller.execute(new SSCommand.AddObject(this.controller, camera));
    });
    options.add(option);
  }
}
