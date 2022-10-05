const moment = require("moment");
const { insertCode, deleteCode, queryCode } = require("./db");
const SHA256 = require("./sha256");

function map2obj(map) {
    const obj = Object.create(null);
    map.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

moment.locale('zh-cn');
function formatTime(time){
    return moment.unix(time).format('LLLL');
}

function randint(low, high){
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function randstr(length){
    let rid = randint(1, 999999);
    return SHA256('' + rid).substr(0, length);
}

function getCode(qq){
    let c = randint(100000, 999999);
    insertCode(qq, c);
    setTimeout(function(){
        deleteCode(qq, c);
    }, 60000);
    return c;
}
function verifyCode(qq, c){
    return queryCode(qq, c);
}

function isLoggedIn(res){
    return res.locals.username != undefined;
}
function error(res, message) {
    res.render('error', {message: message});
}

module.exports = {
    map2obj,
    formatTime,
    randint,
    randstr,
    getCode,
    verifyCode,
    isLoggedIn,
    error
}
