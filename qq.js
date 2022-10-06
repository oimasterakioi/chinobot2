const { createClient } = require('oicq');

const config = require('./config.json');
const { queryQuestion } = require('./db');
const { getCode } = require('./lib');
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

client.on('message.private.friend', (e) => {
    if (e == '验证码') {
        let code = getCode(e.sender.user_id);
        e.reply('验证码是「' + code + '」，一分钟内有效。');
    } else {
        e.reply('对不起，我不明白您的意思。');
    }
});
client.on('message.group', async (e) => {
    let atme = e.atme;
    let answers = await queryQuestion(e.group_id, atme);

    console.log(e.raw_message);
    for(let i of answers){
        console.log(i.keyword, e.raw_message.indexOf(i.keyword));
        if(e.raw_message.indexOf(i.keyword) != -1){
            e.reply(i.answer);
            // e.reply(i.answer + '\n---------\n这是由用户「' + i.creator + '」设置的自定义问答。');
        }
    }
});

async function sendPrivateMessage(user_id, message){
    return await client.sendPrivateMsg(user_id, message);
}
async function sendGroupMessage(group_id, message){
    return await client.sendGroupMsg(group_id, message);
}
function getAvatar(){
    return client.pickUser(account).getAvatarUrl(100);
}

function getFriends(){
    return client.getFriendList();
}
function getGroups(){
    return client.getGroupList();
}

function inGroup(group_id){
    let groups = getGroups();
    return (groups[group_id] != null)
}
async function hasPermission(user_id, group_id){
    console.log(user_id, group_id, client);
    try{
        let info = await client.getGroupMemberInfo(group_id, user_id);
        console.log(info);
        return info.role == 'owner' || info.role == 'admin';
    } catch {
        return false;
    }
}

module.exports = {
    account,
    sendPrivateMessage,
    sendGroupMessage,
    getFriends,
    getGroups,
    getAvatar,
    inGroup,
    hasPermission
};