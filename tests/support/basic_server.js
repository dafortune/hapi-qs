'use strict';

const Hapi = require('hapi');
const streamToPromise = require('stream-to-promise');
const stream = require('stream');

exports.start = async (port, pluginOptions, serverOptions) => {
  serverOptions = serverOptions || {};

  const server = new Hapi.Server({
    router: {
      stripTrailingSlash: Boolean(serverOptions.stripTrailingSlash)
    }
  });

  const preparePayloadRoute = function (method, options) {
    server.route({
      method,
      path: options.path,
      config: {
        payload: Object.assign({}, options.config && options.config.payload),
        handler: function (request) {
          if (request.payload instanceof stream.Readable) {
            return streamToPromise(request.payload);
          }
          return request.payload;
        }
      }
    });
  };

  await server.register({
    plugin: require('../../'),
    options: pluginOptions
  });

  server.route({
    method: 'GET',
    path: '/test',
    handler: function (request) {
      return request.query;
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

  return server;
};
