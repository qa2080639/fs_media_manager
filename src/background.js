'use strict'

const fs = require('fs');
const path = require('path');
const md5 = require('md5');

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  shell,
  Menu,
} from 'electron'

import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'

import installExtension, {
  VUEJS_DEVTOOLS
} from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

import ormconfig from '../ormconfig';
const typeorm = require("typeorm");
const Media = require("./entity/MediaSchema");
const MediaInfo = require("./entity/MediaInfoSchema");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])


function walkSync(currentDirPath, config, callback) {
  fs.readdirSync(currentDirPath).forEach(name => {
    var filePath = path.join(currentDirPath, name);
    try {
      // 防止没权限读取报错
      var stat = fs.statSync(filePath);
    } catch (error) {
      console.log(error);
      return;
    }
    if (stat.isFile()) {
      var ext = path.extname(name);
      if (config.exts.indexOf(ext) != -1 && stat.size > (config.minSize * 1024)) {
        filePath = path.dirname(filePath);
        callback(name, filePath, stat);
      }
    } else if (stat.isDirectory()) {
      walkSync(filePath, config, callback);
    }
  });
}


typeorm.createConnection(ormconfig);

ipcMain.on('main-sync', (event, data) => {
  console.log(data);
  event.returnValue = '主进程收到了渲染进程的【同步】消息！' + data;
});

ipcMain.on('indexs', (event, data) => {
  let paths = data.paths;
  let config = data.config;
  console.log(data);
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  paths.forEach(path => {
    walkSync(path, config, (name, filePath, stat) => {
      // console.log(name, filePath, stat);
      var hashDatas = [],
          hashTypes = [];
      if (config.hashType.mtime) {
        hashDatas.push(new Date(stat.mtime).getTime());
        hashTypes.push('mtime');
      }
      if (config.hashType.size) {
        hashDatas.push(stat.size);
        hashTypes.push('size');
      }
      if (config.hashType.name) {
        hashDatas.push(name);
        hashTypes.push('name');
      }
      mediaRepository.save({
        file_name: name,
        file_path: filePath,
        file_size: stat.size,
        hash: md5(hashDatas.join('|')),
        hash_type: hashTypes.join('|'),
      }, {
        reload: false
      });
    });
  })
  event.reply('indexs-reply', 'ok')
});


ipcMain.on('getMediaData', async (event, condition) => {
  console.log(condition);
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  let db = mediaRepository
    .createQueryBuilder("m")
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash')
  db = addCondition(db, condition);
  let total = await db.getCount();
  if (condition.sort.order) {
    let fieldMap = {
      'file_size': 'm.file_size',
      'score': 'mi.score'
    }
    let sort = condition.sort.order == 'ascending' ? 'ASC' : 'DESC';
    db = db.orderBy(fieldMap[condition.sort.field], sort);
  }
  let data = await db.limit(condition.pageSize)
    .offset((condition.pageIndex - 1) * condition.pageSize)
    .select("m.id,m.file_name,m.file_path,m.file_size,m.hash,m.file_path,m.hash_type,m.create_time,mi.score,mi.class,mi.remark,mi.update_time")
    .getRawMany();
  // console.log(data);
  let result = {
    data: data,
    total: total,
  }
  event.returnValue = result;
});

ipcMain.on('getMediaDistinct', async (event, condition) => {
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  const mediaInfoRepository = typeorm.getConnection().getRepository(MediaInfo);
  let medias = await mediaRepository
    .createQueryBuilder()
    .distinct(true)
    .select("file_path")
    .getRawMany();
  let mediaInfos = await mediaInfoRepository
    .createQueryBuilder()
    .where('class IS NOT NULL')
    .distinct(true)
    .select("class")
    .getRawMany();
  let paths = medias.map(item => item.file_path);
  let classTag = mediaInfos.map(item => item.class);
  let result = {
    paths: paths,
    classTag: classTag,
  }
  event.returnValue = result;
});

ipcMain.on('updateMediaInfo', async (event, data) => {
  const mediaInfoRepository = typeorm.getConnection().getRepository(MediaInfo);
  await mediaInfoRepository.save(data, {
    reload: false
  });
  event.returnValue = 'ok';
});

