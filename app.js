/*  Copyright 2012-2016 QiuYuhui

 written by : qiu
 written for : http://inir.cn/realtime-multiplayer/
 MIT Licensed.

 Usage : node app.js
 */

var http = require('http'),
    socket = require('socket.io'),
    express = require('express'),
    UUID = require('node-uuid'),
    app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 4004,
    verbose = true;  //false;

//服务端监听端口
server.listen(port);

//答应监听信息
console.log('Listening on port %d', port);

//指定/路径到index.html文件
app.get('/', function (req, res) {
    console.log('trying to load %s', __dirname + '/index.html');
    res.sendfile('/index.html', {root: __dirname});
});

//指定/*路径，*代表相应的文件输出显示
app.get('/*', function (req, res, next) {
    var file = req.params[0];
    if (verbose) console.log('\t :: Express :: file requested : ' + file);
    res.sendfile(__dirname + '/' + file);
}); //app.get *

/* Socket.IO server set up. */
//创建一个 socket.io 实例使用 express server
var io = socket.listen(server);

//socket.io 配置
//See http://socket.io/
io.configure(function () {
    io.set('log level', 0);

    io.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
    });

});

