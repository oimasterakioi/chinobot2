const { Router } = require("express");
const { isMyQuestion, updateQuestion, getAllQuestions, deleteQuestion, insertQuestion } = require("../db");
const { isLoggedIn, error, randstr } = require("../lib");
const { hasPermission } = require("../qq");

var answerRouter = Router();
answerRouter.get('/', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let all = await getAllQuestions(res.locals.username);
    res.render('answer', {questions: all});
});
answerRouter.post('/update', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = req.body.id;
    let group_id = parseInt(req.body.group_id);
    let keyword = req.body.keyword;
    let need_at = req.body.need_at == 'true';
    let answer = req.body.answer;

    if(await isMyQuestion(id, res.locals.username) == false){
        error(res, '找不到对应的问题。');
        return;
    }

    if((await hasPermission(res.locals.qq, group_id)) == false){
        error(res, '您在群聊「' + group_id + '」中没有管理员权限。');
        return;
    }
    
    await updateQuestion(id, {group_id, keyword, need_at, answer});
    res.redirect('/answer');
});

answerRouter.post('/delete', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = req.body.id;

    if(await isMyQuestion(id, res.locals.username) == false){
        error(res, '找不到对应的问题。');
        return;
    }
    
    await deleteQuestion(id);
    res.redirect('/answer');
});

answerRouter.post('/insert', async (req, res) => {
    if(isLoggedIn(res) == false){
        error(res, '您还没有登录。');
        return;
    }

    let id = randstr();
    let group_id = parseInt(req.body.group_id);
    let keyword = req.body.keyword;
    let need_at = req.body.need_at == 'true';
    let answer = req.body.answer;

    if((await hasPermission(res.locals.qq, group_id)) == false){
        error(res, '您在群聊「' + group_id + '」中没有管理员权限。');
        return;
    }
    
    let creator = res.locals.username;
    
    await insertQuestion(id, group_id, keyword, need_at, answer, creator);
    res.redirect('/answer');
});

module.exports = {
    answerRouter
};