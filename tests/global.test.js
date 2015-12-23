const basicServer = require('./support/basic_server');
const config = require('./support/basic_config');

before(function() {
  this.serverStart = function(options, done) {
    basicServer.start(config.port, options, (err, server) => {
      if (err) { return done(err); }

      this.server = server;

      done();
    });
  };
});
