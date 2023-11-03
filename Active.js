/**
* @author    Nhat Vu
* @github    https://github.com/nhatcoder2003
* @channel   https://youtube.com/@nvcoder
* @facebook  https://www.facebook.com/vuminhnhat10092003
*/
import {
  resolve as resolvePath
} from 'path';
import {
  readFileSync,
  readdirSync,
  writeFileSync,
  unlinkSync
} from "fs";
import {
  execSync
} from 'child_process'
import inquirer from 'inquirer';
import logger from './System/Core/helpers/console.js';
import axios from 'axios';
import Banner from './System/Banner.js';
global.mainPath = resolvePath(process.cwd());
global.Config = loadConfig();
Banner();
//console.log(global.Config.NAME)
logger.warn("Nếu chưa có key kích hoạt hãy liên hệ với admin qua zalo: 0348253995 để mua key kích hoạt");
logger.warn('Trong trường hợp nhập sai email hãy chạy lại lệnh này để setup lại key');
async function active() {
  inquirer.prompt([{
    type: 'text',
    name: 'key',
    message: 'Nhập key kích hoạt:'
  }, {
    type: 'text',
    name: 'email',
    message: 'Nhập email của key kích hoạt'
  }]).then(result => {
    if (result.key === '') {
      logger.error('Vui lòng nhập key kích hoạt');
      process.exit();
    } else if (result.email === '') {
      logger.error('Vui lòng nhập email của key kích hoạt');
      process.exit();
    } else {
      try {
        const urlServer = `https://raw.githubusercontent.com/nhatcoder2003/AlphabotServer/main/ACTIVE/${result.key}.json`;
        axios.get(urlServer).then(response => {
          const {
            data
          } = response;
          //console.log(data.email)
          if (result.email !== data.email) {
            logger.error('Email bạn nhập không giống email đã đăng ký key kích hoạt, vui lòng kiểm tra lại!');
            process.exit();
          } else {
            logger.info(`Kích hoạt ALPHABOT thành công\nĐây là thông tin của bạn\nHọ và tên: ${data.name}\nEmail: ${data.email}\nNgày kích hoạt: ${data.time}\nNgày hết hạn: ${data.expiration}\nChúc bạn trải nghiệm vui vẻ`);
            global.Config.GBOTWAR_ACTIVE.KEY_ACTIVE = result.key;
            global.Config.GBOTWAR_ACTIVE.EMAIL = result.email;
            global.Config.GBOTWAR_ACTIVE.WELECOME = false;
            global.Config.save();
          }
        });

      }catch(e) {
        logger.error('Key kích hoạt không tồn tại hoặc bạn đã nhập sai, Vui lòng liên hệ admin để được hỗ trợ');
        console.log(e)
        process.exit();
      }
    }
  })
}
function loadConfig() {
  const config = JSON.parse(
    readFileSync(
      resolvePath(global.mainPath, "Config", "config.main.json"),
      "utf8"
    )
  );

  if (!config.hasOwnProperty("REFRESH")) config.REFRESH = "43200000";
  if (!config.hasOwnProperty("ABSOLUTES")) config.ABSOLUTES = [];

  config.save = () => {
    const configStringified = JSON.stringify(
      config,
      (key, value) => {
        if (key == "save") return undefined;
        return value;
      },
      4
    );
    const configPathTemp = resolvePath(
      global.mainPath,
      "Config",
      "config.main.temp.json"
    );

    writeFileSync(configPathTemp,
      configStringified,
      "utf8");
    writeFileSync(
      resolvePath(global.mainPath, "Config", "config.main.json"),
      configStringified,
      "utf8"
    );

    unlinkSync(configPathTemp);
  };

  config.save();

  return config;
}
active();