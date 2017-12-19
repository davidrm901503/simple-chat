var socketio = require('socket.io');
var io;
var db = require('./db');

var usuarios = {};
var clients = [];
var namesUsed = [];

exports.listen = function(server) {
    io = socketio.listen(server);
    io.sockets.on('connection', function(socket) {
        escogerNick(socket);
        usuariosActivos(socket);
        showOldMsgs(socket);
        broadcastMsg(socket);
        privateMsg(socket);
        desconectar(socket);
        isTyping(socket)
    });
}

function desconectar(socket) {
    socket.on('disconnect', function() {
        var ind = namesUsed.indexOf(usuarios[socket.id]);
        delete namesUsed[ind];
        delete clients[ind];
        delete usuarios[socket.id];
        io.sockets.emit('user disconnect', ind);
    });
}

function showOldMsgs(socket) {
    db.getOld(5, function(err, docs) {
        socket.emit('load old', docs);
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
        db.saveMsg({ nick: nick, msg: msg }, function(err) {
            if (err) throw err;
            io.sockets.emit('message', { nick: nick, msg: msg });
        });
    });
}

function privateMsg(socket) {
    socket.on('private message', function(data) {
        var from = usuarios[socket.id];
        clients[data.userToPM].emit('private message', { from: from, msg: data.msg });
    });
}


function isTyping(socket) {

    socket.on('is typing', function() {
        io.sockets.emit('user typing', { nick: usuarios[socket.id] });
    });
    socket.on('stopped typing', function() {
        io.sockets.emit('stop typing', { nick: usuarios[socket.id] });
    });

}