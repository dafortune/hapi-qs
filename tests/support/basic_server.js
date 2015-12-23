'use strict';

const Hapi = require('hapi');

exports.start = function(port, pluginOptions, callback) {
  const server = new Hapi.Server();

  server.connection({ port: port });

  const onRegister = function () {
    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        return reply(request.query);
      }
    });

    server.route({
      method: 'POST',
      path: '/',
      handler: function (request, reply) {
        return reply(request.payload);
      }
    });

    server.start(() => callback(null, server));
  };

  server.register({
    register: require('../../'),
    options: pluginOptions
  },
  err => {
    if (err) { return callback(err); }

    onRegister()
  });
};

