/**
* @author    Nhat Vu
* @github    https://github.com/nhatcoder2003
* @channel   https://youtube.com/@nvcoder
* @facebook  https://www.facebook.com/vuminhnhat10092003
*/
import nhatcoder from 'nhatcoder-fb-api';
import Banner from './System/Banner.js';
import logger from './System/Core/helpers/console.js';
import fs from 'fs';
import readline from 'readline';
import inquirer from 'inquirer';
import chalk from 'chalk';
import prompt from 'prompt-sync';
import {
  resolve as resolvePath
} from "path";
import totp from 'totp-generator';
import {
  spawn,
  execSync
} from 'child_process';
//const argv = process.argv[2];
const config = JSON.parse(fs.readFileSync('./Config/config.main.json'));


let rl = readline.createInterface({
  input: process.stdin,
  outout: process.stdout
});

Banner();
const argv = process.argv[2];
logger.custom("Chúng tôi tuyệt đối không lưu trữ bất kỳ thông tin tài khoản, mật khẩu nào của người dùng.\n", "Lưu ý");
//console.log(argv)
loginAccount();
async function loginAccount() {
  const options = {
    "logLevel": "silent",
    "forceLogin": true,
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36"
  }
  inquirer.prompt([{
    type: "text",
    name: "emailText",
    message: "Email or SĐT:"
  }, {
    type: "text",
    name: "passwordText",
    message: "Mật khẩu:"
  }]).then(data => {
    let emailText = data.emailText;
    let passwordText = data.passwordText;
    if (data.emailText === "") {
      logger.error("Vui lòng nhập email!");
    } else if (data.passwordText === "") {
      logger.error("Vui lòng nhập mật khẩu");
    } else {

      nhatcoder({
        email: emailText,
        password: passwordText
      },
        config.FCA_OPTIONS,
        (err, api) => {
          if (err) {
            switch (err.error) {
              case 'login-approval':
                rl.on('key', key => {
                  console.log('Vui lòng nhập mã xác thực 2 yếu tố:')
                  err.continue(key);
                  rl.close();
                });
                break;
              default:
                logger.error(err.error);
                process.exit();
              }
            }
            logger.info('Đăng nhập thành công tài khoản Facebook có ID là: '+api.getCurrentUserID());
            //Tiến hành lưu appstate
            const appstate = JSON.stringify(api.getAppState());
            fs.writeFileSync('./appstate.json', appstate);

            logger.info("Hệ thống đã tự động lưu Appstate thành công,Lần tới bạn sẽ không cần đăng nhập lại nữa!");
            //console.log(global.Config.NNAME
            Sleep(1500);
            if (argv === '--starting') {
              logger.system('Bắt đầu thiết lập tài khoản admin');
              Sleep(1000);
              execSync('npm run admin', {
                stdio: 'inherit', cwd: process.cwd()});
            } else {
              logger.system('Tiến hành khởi động Gbot War');
              Sleep(1000);
              execSync('npm run start', {
                stdio: 'inherit', cwd: process.cwd()})
            }
          });
      }
    });
  }
  async function Sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve,
        ms);
    })
  }