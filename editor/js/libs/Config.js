export default class Config {
  constructor() {
    this.name = 'ssthreejs-editor';

    const storage = {
      language: 'en-us',

      autosave: true,

      'project/title': '',
      'project/editable': false,
      'project/vr': false,

      'project/renderer/antialias': true,
      'project/renderer/shadows': true,
      'project/renderer/shadowType': 1, // PCF
      'project/renderer/toneMapping': 0, // NoToneMapping
      'project/renderer/toneMappingExposure': 1,

      'settings/history': false,

      'settings/shortcuts/translate': 'w',
      'settings/shortcuts/rotate': 'e',
      'settings/shortcuts/scale': 'r',
      'settings/shortcuts/undo': 'z',
      'settings/shortcuts/focus': 'f'
    };

    if (window.localStorage[this.name] === undefined) {
      window.localStorage[this.name] = JSON.stringify(storage);
    } else {
      const data = JSON.parse(window.localStorage[this.name]);

      for (const key in data) {
        storage[key] = data[key];
      }
    }
    this.storage = storage;
  }

  getKey(key) {
    return this.storage[key];
  }

  setKey(...args) {
    // key, value, key, value ...

    for (let i = 0, l = args.length; i < l; i += 2) {
      this.storage[args[i]] = args[i + 1];
    }

    window.localStorage[this.name] = JSON.stringify(this.storage);

    console.log(
      '[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']',
      'Saved config to LocalStorage.'
    );
  }

  clear() {
    delete window.localStorage[this.name];
  }
}
