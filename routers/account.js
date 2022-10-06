const { Router } = require("express");
const { isLoggedIn, verifyCode, error } = require("../lib");
const { login, getQQ, register, checkSame } = require('../db');

var accountRouter = Router();
accountRouter.get('/login', (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    res.render('login');
});
accountRouter.post('/login', async (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    let username = req.body.username;
    let password = req.body.password;

    if(await login(username, password)){
        req.session.username = username;
        req.session.qq = await getQQ(username);
        res.redirect('/');
        return;
    }
    
    error(res, '用户名或密码错误。');
});

accountRouter.get('/register', (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    res.render('register');
});

accountRouter.post('/register', async (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    let username = req.body.username;
    let password = req.body.password;
    let qq = req.body.qq;
    let code = req.body.code;

    qq = parseInt(qq);
    code = parseInt(code);
    username = username.trim();
    password = password.trim();

    if(!qq || !code || username == '' || password == ''){
        error(res, '不合法的表单。');
        return;
    }
    if(password.length < 6){
        error(res, '密码至少需要 6 个字符。');
        return;
    }

    let codeRes = verifyCode(qq, code);
    if(codeRes == 0){
        error(res, '验证码不正确。');
        return;
    }
    if(codeRes == -1){
        error(res, '验证码过期。');
        return;
    }

    if(await checkSame(username, qq)){
        error(res, '用户名或 QQ 已经被注册过。');
        return;
    }

    register(username, password, qq);
    req.session.username = username;
    req.session.qq = qq;

    res.redirect('/');
});

accountRouter.get('/logout', (req, res) => {
    if(!isLoggedIn(res)){
        error(res, '您还没有登录。');
        return;
    }
    res.render('logout');
});
accountRouter.post('/logout', async (req, res) => {
    if(!isLoggedIn(res)){
        error(res, '您还没有登录。');
        return;
    }

    req.session.destroy();
    res.redirect('/');
});

module.exports = {
    accountRouter
};