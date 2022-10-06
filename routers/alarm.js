const { Router } = require("express");
const { isMyAlarm, updateAlarm, getAllAlarms, deleteAlarm, insertAlarm } = require("../db");
const { isLoggedIn, error, randstr, randint } = require("../lib");
const { hasPermission } = require("../qq");

var alarmRouter = Router();
alarmRouter.get('/', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let all = await getAllAlarms(res.locals.username);
    // res.render('alarm', {alarms: [{
    //     id: randstr(),
    //     group_id: randint(100000, 10000000000),
    //     days: [1, 2, 3, 4, 5],
    //     time: '12:34',
    //     need_at: true,
    //     content: 'Hello, world!',
    //     creator: 'oimaster'
    // }]});
    res.render('alarm', {alarms: all});
});
alarmRouter.post('/update', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = req.body.id;
    let group_id = parseInt(req.body.group_id);
    let days = req.body.days;
    let time = req.body.time;
    let timestr = time;
    let need_at = req.body.need_at == 'true';
    let content = req.body.content;

    time = time.split(':');
    if(time.length != 2){
        error(res, '时间格式错误。');
        return;
    }
    time[0] = parseInt(time[0]);
    time[1] = parseInt(time[1]);
    if(time[0] == NaN || time[1] == NaN){
        error(res, '时间格式错误。');
        return;
    }

    if(await isMyAlarm(id, res.locals.username) == false){
        error(res, '找不到对应的提醒。');
        return;
    }

    if(days == null){
        error(res, '至少要选择一天。');
        return;
    }
    for(let i = 0; i < days.length; ++i){
        days[i] = parseInt(days[i]);
        if(days[i] == NaN){
            error(res, '星期不合法。');
            return;
        }
    }
    if(content == ''){
        error(res, '内容不能为空！');
        return;
    }

    if((await hasPermission(res.locals.qq, group_id)) == false){
        error(res, '您在群聊「' + group_id + '」中没有管理员权限。');
        return;
    }
    
    await updateAlarm(id, {group_id, days, time, need_at, timestr, content});
    res.redirect('/alarm');
});

alarmRouter.post('/delete', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = req.body.id;

    if(await isMyAlarm(id, res.locals.username) == false){
        error(res, '找不到对应的问题。');
        return;
    }
    
    await deleteAlarm(id);
    res.redirect('/alarm');
});

alarmRouter.post('/insert', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = randstr();
    let group_id = parseInt(req.body.group_id);
    let days = req.body.days;
    let time = req.body.time;
    let timestr = time;
    let need_at = req.body.need_at == 'true';
    let content = req.body.content;

    time = time.split(':');
    if(time.length != 2){
        error(res, '时间格式错误。');
        return;
    }
    time[0] = parseInt(time[0]);
    time[1] = parseInt(time[1]);
    if(time[0] == NaN || time[1] == NaN){
        error(res, '时间格式错误。');
        return;
    }

    if(days == null){
        error(res, '至少要选择一天。');
        return;
    }
    for(let i = 0; i < days.length; ++i){
        days[i] = parseInt(days[i]);
        if(days[i] == NaN){
            error(res, '星期不合法。');
            return;
        }
    }

    if(content == ''){
        error(res, '内容不能为空！');
        return;
    }
    
    if((await hasPermission(res.locals.qq, group_id)) == false){
        error(res, '您在群聊「' + group_id + '」中没有管理员权限。');
        return;
    }
    
    let creator = res.locals.username;
    
    await insertAlarm(id, group_id, days, time, timestr, need_at, content, creator);
    res.redirect('/alarm');
});

module.exports = {
    alarmRouter
};