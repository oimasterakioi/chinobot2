const SHA256 = require('./sha256');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/chino';
var db;

MongoClient.connect(url).then((res) => {
    console.log('成功连接到数据库');
    db = res.db('chino');
});

async function query(collection, whereStr){
    let result = await db.collection(collection).find(whereStr).toArray();
    console.log('query', collection, whereStr, result);
    return result;
}
async function insert(collection, object){
    let result = await db.collection(collection).insertOne(object);
    console.log('insert', collection, object, result);
    return result;
}
async function update(collection, whereStr, object){
    let upgrade = { $set: object };
    let result = await db.collection(collection).updateMany(whereStr, upgrade);
    console.log('update', collection, whereStr, upgrade, result);
    return result;
}
async function del(collection, whereStr){
    let result = await db.collection(collection).deleteMany(whereStr);
    console.log('delete', collection, whereStr, result);
    return result;
}

async function login(username, password){
    password = SHA256(password);
    return (await query('user', {username, password})).length != 0;
}
async function register(username, password, qq){
    password = SHA256(password);
    return (await insert('user', {username, password, qq}));
}
async function getQQ(username){
    return (await query('user', {username}))[0].qq;
}
async function checkSame(username, qq){
    let uname = (await query('user', {username})).length != 0;
    let uqq = (await query('user', {qq})).length != 0;
    return uname || uqq;
}

async function insertCode(qq, code){
    return (await insert('code', {qq, code}));
}
async function queryCode(qq, code){
    return (await query('code', {qq, code})).length != 0;
}
async function deleteCode(qq){
    return (await del('code', {qq}));
}

async function deleteAllCode(){
    return (await del('code', {}));
}
async function getAllUsers(){
    return (await query('user', {}));
}

async function insertQuestion(id, group_id, keyword, need_at, answer, creator){
    return (await insert('question', {id, group_id, keyword, need_at, answer, creator}));
}
async function getAllQuestions(username){
    return (await query('question', {creator: username}));
}
async function isMyQuestion(id, creator){
    return (await query('question', {id, creator})).length != 0;
}
async function queryQuestion( group_id, at = true ){
    if(at == false)
        return (await query('question', {group_id, need_at: false}));
    return (await query('question', {group_id}));
}
async function deleteQuestion(id){
    return (await del('question', {id}));
}
async function updateQuestion(id, question){
    return (await update('question', {id}, question));
}

async function insertAlarm(id, group_id, days, time, timestr, need_at, content, creator){
    return (await insert('alarm', {id, group_id, days, time, timestr, need_at, content, creator}));
}
async function getAllAlarms(username){
    return (await query('alarm', {creator: username}));
}
async function isMyAlarm(id, creator){
    return (await query('alarm', {id, creator})).length != 0;
}
async function queryAlarm( time ){
    return (await query('alarm', {time}));
}
async function deleteAlarm(id){
    return (await del('alarm', {id}));
}
async function updateAlarm(id, alarm){
    return (await update('alarm', {id}, alarm));
}

// await query('user', {username: 'oimaster'});
// await insert('user', {username: 'oimaster', password: 'chinokafuu'});
// await query('user', {username: 'oimaster'});
// await del('user', {username: 'oimaster'});
// await query('user', {username: 'oimaster'});

module.exports = {
    login,
    register,
    getQQ,
    checkSame,
    insertCode,
    queryCode,
    deleteCode,
    deleteAllCode,
    getAllUsers,
    insertQuestion,
    queryQuestion,
    isMyQuestion,
    getAllQuestions,
    deleteQuestion,
    updateQuestion,
    insertAlarm,
    queryAlarm,
    isMyAlarm,
    getAllAlarms,
    deleteAlarm,
    updateAlarm
};