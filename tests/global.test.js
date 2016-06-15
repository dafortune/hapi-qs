const basicServer = require('./support/basic_server');
const config = require('./support/basic_config');

before(function() {
  this.serverStart = function(options, serverOptions, done) {
    basicServer.start(config.port, options, serverOptions, (err, server) => {
      if (err) { return done(err); }

      this.server = server;

      done();
    });
  };
});
