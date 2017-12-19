$(function() {
    var socket = io.connect();
    var userToPM = undefined;

    $('#usuario').submit(function(e) {
        e.preventDefault();
        var nick = $('#nickname').val();
        socket.emit('escoger usuario', nick, function(err) {
            if (err) {
                console.log(err);
                $('#nick-error').text(err);
                $('#nickname').val('');
            } else {
                $('#nickname-container').hide();
                $('#chat-container').show();
            }
        });
    });

    socket.on('names', function(usuarios) {
        displayUsers(usuarios);
    });

    socket.on('new user', function(user) {
        displayUsers([user]);
    });

    function displayUsers(usuarios) {
        var html = '';
        for (var i = 0; i < usuarios.length; i++) {
            html += '<div class="user" id="user' + usuarios[i].id + '">' + usuarios[i].nick + '</span>';
        }
        $('#users').append(html);
        $('.user').click(function(e) {

            if (!userToPM) {
                $('#pm-col').show();
            }

            userToPM = $(this).attr('id').substring(4);
            $('#user-to-pm').html('<h2>' + $(this).text() + '</h2>');
        });
    }


    $('#send-message').submit(function(e) {
        e.preventDefault();
        var msg = $('#new-message').val();
        socket.emit('message', msg);
        $('#new-message').val('');
    });

    socket.on('message', function(data) {
        displayMsg(data.msg, data.nick)
    });

    socket.on('load old', function(docs) {
        for (var i = docs.length - 1; i >= 0; i--) {
            displayMsg(docs[i].msg, docs[i].nick);
        }
    });

    function displayMsg(msg, nick) {
        var html = "<span class='msg'><strong>" + nick + ":</strong> " + msg;
        $('#chat').append(html);
    }

    $('#send-pm').submit(function(e) {
        e.preventDefault();
        socket.emit('private message', { msg: $('#new-pm').val(), userToPM: userToPM });
        $('#new-pm').val('');
    });

    socket.on('private message', function(data) {
        var html = "<span class='pMsg'><strong>" + data.from + ":</strong> " + data.msg;
        $('#chat').append(html);
    });

});