'use strict';

const url = require('url');
const qs = require('qs');
const Joi = require('joi');
const DECODE_CONTENT_TYPE_REGEXP = /(x-www-form-urlencoded)|(multipart\/form-data)/;

const OPTIONS_SCHEMA = Joi.object().keys({
  qsOptions: Joi.object(),
  queryString: Joi.boolean(),
  payload: Joi.boolean()
});

const register = function (server, options, next) {
  Joi.assert(options, OPTIONS_SCHEMA);

  if (options.queryString !== false) {
    server.ext('onRequest', onRequestFactory(options.qsOptions));
  }

  if (options.payload !== false) {
    server.ext('onPostAuth', onPostAuthFactory(options.qsOptions));
  }

  next();
};

register.attributes = { pkg: require('../package.json') };

function onRequestFactory(qsOptions) {

  return function onRequest(request, reply) {
    const uri = request.url;
    const parsed = url.parse(uri, false);
    parsed.query = qs.parse(parsed.query, qsOptions);
    request.setUrl(parsed);

    return reply.continue();
  };
}

function onPostAuthFactory(qsOptions) {

  return function onPostAuth(request, reply) {
    const decode = DECODE_CONTENT_TYPE_REGEXP.exec(request.headers['content-type']);

    if (decode &&
        typeof request.payload === 'object' &&
        !Buffer.isBuffer(request.payload)) {

        request.payload = qs.parse(request.payload, qsOptions);
        
        if (Object.keys(request.payload).length === 0) {
          request.payload = null;
        }
    }

    return reply.continue();
  };
};

exports.register = register;

