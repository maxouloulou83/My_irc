var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var users = [];
var channels = ['#accueil'];

io.on('connection', (socket, messages) => {
    var me = '';

    /*
    * Connexion d'un utilisateur
    */
    socket.on('login', (user) => {
        users.push(user.username);
        me = user.username;
        io.emit('listUsers', {
            user: users
        })

        io.emit('listChannels', {
            channels: channels
        })

        socket.broadcast.emit('newuser', {
            username: user.username
        })

    });

    /*
    * Deconnexion d'un utilisateur
    */
    socket.on('disconnect', (user) => {
        if(me != '') {
            socket.broadcast.emit('disuser', {
                username: me
            })
            users = users.filter(user => user !== me);
            io.emit('listUsers', {
                user: users
            })
        }
    })

    /*
    * Envoi des messages à tous les clients
    */
    socket.on('newmessage', function(message) {
        io.emit('newmsg', {
            messages: message
        })
    })

    /*
    * Changement d'username
    */
    socket.on('rename', function(username) {
        me = username.rename;
        users = users.filter(user => user !== username.username);
        users.push(username.rename);
        io.emit('listUsers', {
            user: users
        });
        io.emit('renameuser', {
            username: username.username,
            rename: username.rename
        })
    })

    /*
    * Création d'un nouveau channel
    */
    socket.on('newChannel', function(channel) {
        channels.push('#' + channel.channel);
        io.emit('listChannels', {
            channels: channels
        })
    })
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});
