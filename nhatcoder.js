import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync
} from 'fs';
import {
  spawn,
  execSync
} from 'child_process';
import semver from 'semver';
import axios from 'axios';
import {} from 'dotenv/config';
import logger from './System/Core/helpers/console.js';
import loadPlugins from './System/Core/helpers/installDep.js';
import environments from './System/Core/helpers/environments.get.js';
import gradient from 'gradient-string';
import Banner from './System/Banner.js';
import {
  resolve as resolvePath
} from 'path';
const config = JSON.parse(readFileSync(resolvePath(process.cwd(), "Config", "config.main.json")));
const _1_MINUTE = 60000;
let restartCount = 0;
console.clear();
const {
  isGlitch,
  isReplit,
  isGitHub
} = environments;

console.clear();

// Install newer node version on some old Repls
if (config.GBOTWAR_OPTIONS.REPLIT === true) {
function upNodeReplit() {
  return new Promise(resolve => {
    execSync('npm i --save-dev node@16 && npm config set prefix=$(pwd)/node_modules/node && export PATH=$(pwd)/node_modules/node/bin:$PATH');
    resolve();
  })
}

(async () => {
  if (process.version.slice(1).split('.')[0] < 16) {
    if (isReplit) {
      try {
        logger.warn("Installing Node.js v16 for Repl.it...");
        await upNodeReplit();
        if (process.version.slice(1).split('.')[0] < 16) throw new Error("Failed to install Node.js v16.");
      } catch (err) {
        logger.error(err);
        process.exit(0);
      }
    }
    logger.error("Alphabot requires Node 16 or higher. Please update your version of Node.");
    process.exit(0);
  }

  if (isGlitch) {
    const WATCH_FILE = {
      "restart": {
        "include": [
          "\\.json"
        ]
      },
      "throttle": 3000
    }

    if (!existsSync(process.cwd() + '/watch.json') || !statSync(process.cwd() + '/watch.json').isFile()) {
      logger.warn("Glitch environment detected. Creating watch.json...");
      writeFileSync(process.cwd() + '/watch.json', JSON.stringify(WATCH_FILE, null, 2));
      execSync('refresh');
    }
  }

  if (isGitHub) {
    logger.warn("Running on GitHub is not recommended.");
  }
})();
}
// End



async function main() {
  await Banner();
  if (config.GBOTWAR_OPTIONS.NOTIFICATION_DISPLAY === true) await notification();
  await update();
  await Active();
  //await loadPlugins();
  const child = spawn('node', ['--trace-warnings', '--experimental-import-meta-resolve', '--expose-gc', 'System/Gbot.js'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env
  });

  child.on("close", async (code) => {
    handleRestartCount();
    if (code !== 0 && restartCount < 5) {
      console.log();
      logger.error(`Lỗi không xác định\n Mã Phiên Lỗi: ${code}`);
      logger.warn("Đang khởi động lại...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      main();
    } else {
      //console.log();
      logger.error("Gbot đã tự động dừng...");
      process.exit();
    }
  });
};
async function notification() {
  try {
    const noti = await axios.get('https://raw.githubusercontent.com/nhatcoder2003/AlphabotServer/main/notification.json');
    console.log(gradient.retro(`〄===============THÔNG BÁO===============〄`));
    const notification = noti.data.notification;
    notification.forEach(item => {
      console.log(`› ` + item);
    })
    console.log(gradient.retro(`==========================================\n`));
  } catch (e) {
    logger.warn("Không thể kết nối tới máy chủ thông báo")
  }
}

async function update() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/nhatcoder2003/Alphabot/main/package.json');
    //const res
    const {
      version
    } = res.data;
    const currentVersion = JSON.parse(readFileSync('./package.json')).version;
    if (semver.lt(currentVersion, version)) {
      logger.warn(`Đã có phiên bản mới: ${version}`);
      logger.warn(`Phiên bản hiện tại: ${currentVersion}`);
      logger.warn('Vui lòng cập nhật lên phiên bản mới nhất để sử dụng để có trải nghiệm tốt nhất');

    } else {
      logger.custom("Bạn đang sử dụng phiên bản mới nhất của GBOT WAR rồi.", "UPDATE");
    }
  } catch (err) {
    logger.error('Không thể kết nối tối máy chủ cập nhật.');
  }
}
async function Active() {
  try {
    const urlServer = 'https://raw.githubusercontent.com/nhatcoder2003/AlphabotServer/main/ACTIVE/' + config.GBOTWAR_ACTIVE.KEY_ACTIVE + '.json';
    const response = await axios.get(urlServer);
    if (response.data.status == false) {
      logger.error("Key của bạn đã hết hạn hoặc đã bị Admin hủy kích hoạt vui lòng liên hệ admin để biết thêm chi tiết");
      process.exit();
    } else {
      if (response.data.lock == true) {
        logger.error("Key của bạn đã bị Admin khóa, vui lòng liên hệ Admin để biết thêm chi tiết");
        process.exit();
      } else {
        if (config.GBOTWAR_ACTIVE.EMAIL != response.data.email) {
          logger.error("Email kích hoạt key với email xác thực của bạn không khớp! Vui lòng liên hệ admin để biết thêm chi tiết.");
          process.exit();
        }
        if (response.data.type === "admin") {
          logger.system("Bạn đang sử dụng Key ADMIN bạn có quyền sử dụng mọi lệnh");
        }
        if (response.data.type === "testing" && config.GBOTWAR_ACTIVE.KEY_ACTIVE === 'GSFREEALPHABOT') {
          logger.warn('Key của bạn là key chia sẻ vì vậy sẽ bị hạn chế 1 số tính năng');
        } else {
          logger.info('Xin chào ' + response.data.name + ', Cám ơn bạn đã sử dụng phiên bản thương mại của chúng tôi');
          logger.info('Key của bạn được kích hoạt vào: ' + response.data.time);
          logger.info('Email của bạn là: ' + response.data.email + ' trong trường hợp yêu cầu cấp lại key chúng tôi sẽ gửi về email này!');
        }
      }
    }
  } catch (e) {
    logger.error("Bạn chưa kích hoạt Gbot vui lòng liên hệ admin qua zalo: 0348253995 để mua key kích hoạt và hướng dẫn sử dụng");
    logger.error('Chúng tôi sẽ tự động chuyển hướng bạn qua trang kích hoạt trong 5s nữa')
    await new Promise(resolve => {
      setTimeout(resolve, 5000);
    });
    execSync('npm run active', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }
}

function handleRestartCount() {
  restartCount++;
  setTimeout(() => {
    restartCount--;
  }, _1_MINUTE);
}
main();