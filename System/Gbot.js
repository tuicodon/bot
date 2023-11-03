import '../cleanup.js';
import {} from 'dotenv/config';
import {
  writeFileSync
} from 'fs';
import {
  resolve as resolvePath
} from 'path';
import logger from './Core/helpers/console.js';
import login from 'nhatcoder-fb-api';
import handleListen from './Handlers/listen.js';
import environments from './Core/helpers/environments.get.js';
import _init_var from './Core/_init.js';
import startServer from './Dashboard/server/app.js'
import replitDB from "@replit/database";
import {
  execSync
} from 'child_process';
import axios from 'axios';
import {
  initDatabase,
  updateJSON,
  updateMONGO,
  _Threads,
  _Users
} from './Handlers/database.js';
import http from 'http';
const {
  isGlitch,
  isReplit
} = environments;

process.stdout.write(
  String.fromCharCode(27) + "]0;" + "Gbot" + String.fromCharCode(7)
);

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
});

process.on('uncaughtException', (err, origin) => {
  logger.error("Uncaught Exception: " + err + ": " + origin);
});

process.on('SIGINT', () => {
  logger.system(getLang('build.start.exit'));
  global.shutdown();
});

process.on('SIGTERM', () => {
  logger.system(getLang('build.start.exit'));
  global.shutdown();
});

process.on('SIGHUP', () => {
  logger.system(getLang('build.start.exit'));
  global.shutdown();
});
async function webView() {
  logger.custom("Đã mở webview ở port 8080", "WEBVIEW");
  http.createServer((req, res) => {
    res.write('Developer By Nhatcoder');
    res.end();
  }).listen(8080);

}
global.NVCODER = new Object({
  Server: new Object({
    Connect: async (key) => {
      try {
        const urlServer = `https://raw.githubusercontent.com/nhatcoder2003/AlphabotServer/main/ACTIVE/${key}.json`;
        const response = await axios.get(urlServer);
        return response;
      }catch(e) {
        return logger.error('[CODE-406] Máy chủ gặp sự cố! Liên hệ admin để biét thêm chi tiết');
      }
    }

  }),
  Lyrics: resolvePath(process.cwd(), "NVCODER", "Lyrics"),
  Storage: resolvePath(process.cwd(), "NVCODER", "Data")
});
async function start() {
  try {
    await _init_var();
    logger.system(getLang('build.start.varLoaded'));
    await initDatabase();
    global.updateJSON = updateJSON;
    global.updateMONGO = updateMONGO;
    global.controllers = {
      Threads: _Threads,
      Users: _Users
    }
    //console.log(global.NVCODER.Server.Connect(global.config.GBOTWAR_ACTIVE.KEY_ACTIVE))
    const serverAdminPassword = getRandomPassword(8);
    if (global.config.GBOTWAR_OPTIONS.WEBVIEW === true) startServer(serverAdminPassword);
    process.env.SERVER_ADMIN_PASSWORD = serverAdminPassword;
    await booting(logger);
    await sendWelecome();
  } catch (err) {
    logger.error(err);
    return global.shutdown();
  }
}

function booting(logger) {
  return new Promise((resolve, reject) => {

    logger.custom(getLang('build.booting.logging'), 'LOGIN');

    loginState()
    .then(async api => {
      global.api = api;
      global.botID = api.getCurrentUserID();
      logger.custom(getLang('build.booting.logged', {
        botID
      }), 'LOGIN');

      refreshState();;
      global.config.REFRESH ? autoReloadApplication(): null;
      global.listenMqtt = api.listenMqtt(await handleListen());
      refreshMqtt();

      resolve();
    })
    .catch(err => {
      if (isGlitch && global.isExists(resolvePath(process.cwd(), '.data', 'appstate.json'), 'file')) {
        global.deleteFile(resolvePath(process.cwd(), '.data', 'appstate.json'));
        execSync('refresh');
      }
      reject(err);
    })
  });
}

