//    +------------------+
//    | OI-Master Studio |
//    |  Chino Bot 2.0   |
//    +------------------+

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const moment = require("moment");
const path = require("path");
const os = require('os');

const config = require('./config.json');
const { setPrivate, setGroup, getAvatar, account } = require('./qq');
const { getCode, formatTime, isLoggedIn, error, verifyCode } = require('./lib');
const { isObject } = require('util');
const { login, getQQ, register } = require('./db');

var app = express();
const port = config.port;

setPrivate(getCode);
setGroup((e) => {
    console.log(e);
});

app.use(session({
    name: 'chino',
    secret: 'oimasterakioi',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.locals.formatTime = formatTime;
app.use('/static', express.static(path.join(__dirname, 'static')));

app.locals.avatarUrl = getAvatar();
let cpuModel = os.cpus()[0].model;
app.locals.cpu = (cpuModel == undefined ? '' : cpuModel);
app.locals.botqq = account;

app.use((req, res, next) => {
    res.locals.username = req.session.username;
    res.locals.qq = req.session.qq;
    res.locals.currTime = moment().format('LLLL');
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    res.render('login');
});
app.post('/login', async (req, res) => {
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

app.get('/register', (req, res) => {
    if(isLoggedIn(res)){
        error(res, '您已经登录过了。');
        return;
    }
    res.render('register');
});
app.post('/register', async (req, res) => {
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

    register(username, password, qq);
    req.session.username = username;
    req.session.qq = qq;

    res.redirect('/');
});

app.listen(port, () => {
    console.log('网页端正在监听端口', port);
})
