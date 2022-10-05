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
const { setPrivate, setGroup, getAvatar } = require('./qq');
const { getCode, formatTime, isLoggedIn, error } = require('./lib');
const { isObject } = require('util');
const { login, getQQ } = require('./db');

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

app.listen(port, () => {
    console.log('网页端正在监听端口', port);
})
