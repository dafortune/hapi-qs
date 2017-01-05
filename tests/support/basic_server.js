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

  const preparePayloadRoute = function (method, options) {
    server.route({
      method: method,
      path: options.path,
      config: {
        payload: Object.assign({}, options.config && options.config.payload),
        handler: function (request, reply) {
          return reply(request.payload);
        }
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

    preparePayloadRoute('POST', { path: '/test' });
    preparePayloadRoute('PUT', { path: '/test' });
    preparePayloadRoute('PATCH', { path: '/test' });
    preparePayloadRoute('DELETE', { path: '/test' });

    const streamPayload = {
      path: '/test-stream',
      config: {
        payload: {
          output: 'stream',
          parse: false
        }
      }
    };

    preparePayloadRoute('POST', streamPayload);
    preparePayloadRoute('PUT', streamPayload);
    preparePayloadRoute('PATCH', streamPayload);
    preparePayloadRoute('DELETE', streamPayload);

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