ipcMain.on('deleteFile', async (event, data) => {
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  await mediaRepository.remove(data);
  const mediaInfoRepository = typeorm.getConnection().getRepository(MediaInfo);
  await mediaInfoRepository.remove(data);
  shell.trashItem(data.file_path + "\\" + data.file_name)
  event.returnValue = 'ok';
});

ipcMain.on('deleteIndexs', async (event, condition) => {
  console.log(condition);
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  let db = mediaRepository
    .createQueryBuilder('m')
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash')
  if (condition) {
    db = addCondition(db, condition);
  }
  let medias = await db.getMany();
  mediaRepository.remove(medias);
  event.returnValue = 'ok';
});

ipcMain.on('getRepeatFiles', async (event, condition) => {
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  let db = mediaRepository
    .createQueryBuilder('m')
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash');
  db = addCondition(db, condition);
  let datas = await db.groupBy("m.hash")
    .having("COUNT(id) > 1 AND COUNT(DISTINCT(file_path))  > 1")
    .select("id,m.hash")
    .getRawMany();
  // console.log(datas);
  let hashs = datas.map(item => item.hash);
  let db2 = mediaRepository
    .createQueryBuilder("m")
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash')
    .andWhere("m.hash IN(:...hashs)", {
      hashs: hashs
    });
  db2 = addCondition(db2, condition);
  let data = await db2.select("m.id,m.file_name,m.file_path,m.file_size,m.hash,m.file_path,m.hash_type,m.create_time,mi.score,mi.class,mi.remark,mi.update_time")
    .getRawMany();
  event.returnValue = data;
});

ipcMain.on('deleteRepeatData', async (event, condition) => {
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  let db = mediaRepository
    .createQueryBuilder('m')
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash');
  db = addCondition(db, condition);
  let datas = await db.groupBy("m.hash,m.file_path")
    .having("COUNT(id) > 1")
    .select("id,m.hash")
    .getRawMany();
  console.log(datas);
  let hashs = datas.map(item => item.hash);
  let ids = datas.map(item => item.id);
  mediaRepository.createQueryBuilder()
    .andWhere("hash IN(:...hashs) AND id NOT IN (:...ids)", {
      hashs: hashs,
      ids: ids,
    })
    .delete()
    .execute();
  event.returnValue = 'ok';
});

ipcMain.on('deleteInvalidFiles', async (event, condition) => {
  console.log(condition);
  const mediaRepository = typeorm.getConnection().getRepository(Media);
  let db = mediaRepository
    .createQueryBuilder("m")
    .leftJoinAndSelect(MediaInfo, "mi", 'm.hash=mi.hash')
  db = addCondition(db, condition);
  let datas = await db.select("m.id,m.file_name,m.file_path")
    .getRawMany();
  let delIds = [];
  datas.forEach(item => {
    let path = item.file_path + "\\" + item.file_name;
    if (!fs.existsSync(path)) {
      delIds.push(item.id);
    }
  });
  console.log(delIds);
  await mediaRepository.createQueryBuilder()
    .whereInIds(delIds)
    .delete()
    .execute();
  event.reply('deleteInvalidFiles-reply', 'ok')
});

function addCondition(db, condition) {
  if (condition.keyWord) {
    db = db.andWhere("m.file_name LIKE('%" + condition.keyWord + "%')");
  }
  if (condition.remark) {
    db = db.andWhere("mi.remark LIKE('%" + condition.remark + "%')");
  }
  if (condition.filters.class && condition.filters.class.length) {
    db = db.andWhere("mi.class IN (:...class)", {
      class: condition.filters.class
    });
  }
  if (condition.paths && condition.paths.length) {
    db = db.andWhere(new typeorm.Brackets(qb => {
      condition.paths.forEach(path => {
        qb.orWhere("m.file_path LIKE('" + path + "%')")
      })
    }));
  }
  return db;
}

async function createWindow() {
  if (!isDevelopment) {
    Menu.setApplicationMenu(null);
  }
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}