'use strict';

const Hapi = require('hapi');

exports.start = function(port, pluginOptions, serverOptions, callback) {
  serverOptions = serverOptions || {};

  const server = new Hapi.Server({
    connections: {
      router: {
        stripTrailingSlash: !!serverOptions.stripTrailingSlash
      }
    }
  });

  server.connection({ port: port });

  const preparePayloadRoute = function (method) {
    server.route({
      method: method,
      path: '/test',
      handler: function (request, reply) {
        return reply(request.payload);
      }
    });
  };

  const onRegister = function () {
    server.route({
      method: 'GET',
      path: '/test',
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
