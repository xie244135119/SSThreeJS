// max Storage 默认 1G
// const MAX_STORAGE_USAGE = 1 * 1024 * 1024 * 1024;
const MAX_STORAGE_USAGE = 500 * 1024 * 1024;
// data base name
const DATABASE_NAME = 'threeJsdb';
// data base vsersion
const DATABASE_VERSION = 1;
// data base tables
const DATABASE_TABLES = [
  {
    name: 'model',
    // 用于后续增量更新处理 <代表当前数据库的版本号>
    dbVersion: DATABASE_VERSION,
    // last table columns
    columns: [
      {
        name: 'model_name',
        primarykey: true,
        unique: false,
        autoIncrement: false,
        type: 'add'
      },
      {
        name: 'model_type',
        type: 'add'
      },
      {
        name: 'model_path',
        type: 'add'
      },
      {
        name: 'size',
        type: 'add'
      },
      {
        name: 'create_time',
        type: 'add'
      },
      {
        name: 'update_time',
        type: 'add'
      }
    ]
  },
  {
    name: 'modelfile',
    // 用于后续增量更新处理 <代表当前数据库的版本号>
    dbVersion: DATABASE_VERSION,
    // last table columns
    columns: [
      {
        name: 'model_name',
        primarykey: true,
        unique: false,
        autoIncrement: false,
        type: 'add'
      },
      {
        name: 'data',
        type: 'add'
      }
    ]
  }
];
// local storage size
const STORAGE_KEY_USAGE = `${DATABASE_NAME}_size`;

export default class SSDB {
  // 单例
  static shareInstance = new SSDB();

  // 操作数据库
  #targetDataBase = null;

  destory() {
    //
  }

