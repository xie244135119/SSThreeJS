/**
 * @description model membory cache
 * v2.0
 */
// max Storage 默认 200M
export const MAX_STORAGE_USAGE = 200 * 1024 * 1024;
// data base name
// const DATABASE_NAME = 'threeJsdb';
const DATABASE_NAME = 'ss-threejsdb';
// data base vsersion
const DATABASE_VERSION = 1;
// log perfix
const LOG_PREFIX = '【ss-threejs】';

interface SSDBOptions {
  maxStorageSize?: number;
}

interface SSDBTableOptions {
  name: string;
  dbVersion: number;
  columns: {
    name: string;
    type: string;
    primarykey?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
  }[];
}

interface SSDBModelItem {
  model_name: string;
  model_type: string;
  model_path: string;
  size: number;
  create_time: number;
  update_time: number;
  data?: ArrayBuffer;
}

export default class SSDB {
  /**
   * database
   */
  targetDataBase: IDBDatabase = null;

  /**
   * @description db options
   */
  _dbOptions: SSDBOptions = null;

  /**
   * @description cached size
   */
  _cachedSize: number = null;

  // data base tables
  DATABASE_TABLES: SSDBTableOptions[] = [
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

  destory() {
    this.targetDataBase?.close();
    this.targetDataBase = null;
  }

  constructor(options?: SSDBOptions) {
    if (options) {
      this._dbOptions = options;
    } else {
      this._dbOptions = {
        maxStorageSize: MAX_STORAGE_USAGE
      };
    }
  }

  /**
   * open database
   */
  open(): Promise<IDBDatabase> {
    if (this.targetDataBase) {
      return Promise.resolve(this.targetDataBase);
    }
    return new Promise((reslove, reject) => {
      const dbRequest = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      dbRequest.onsuccess = () => {
        const dataBase = dbRequest.result;
        this.targetDataBase = dataBase;
        // this.addDbObserver(dataBase);
        reslove(this.targetDataBase);
      };
      dbRequest.onerror = (event) => {
        // console.log(`${LOG_PREFIX}db open error`, event);
        this.targetDataBase = null;
        reject(event);
      };
      dbRequest.onupgradeneeded = (event) => {
        // console.log(`${LOG_PREFIX}db upgradeneeded`, event);
        const db: IDBDatabase = dbRequest.result;
        this.createDataTables(db, this.DATABASE_TABLES);
        this.targetDataBase = db;
        reslove(db);
      };
      dbRequest.onblocked = (e) => {
        // console.log(`${LOG_PREFIX}db blocked`, e);
        reject(e);
      };
    });
  }

  /**
   * create data tables
   */
  createDataTables = (aDatabase: IDBDatabase, aTables: SSDBTableOptions[]) => {
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
            objectStore.deleteIndex(column.name);
          }
        });
      } else {
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
  };

  /**
   * add db observer
   */
  addDbObserver = (db: IDBDatabase) => {
    db.onabort = (e) => {
      console.log(`${LOG_PREFIX}db abort`, e);
    };

    db.onclose = (e) => {
      console.log(`${LOG_PREFIX}db close`, e);
    };

    db.onerror = (e) => {
      console.log(`${LOG_PREFIX}db error`, e);
    };

    db.onversionchange = (e) => {
      console.log(`${LOG_PREFIX}db version change`, e);
    };
  };

  /**
   * insert model
   */
  insertModel = (aModelName: string, aModeData: ArrayBuffer) =>
    this.open().then((db) =>
      this.autoLRU(db, aModeData.byteLength).then(
        () =>
          new Promise((reslove, reject) => {
            const modelTableName = this.DATABASE_TABLES[0].name;
            const modelFileTableName = this.DATABASE_TABLES[1].name;
            const transaction = db.transaction([modelTableName, modelFileTableName], 'readwrite');
            const modelStore = transaction.objectStore(modelTableName);
            const modelFileStore = transaction.objectStore(modelFileTableName);
            modelStore.add({
              model_name: aModelName,
              model_type: '',
              model_path: aModelName,
              size: aModeData.byteLength,
              create_time: new Date().valueOf(),
              update_time: new Date().valueOf()
            });
            modelFileStore.add({
              model_name: aModelName,
              data: aModeData
            });

            transaction.oncomplete = () => {
              this.updateTotalSize(aModeData.byteLength);
              // console.log(`${LOG_PREFIX}insertModel ${aModelName} ${aModeData.byteLength}kb `);
              reslove(true);
            };
            transaction.onerror = (e) => {
              reject(e);
            };
            transaction.onabort = (e) => {
              reject(e);
            };
          })
      )
    );

  /**
   * get model by fullpath
   */
  getModel = (aModelName: string) => {
    const modelFileTableName = this.DATABASE_TABLES[1].name;
    return this.get(aModelName, modelFileTableName).then((model) => {
      // 更新 模型数据时间
      if (model) {
        const modelTableName = this.DATABASE_TABLES[0].name;
        this.get(aModelName, modelTableName).then((res) => {
          if (res) {
            res.update_time = new Date().valueOf();
            // console.log(`${LOG_PREFIX}query model success`, aModelName, res.size / 1024 / 1024);
            return this.update(res, modelTableName);
          }
          // console.log(`${LOG_PREFIX}query model err`, res, model);
          return null;
        });
      }
      return model;
    });
  };

  /**
   * delete model
   * @param {[]} aNames
   * @returns
   */
  deleteModels = (db: IDBDatabase, aNames = []) => {
    if (aNames.length === 0) {
      return Promise.resolve();
    }
    return new Promise((reslove, reject) => {
      const modelTableName = this.DATABASE_TABLES[0].name;
      const modelFileTableName = this.DATABASE_TABLES[1].name;
      const transaction = db.transaction([modelTableName, modelFileTableName], 'readwrite');
      const modelStore = transaction.objectStore(modelTableName);
      const modelFileStore = transaction.objectStore(modelFileTableName);
      aNames.forEach((name) => {
        modelStore.delete(name);
        modelFileStore.delete(name);
      });
      transaction.oncomplete = () => {
        reslove(true);
      };
      transaction.onerror = (e) => {
        reject(e);
      };
      transaction.onabort = (e) => {
        reject(e);
      };
    });
  };

  /**
   * 获取模型名称
   */
  get = (aModelName: string, aTableName: string): Promise<SSDBModelItem> =>
    new Promise((reslove, reject) => {
      this.open().then((db) => {
        const transaction = db.transaction(aTableName, 'readwrite');
        const modelFileStore = transaction.objectStore(aTableName);
        const request = modelFileStore.get(aModelName);
        request.onsuccess = () => {
          const obj: SSDBModelItem = request.result;
          reslove(obj);
        };
        request.onerror = (e) => {
          reject(e);
        };
      });
    });

  /**
   * update
   */
  update = (aModel: SSDBModelItem, aTableName: string) =>
    new Promise((reslove, reject) => {
      this.open().then((db) => {
        const transaction = db.transaction(aTableName, 'readwrite');
        const modelFileStore = transaction.objectStore(aTableName);
        const request = modelFileStore.put(aModel);
        request.onsuccess = () => {
          reslove(request.result);
        };
        request.onerror = (e) => {
          reject(e);
        };
      });
    });

  /**
   * delete
   */
  delete = (aModelName: string, aTableName: string) =>
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
   * LRU
   * @returns
   */
  autoLRU = (db: IDBDatabase, needSize: number = 0) =>
    this.getTotalSize(db).then((totalSize) => {
      // exist space size
      let validSpace = this._dbOptions.maxStorageSize - (totalSize + needSize);
      if (validSpace > 0) {
        return;
      }

      // delete invalid space
      validSpace = Math.abs(validSpace);
      return new Promise((reslove, reject) => {
        const modelTableName = this.DATABASE_TABLES[0].name;
        const transaction = db.transaction([modelTableName], 'readonly');
        const modelStore = transaction.objectStore(modelTableName);
        const request = modelStore.getAll();
        request.onsuccess = () => {
          const list: SSDBModelItem[] = request.result || [];
          const newlist = list.sort((a, b) => a.update_time - b.update_time);
          const delModelNames = [];
          let tempsize = 0;
          let senderIndex = 0;
          while (validSpace > tempsize) {
            if (newlist.length <= senderIndex) {
              break;
            }
            const model = newlist?.[senderIndex];
            tempsize += model.size;
            delModelNames.push(model.model_name);
            senderIndex += 1;
          }
          // 模型删除完，空间还是不够 --- 理论上不会存在，就需要动态调大缓存大小
          if (validSpace > tempsize) {
            console.error(
              `${LOG_PREFIX}初始化缓存大小配置，请将CacheSize配置调大到${
                needSize / 1024 / 1024
              }M以上`
            );
          }
          reslove({
            modelNames: delModelNames,
            reduceSize: tempsize
          });
        };
        request.onerror = (e) => {
          reject(e);
        };
      }).then((res: { modelNames: string[]; reduceSize: number }) =>
        this.deleteModels(db, res.modelNames).then(() => {
          this.updateTotalSize(res.reduceSize * -1);
          // console.log(`${LOG_PREFIX} clear invalid sources ${res.modelNames} ${res.reduceSize}`);
        })
      );
    });

  /**
   * get total size
   */
  getTotalSize = (db: IDBDatabase): Promise<number> => {
    if (this._cachedSize != null) {
      return Promise.resolve(this._cachedSize);
    }
    return new Promise((relsove, reject) => {
      const modelTableName = this.DATABASE_TABLES[0].name;
      const transaction = db.transaction(modelTableName, 'readonly');
      const modelStore = transaction.objectStore(modelTableName);
      const request = modelStore.getAll();
      request.onsuccess = () => {
        const objs: SSDBModelItem[] = request.result;
        const totalSize = objs.reduce((prev, cur) => prev + cur.size, 0);
        this._cachedSize = totalSize;
        // console.log(`${LOG_PREFIX}db cached size`, totalSize, totalSize / 1024 / 1024);
        relsove(totalSize);
      };
      request.onerror = (e) => {
        reject(e);
      };
    });
  };

  /**
   * update total size
   */
  updateTotalSize = (size: number) => {
    if (this._cachedSize !== null) {
      this._cachedSize += size;
    }
  };
}
