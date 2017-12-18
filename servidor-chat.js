var socketio = require('socket.io');
var io;

var usuarios = {};
var clients = [];
var namesUsed = [];

exports.listen = function(server) {
    io = socketio.listen(server);
    io.sockets.on('connection', function(socket) {
        escogerNick(socket);
        usuariosActivos(socket);
        broadcastMsg(socket);
        privateMsg(socket);
    });
}

function usuariosActivos(socket) {
    var activeNames = [];
    var usersInRoom = io.sockets.clients().sockets;
    for (var index in usersInRoom) {
        var userSocketId = usersInRoom[index].id;
        if (userSocketId !== socket.id && usuarios[userSocketId]) {
            var name = usuarios[userSocketId];
            activeNames.push({ id: namesUsed.indexOf(name), nick: name });
        }
    }
    socket.emit('names', activeNames);
}


function escogerNick(socket) {
    socket.on('escoger usuario', function(nick, cb) {
        if (namesUsed.indexOf(nick) !== -1) {
            cb('ya exite el nombre');
            return;
        }
        var ind = namesUsed.push(nick) - 1;
        clients[ind] = socket;
        usuarios[socket.id] = nick;
        cb(null);
        io.sockets.emit('new user', { id: ind, nick: nick });
    });
}

function broadcastMsg(socket) {
    socket.on('message', function(msg) {
        var nick = usuarios[socket.id];
        io.sockets.emit('message', { nick: nick, msg: msg });
    });
}

function privateMsg(socket) {
    socket.on('private message', function(data) {
        var from = usuarios[socket.id];
        clients[data.userToPM].emit('private message', { from: from, msg: data.msg });
    });
}