  /**
   * open database
   * @returns
   */
  open() {
    if (this.#targetDataBase instanceof IDBDatabase) {
      return Promise.resolve(this.#targetDataBase);
    }
    return new Promise((reslove, reject) => {
      const dbRequest = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      dbRequest.onsuccess = () => {
        const dataBase = dbRequest.result;
        this.targetDataBase = dataBase;
        this.addDbObserver(dataBase);
        reslove(this.targetDataBase);
      };
      dbRequest.onerror = (event) => {
        console.log(' 数据库打开失败 ', event);
        this.targetDataBase = null;
        reject(event);
      };
      dbRequest.onupgradeneeded = (event) => {
        console.log(' 数据库版本不一致 ', event);
        const db = event.target.result;
        this.createDataTables(db, DATABASE_TABLES);
      };
      dbRequest.blocked = (e) => {
        console.log(' 当前数据库连接暂未关闭 ', e);
      };
    });
  }

  /**
   * create data tables
   * @param {*} db
   */
  createDataTables = (aDatabase, aTables = DATABASE_TABLES) => {
    if (aDatabase instanceof IDBDatabase) {
      for (let index = 0; index < aTables.length; index++) {
        const element = aTables[index];
        const { name, columns = [], dbVersion } = element;
        if (dbVersion !== aDatabase.version) {
          continue;
        }
        // 表 存在
        if (aDatabase.objectStoreNames.contains(name)) {
          const objectStore = aDatabase.transaction(name).objectStore(name);
          columns.forEach((column) => {
            if (column.type === 'add') {
              objectStore.createIndex(column.name, column.name, {
                unique: column.unique
              });
            } else if (column.type === 'del') {
              objectStore.deleteIndex(column.name, column.name, {
                unique: column.unique
              });
            }
          });
        } else {
          // 表 不存在
          const keyPaths =
            columns.filter((item) => item.primarykey === true).map((item) => item.name) || [];
          const objectStore = aDatabase.createObjectStore(name, {
            keyPath: keyPaths[0]
          });
          columns.forEach((column) => {
            if (column.type === 'add') {
              objectStore.createIndex(column.name, column.name, {
                unique: column.unique
              });
            }
          });
        }
      }
    }
  };

  /**
   * add db observer
   */
  addDbObserver = (db) => {
    if (db instanceof IDBDatabase) {
      db.onabort = (e) => {
        console.log(' 数据库被终止操作 ', e);
      };

      db.onclose = (e) => {
        console.log(' 数据库被关闭事件 ', e);
      };

      db.onerror = (e) => {
        console.log(' 数据库出错事件 ', e);
      };

      db.onversionchange = (e) => {
        console.log(' 数据库版本改变事件 ', e);
      };
    }
  };

  /**
   * insert model
   * @param {*} obj 数据信息
   */
  insertModel = (aName = '', aData = new ArrayBuffer()) =>
    this.autoLRU(aData.byteLength).then(() =>
      this.open().then(
        (db) =>
          new Promise((reslove, reject) => {
            if (db instanceof IDBDatabase) {
              const modelTableName = DATABASE_TABLES[0].name;
              const modelFileTableName = DATABASE_TABLES[1].name;
              const transaction = db.transaction([modelTableName, modelFileTableName], 'readwrite');
              const modelStore = transaction.objectStore(modelTableName);
              const modelFileStore = transaction.objectStore(modelFileTableName);
              modelStore.add({
                model_name: aName,
                model_type: '',
                model_path: aName,
                size: aData.byteLength,
                create_time: new Date().valueOf(),
                update_time: new Date().valueOf()
              });
              modelFileStore.add({
                model_name: aName,
                data: aData
              });

              transaction.oncomplete = () => {
                this.updateTotalSize(aData.byteLength);
                // console.log(' insertModel 插入事务完成 ', aName, aData.byteLength);
                reslove();
              };
              transaction.onerror = (_, e) => {
                reject(e);
              };
              transaction.onabort = (_, e) => {
                reject(e);
              };
            }
          })
      )
    );

  /**
   * get model by fullpath
   * @param {string} aModelName 完整地址
   */
  getModel = (aModelName = '') => {
    const modelFileTableName = DATABASE_TABLES[1].name;
    return this.get(aModelName, modelFileTableName).then((model) => {
      // 更新 模型数据时间
      if (model) {
        const modelTableName = DATABASE_TABLES[0].name;
        this.get(aModelName, modelTableName).then((res) => {
          if (res) {
            res.update_time = new Date().valueOf();
            return this.update(res, modelTableName);
          }
          console.log(' getModel 出错 res ', res, model);
          return null;
        });
      }
      return model;
    });
  };

  /**
   * delete model
   * @returns
   */
  deleteModels = (aNames = []) =>
    this.open().then(
      (db) =>
        new Promise((reslove, reject) => {
          if (db instanceof IDBDatabase) {
            const modelTableName = DATABASE_TABLES[0].name;
            const modelFileTableName = DATABASE_TABLES[1].name;
            const transaction = db.transaction([modelTableName, modelFileTableName], 'readwrite');
            const modelStore = transaction.objectStore(modelTableName);
            const modelFileStore = transaction.objectStore(modelFileTableName);
            aNames.forEach((name) => {
              modelStore.delete(name);
              modelFileStore.delete(name);
            });
            transaction.oncomplete = () => {
              reslove();
            };
            transaction.onerror = (_, e) => {
              reject(e);
            };
            transaction.onabort = (_, e) => {
              reject(e);
            };
          }
        })
    );

  /**
   * get
   * @param {*} fullPath 完整地址
   */
  get = (aModelName = '', aTableName = DATABASE_TABLES[1].name) =>
    new Promise((reslove, reject) => {
      this.open().then((db) => {
        if (db instanceof IDBDatabase) {
          const transaction = db.transaction(aTableName, 'readwrite');
          const modelFileStore = transaction.objectStore(aTableName);
          const request = modelFileStore.get(aModelName);
          request.onsuccess = () => {
            reslove(request.result);
          };
          request.onerror = (e) => {
            reject(e);
          };
        }
      });
    });

  /**
   * update
   */
  update = (aModel = {}, aTableName = DATABASE_TABLES[1].name) =>
    new Promise((reslove, reject) => {
      this.open().then((db) => {
        if (db instanceof IDBDatabase) {
          const transaction = db.transaction(aTableName, 'readwrite');
          const modelFileStore = transaction.objectStore(aTableName);
          const request = modelFileStore.put(aModel);
          request.onsuccess = () => {
            reslove(request.result);
          };
          request.onerror = (e) => {
            reject(e);
          };
        }
      });
    });

  /**
   * delete
   */
  delete = (aModelName = '', aTableName = DATABASE_TABLES[1].name) =>
    new Promise((reslove, reject) => {
      this.open().then((db) => {
        if (db instanceof IDBDatabase) {
          const transaction = db.transaction(aTableName, 'readwrite');
          const modelFileStore = transaction.objectStore(aTableName);
          const request = modelFileStore.delete(aModelName);
          request.onsuccess = () => {
            reslove(request.result);
          };
          request.onerror = (e) => {
            reject(e);
          };
        }
      });
    });

  /**
   * LRU 策略
   * @returns
   */
  autoLRU = (needSize = 0) => {
    // 达到最大空间
    const totalSize = this.getTotalSize();
    // 需要预留的空间
    let validSpace = MAX_STORAGE_USAGE - (totalSize + needSize);
    if (validSpace > 0) {
      return Promise.resolve();
    }
    // 做删除
    validSpace = Math.abs(validSpace);
    return this.open()
      .then(
        (db) =>
          new Promise((reslove, reject) => {
            if (db instanceof IDBDatabase) {
              const modelTableName = DATABASE_TABLES[0].name;
              const transaction = db.transaction([modelTableName], 'readwrite');
              const modelStore = transaction.objectStore(modelTableName);
              // 删除一些未被经常使用的资源
              const allRequest = modelStore.getAll();
              allRequest.onsuccess = () => {
                //
                const list = allRequest.result || [];
                // 按照 update_time 升序
                const newlist = list.sort((a, b) => a.update_time - b.update_time);
                const _delModelNames = [];
                let _totalsize = 0;
                let _senderIndex = 0;
                while (validSpace > _totalsize) {
                  const element = newlist[_senderIndex];
                  _totalsize += element.size;
                  _senderIndex += 1;
                  _delModelNames.push(element.model_name);
                }
                reslove({
                  model_names: _delModelNames,
                  reduce_size: _totalsize
                });
              };
              allRequest.onerror = (e) => {
                reject(e);
              };
            }
          })
      )
      .then((res) => {
        const { model_names, reduce_size } = res;
        return this.deleteModels(model_names).then(() => {
          console.log(' 删除模型结束 ', model_names, reduce_size);
          this.updateTotalSize(reduce_size * -1);
        });
      });
  };

  /**
   * get current total size
   */
  getTotalSize = () => {
    const usage = localStorage.getItem(STORAGE_KEY_USAGE);
    if (usage) {
      return parseInt(usage, 10);
    }
    return 0;
  };

  /**
   * set current total size
   */
  updateTotalSize = (aAddSize = 0) => {
    const totalSize = this.getTotalSize();
    // console.log(
    //     `更新本地空间大小 总共：${totalSize}, 增加${aAddSize}, 上限${MAX_STORAGE_USAGE}`
    // );
    localStorage.setItem(STORAGE_KEY_USAGE, totalSize + aAddSize);
  };
}

// eslint-disable-next-line no-extend-native
String.prototype.hashCode = function () {
  let hash = 0;
  let i;
  let chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
