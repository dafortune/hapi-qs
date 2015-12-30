'use strict';

const Hapi = require('hapi');

exports.start = function(port, pluginOptions, callback) {
  const server = new Hapi.Server();

  server.connection({ port: port });

  const preparePayloadRoute = function (method) {
    server.route({
      method: method,
      path: '/',
      handler: function (request, reply) {
        return reply(request.payload);
      }
    });
  };

  const onRegister = function () {
    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        return reply(request.query);
      }
    });

    preparePayloadRoute('POST');
    preparePayloadRoute('PUT');
    preparePayloadRoute('PATCH');
    preparePayloadRoute('DELETE');

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
