var io;
function initialize(passedIo) {
    io = passedIo;
    io.on('connection', (socket) => {
        const session = socket.request.session;
        console.log('a user connected, named ' + JSON.stringify(session.passport.user));
      });
}

module.exports = initialize;