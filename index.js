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
const { getAvatar, account, getFriends, getGroups } = require('./qq');
const { formatTime, mozaiku, map2obj } = require('./lib');
const { accountRouter } = require('./routers/account');
const { deleteAllCode, getAllUsers } = require('./db');
const { answerRouter } = require('./routers/answer');
const { alarmRouter } = require('./routers/alarm');

setTimeout(() => {
    deleteAllCode();
}, 3000);

var app = express();
const port = config.port;

app.use(session({
    name: 'chino',
    secret: 'oimasterakioi',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.locals.formatTime = formatTime;
app.locals.mozaiku = mozaiku;
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
app.get('/dashboard', async (req, res) => {
    res.render('dashboard', {friend: map2obj(getFriends()), group: map2obj(getGroups()), users: (await getAllUsers())});
});
app.use('/', accountRouter);
app.use('/answer', answerRouter);
app.use('/alarm', alarmRouter);

app.listen(port, () => {
    console.log('网页端正在监听端口', port);
});
