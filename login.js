/**
 * @author    Nhat Vu
 * @github    https://github.com/nhatcoder2003
 * @channel   https://youtube.com/@nvcoder
 * @facebook  https://www.facebook.com/vuminhnhat10092003
 */

import fs from 'fs';
import inquirer from 'inquirer';
import nhatcoder from 'nhatcoder-fb-api';
import child_process from 'child_process';

import Banner from './System/Banner.js';
import logger from './System/Core/helpers/console.js';

// Hàm đọc và trả về nội dung của tệp cấu hình
function getConfig() {
  return JSON.parse(fs.readFileSync('./Config/config.main.json'));
}

// Hàm hiển thị giao diện yêu cầu nhập thông tin đăng nhập
async function promptCredentials() {
  const { emailText, passwordText } = await inquirer.prompt([
    {
      type: "input",
      name: "emailText",
      message: "Email or SĐT:",
    },
    {
      type: "password",
      name: "passwordText",
      message: "Mật khẩu:",
    }
  ]);

  return { emailText, passwordText };
}

// Hàm thực hiện đăng nhập vào tài khoản NhatCoder
async function loginNhatcoder(config, email, password) {
  try {
    const api = await nhatcoder({ email, password }, config.FCA_OPTIONS);
    return api;
  } catch (error) {
    throw error;
  }
}

// Hàm lưu trạng thái ứng dụng (appstate) vào tệp
function saveAppstate(appstate) {
  try {
    fs.writeFileSync('./appstate.json', JSON.stringify(appstate));
  } catch (error) {
    throw error;
  }
}

// Hàm thực hiện lệnh shell (command)
function executeCommand(command) {
  try {
    logger.system('Bắt đầu thiết lập tài khoản admin');
    child_process.execSync(command, { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    throw error;
  }
}

// Hàm chính của ứng dụng
async function main() {
  try {
    Banner();
    logger.custom("Chúng tôi tuyệt đối không lưu trữ bất kỳ thông tin tài khoản, mật khẩu nào của người dùng.\n", "Lưu ý");

    const config = getConfig();
    const { emailText, passwordText } = await promptCredentials();

    if (!emailText || !passwordText) {
      logger.error("Vui lòng nhập email và mật khẩu!");
      return;
    }

    const api = await loginNhatcoder(config, emailText, passwordText);
    logger.info(`Đăng nhập thành công tài khoản Facebook có ID là: ${api.getCurrentUserID()}`);
    saveAppstate(api.getAppState());
    logger.info("Hệ thống đã tự động lưu Appstate thành công, Lần tới bạn sẽ không cần đăng nhập lại nữa!");

    await new Promise(resolve => setTimeout(resolve, 1500));

    const command = process.argv[2] === '--starting' ? 'npm run admin' : 'npm run start';
    executeCommand(command);
  } catch (error) {
    switch (error.error) {
      case 'login-approval':
        const rl = inquirer.createPromptModule()();
        const { key } = await rl.prompt({
          type: 'input',
          name: 'key',
          message: 'Vui lòng nhập mã xác thực 2 yếu tố:',
        });
        error.continue(key);
        break;
    }
  }
}

// Gọi hàm chính để khởi chạy ứng dụng
main();