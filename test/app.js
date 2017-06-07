/*  Copyright 2012-2016 QiuYuhui

 written by : qiu
 written for : http://inir.cn/realtime-multiplayer/
 MIT Licensed.

 Usage : node app.js
 */
var http = require('http'),
    io = require('socket.io'),
    express = require('express'),
    UUID = require('node-uuid'),
    app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 4004,
    verbose = true;  //false;

//服务端监听端口
server.listen(port)

//答应监听信息
console.log('Listening on port %d', port);

//指定/路径到index.html文件
app.get('/', function (req, res) {
    console.log('trying to load %s', __dirname + '/index.html');
    res.sendfile('/index.html', {root: __dirname});
});


//指定/*路径，*代表相应的文件输出显示
app.get('/*', function (req, res, next) {

    //This is the current file they have requested
    var file = req.params[0];

    //For debugging, we can track what files are requested.
    if (verbose) console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendfile(__dirname + '/' + file);

}); //app.get *


/* Socket.IO server set up. */
//创建一个 socket.io 实例使用 express server
var io = io.listen(server);

//socket.io 配置
//See http://socket.io/
io.configure(function () {
    io.set('log level', 0);

    io.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
    });

});

//Enter the game server code. The game server handles
//client connections looking for a game, creating games,
//leaving games, joining games and ending games when they leave.
game_server = require('./game.server.js');

//Socket.io will call this function when a client connects,
//So we can send that client looking for a game to play,
//as well as give that client a unique ID to use so we can
//maintain the list if players.
io.sockets.on('connection', function (client) {

    //Generate a new UUID, looks something like
    //5b2ca132-64bd-4513-99da-90e838ca47d1
    //and store this on their socket/connection
    client.userid = UUID();

    //tell the player they connected, giving them their id
    client.emit('onconnected', {id: client.userid});

    //now we can find them a game to play with someone.
    //if no game exists with someone waiting, they create one and wait.
    game_server.findGame(client);

    //Useful to know when someone connects
    console.log('\t socket.io:: player ' + client.userid + ' connected');


    //Now we want to handle some of the messages that clients will send.
    //They send messages here, and we send them to the game_server to handle.
    client.on('message', function (m) {

        game_server.onMessage(client, m);

    }); //client.on message

    //When this client disconnects, we want to tell the game server
    //about that as well, so it can remove them from the game they are
    //in, and make sure the other player knows that they left and so on.
    client.on('disconnect', function () {

        //Useful to know when soomeone disconnects
        console.log('\t socket.io:: client disconnected ' + client.userid + ' ' + client.game_id);

        //If the client was in a game, set by game_server.findGame,
        //we can tell the game server to update that game state.
        if (client.game && client.game.id) {

            //player leaving a game should destroy that game
            game_server.endGame(client.game.id, client.userid);

        } //client.game_id

    }); //client.on disconnect
}); //io.sockets.on connection