const _12HOUR = 1000 * 60 * 60 * 12;
const _2HOUR = 1000 * 60 * 60 * 2;
function refreshState() {
  global.refreshState = setInterval(() => {
    logger.custom(getLang('build.refreshState'),
      'REFRESH');
    const newAppState = global.api.getAppState();
    if (global.config.APPSTATE_PROTECTION === true) {
      if (isGlitch) {
        writeFileSync(resolvePath(process.cwd(), '.data', 'appstate.json'), JSON.stringify(newAppState, null, 2), 'utf-8');
      } else if (isReplit) {
        let APPSTATE_SECRET_KEY;
        let db = new replitDB();
        db.get("APPSTATE_SECRET_KEY")
        .then(value => {
          if (value !== null) {
            APPSTATE_SECRET_KEY = value;
            const encryptedAppState = global.modules.get('aes').encrypt(JSON.stringify(newAppState), APPSTATE_SECRET_KEY);
            writeFileSync(resolvePath(global.config.APPSTATE_PATH), JSON.stringify(encryptedAppState), 'utf8');
          }
        })
        .catch(err => {
          console.error(err);
        });
      }
    } else {
      writeFileSync(resolvePath(global.config.APPSTATE_PATH), JSON.stringify(newAppState, null, 2), 'utf8');
    }
  },
    _12HOUR);
}

function refreshMqtt() {
  global.refreshMqtt = setInterval(async () => {
    logger.custom(getLang('build.refreshMqtt'), 'REFRESH');
    global.listenMqtt.stopListening();
    global.listenMqtt = global.api.listenMqtt(await handleListen());
  },
    _2HOUR);
}

function autoReloadApplication() {
  setTimeout(() => global.restart(),
    global.config.REFRESH);
}

function loginState() {
  const {
    APPSTATE_PATH, APPSTATE_PROTECTION
  } = global.config;

  return new Promise((resolve, reject) => {
    global.modules.get('checkAppstate')(APPSTATE_PATH, APPSTATE_PROTECTION)
    .then(appState => {
      const options = global.config.FCA_OPTIONS;

      login({
        appState
      }, options, (error, api) => {
        if (error) {
          reject(error.error || error);
        }
        resolve(api);
      });
    })
    .catch(err => {
      reject(err);
    });
  });
}
async function sendWelecome() {
  try {
    const urlServer = 'https://raw.githubusercontent.com/nhatcoder2003/AlphabotServer/main/ACTIVE/' + global.config.GBOTWAR_ACTIVE.KEY_ACTIVE + '.json';
    const response = await axios.get(urlServer);
    const admin = global.config.ABSOLUTES;
    if (global.config.GBOTWAR_ACTIVE.WELECOME === false) {
      admin.forEach(id => {
        global.api.sendMessage(`〖 𝑨𝑳𝑷𝑯𝑨𝑩𝑶𝑻 - 𝑳𝑨𝑴 𝑪𝑯𝑼 𝑺𝑨𝑵 𝑾𝑨𝑹 〗\nCám ơn bạn đã sử dụng Alphabot (GbotWar bản thương mại) của tôi, Dưới đây là thông tin của bạn:\n\n•Họ và Tên: ${response.data.name}\n•Key: ${global.config.GBOTWAR_ACTIVE.KEY_ACTIVE}\n•Email: ${response.data.email}\n•Ngày kích hoạt: ${response.data.time}\n•Ngày hết hạn: ${response.data.expiration}\n\n👉Để gia hạn,nâng cấp gói hoặc yêu cầu thêm về lệnh liên hệ qua facebook của tôi.\n👉Facebook của tôi: https://www.facebook.com/profile.php?id=100023986450526`, id);
        global.config.GBOTWAR_ACTIVE.WELECOME = true;
        global.config.save();
      });
    }
  }catch(e) {
    logger.error('Không thể kết nối tới máy chủ, Vui lòng liên hệ admin để được hỗ trợ');
    //console.log(e)
    process.exit();
  }
}
start();