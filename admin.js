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
import {execSync} from 'child_process'
import inquirer from 'inquirer';
import logger from './System/Core/helpers/console.js';
import Banner from './System/Banner.js';
global.mainPath = resolvePath(process.cwd());
global.Config = loadConfig();
Banner();
//console.log(global.Config.NAME)
inquirer.prompt([{
  type: 'text',
  name: 'id_admin',
  message: 'Nhập ID ADMIN:'
}]).then(data => {

  if (data.id_admin === "") {
    logger.error('Vui lòng nhập ID ADMIN');
    //process.exit()
  } else {
    if (global.Config.MODERATORS.some(id => id == data.id_admin) || global.Config.ABSOLUTES.some(id => id == data.id_admin)) {
      logger.error('ID NÀY ĐÃ LÀ SUPPER ADMIN');
      process.exit();
    } else {
      global.Config.MODERATORS.push(String(data.id_admin));
      global.Config.ABSOLUTES.push(String(data.id_admin))
      global.Config.save();
      logger.info('Cấp quyền Supper Admin Thành Công');
      Promise(resolve => {
        setTimeout(resolve, 3000)
      });
      execSync('npm run start', {
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: true
      })
    }

  }
})
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
