const { createClient } = require('oicq');

const config = require('./config.json');
const account = config.account;
const password = config.password;

const client = createClient(account);
client
    .on('system.login.slider',
        (e) => {
            console.log('请输入 ticket。');
            process.stdin.once('data', (ticket) => {
                this.submitSlider(String(ticket).trim());
            });
        })
    .login(password);

client.on('system.login.device', () => {
    client.sendSmsCode();
    console.log('请输入手机验证码。');
    process.stdin.once('data', (code) => {
        client.submitSmsCode(code);
        client.login();
    });
});

client.on('system.online', async () => {
    console.log('QQ 客户端登录成功！');
    let setStatus = await client.setOnlineStatus(41);
    if (setStatus == true)
        console.log('QQ 成功设置状态为「隐身」');
    else
        console.log('QQ 设置「隐身」状态失败。');
});


client.on('request.friend.add', (e) => {
    e.approve(true);
    setTimeout(() => {
        client.sendPrivateMsg(e.user_id, '您好，我是チノ。\nこんにちは、チノです。\nOI-Master Studio出品。');
    }, 5000);
});
client.on('request.group.invite', (e) => {
    e.approve(true);
    setTimeout(() => {
        client.sendGroupMsg(e.group_id, '你们好，我是チノ。\nこんにちは、チノです。\nOI-Master Studio出品。');
    }, 10000);
});

function setPrivate(getCode) {
    client.on('message.private.friend', (e) => {
        if (e == '验证码') {
            let code = getCode(e.sender.user_id);
            e.reply('验证码是「' + code + '」，一分钟内有效。');
        } else {
            e.reply('对不起，我不明白您的意思。');
        }
    });
}
function setGroup(handler) {
    client.on('message.group', (e) => {
        handler(e);
    });
}

async function sendPrivateMessage(user_id, message){
    return await client.sendPrivateMsg(user_id, message);
}
async function sendGroupMessage(group_id, message){
    return await client.sendGroupMsg(group_id, message);
}
function getAvatar(){
    return client.pickUser(account).getAvatarUrl(100);
}

module.exports = {
    account,
    setPrivate,
    setGroup,
    sendPrivateMessage,
    sendGroupMessage,
    getAvatar
}