/**
 * @author    Nhat Vu
 * @github    https://github.com/nhatcoder2003
 * @channel   https://youtube.com/@nvcoder
 * @facebook  https://www.facebook.com/vuminhnhat10092003
 */
import { resolve as resolvePath } from 'path';
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import Banner from './System/Banner.js';
import logger from './System/Core/helpers/console.js';

// Đường dẫn gốc của ứng dụng
const mainPath = resolvePath(process.cwd());

// Đối tượng cấu hình
const config = loadConfig(mainPath);

// Hiển thị banner
Banner();

// Hàm nhập ID ADMIN và cấp quyền Supper Admin
inquirer.prompt([{
  type: 'text',
  name: 'id_admin',
  message: 'Nhập ID ADMIN:'
}]).then(data => {
  const { id_admin } = data;

  if (!id_admin) {
    logger.error('Vui lòng nhập ID ADMIN');
  } else if (config.MODERATORS.includes(id_admin) || config.ABSOLUTES.includes(id_admin)) {
    logger.error('ID NÀY ĐÃ LÀ SUPPER ADMIN');
  } else {
    config.MODERATORS.push(id_admin);
    config.ABSOLUTES.push(id_admin);
    config.save();
    logger.info('Cấp quyền Supper Admin Thành Công');
    setTimeout(() => {
      execSync('npm run start', { stdio: 'inherit', cwd: mainPath, shell: true });
    }, 3000);
  }
});

/**
 * Hàm đọc và trả về nội dung của tệp cấu hình
 * @param {string} mainPath - Đường dẫn gốc của ứng dụng
 * @returns {object} - Đối tượng cấu hình
 */
function loadConfig(mainPath) {
  const configPath = resolvePath(mainPath, "Config", "config.main.json");
  let config = JSON.parse(readFileSync(configPath, "utf8"));

  if (!config.hasOwnProperty("REFRESH")) config.REFRESH = "43200000";
  if (!config.hasOwnProperty("ABSOLUTES")) config.ABSOLUTES = [];

  // Hàm lưu cấu hình
  config.save = () => {
    const { save, ...configToSave } = config;
    const configPathTemp = resolvePath(mainPath, "Config", "config.main.temp.json");

    writeFileSync(configPathTemp, JSON.stringify(configToSave, null, 4), "utf8");
    writeFileSync(configPath, JSON.stringify(configToSave, null, 4), "utf8");
    unlinkSync(configPathTemp);
  };

  config.save();

  return config;
}