import {
  resolve as resolvePath
} from 'path';
import {
  readFileSync
} from 'fs';
const config = {
  name: "gonhay",
  aliases: ["n"],
  description: "Nhây",
  usage: "",
  cooldown: 3,
  permissions: [2],
  credits: "Nhật Ngáo",
  extra: {
    time: 2000
  }
};

if (!global.gonhay) {
  global.gonhay = [];
}
let LOADING_SEND = 0;
async function Running( {
  args, message, extra
}) {
  const {
    time
  } = extra;
  const list = JSON.parse(readFileSync(resolvePath(global.NVCODER.Lyrics, 'gonhay.json')));
  let select = args[0]?.toLowerCase();
  switch (select) {
    case 'stop':
      //const isStop = args[0]?.toLowerCase() === 'stop';
      const isStop = global.gonhay.indexOf(message.threadID);
      if (isStop > -1) {
        global.gonhay.splice(isStop, 1);
        return message.reply(global.config.GBOTWAR_MESSAGE.GONHAY_STOP);
      } else {
        return message.reply('Mày đang bị ngáo lồn à ?');
      }
      break;
    default:
      if (global.gonhay.indexOf(message.threadID) > -1) {
        return message.reply('Mày muốn bị Facebook khóa mõm tới vậy à ?');
      } else {
        global.gonhay.push(message.threadID);
        while (global.gonhay.indexOf(message.threadID) > -1) {
          message.send(list[LOADING_SEND]).catch(e => {
            console.error(e);
          });
          LOADING_SEND = (LOADING_SEND + 1) % list.length;
          await new Promise(resolve => {
            setTimeout(resolve, time)
          });

        }
      }

    }
  }
  export default {
    config,
    Running
  }