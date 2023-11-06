const config = {
  name: "taobox",
  aliases: ['rb',
    'regbox'],
  description: "Tạo box số lượng lớn",
  credits: "Nhật Ngáo",
  usage: "[SL] [TÊN BOX]",
  isAbsolute:true,
  extra: {
    delay: 450
  }
}
if (!global.regbox) {
  global.regbox = new Set();
}
async function Running( {
  message, args, extra
}) {
  const {
    participantIDs,
    senderID,
    threadID,
    messageID,
    isGroup,
    send
  } = message;
  //if (!isGroup)return;
  const LIST_MEMBER = participantIDs.filter(e => e != senderID).map((e) => e);
  let NAME_BOX = args.join(' ');
  global.taobox.add(threadID);


  for (let i = 0; i < 10; i++) {
    //if (global.regbox.has(threadID)) return;
    const NEW_BOX = await global.api.createNewGroup(LIST_MEMBER, NAME_BOX);
    console.log(LIST_MEMBER)
    global.api.sendMessage('Tới con má mày rồi', NEW_BOX);
    await new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
  }

}
export default {
  config,
  Running
}