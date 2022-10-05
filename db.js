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
async function del(collection, whereStr){
    let result = await db.collection(collection).deleteMany(whereStr);
    console.log('delete', collection, whereStr, result);
    return result;
}

async function login(username, password){
    password = SHA256(password);
    return (await query('user', {username: username, password: password})).length != 0;
}
async function getQQ(username){
    return (await query('user', {username: username}))[0].qq;
}

// await query('user', {username: 'oimaster'});
// await insert('user', {username: 'oimaster', password: 'chinokafuu'});
// await query('user', {username: 'oimaster'});
// await del('user', {username: 'oimaster'});
// await query('user', {username: 'oimaster'});

module.exports = {
    login,
    getQQ
};