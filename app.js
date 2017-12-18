var http = require('http'),
    express = require('express'),
    servidor = require('./servidor-chat');

var app = express();
app.use(express.static(__dirname + '/public'));
servidor.listen(http.createServer(app).listen('3000', '127.0.0.1'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});