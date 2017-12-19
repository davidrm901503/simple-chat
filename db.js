var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('conectado!');
});


var esquema = mongoose.Schema({
    nick: String,
    msg: String,
    created: { type: Date, default: Date.now }
});

var Msg = mongoose.model('Message', esquema);

exports.getOld = function(limit, cb) {
    var query = Msg.find({});
    query.sort('-created').limit(limit).exec(function(err, docs) {
        cb(err, docs);
    });
}

exports.saveMsg = function(data, cb) {
    var newMsg = new Msg({ msg: data.msg, nick: data.nick });
    newMsg.save(function(err) {
        cb(err);
    });
};