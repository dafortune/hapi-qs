'use strict';

const qs = require('qs');
const Joi = require('joi');
const stream = require('stream');

const DECODE_CONTENT_TYPE_REGEXP = /(x-www-form-urlencoded)|(multipart\/form-data)/;

const OPTIONS_SCHEMA = Joi.object().keys({
  qsOptions: Joi.object(),
  payload: Joi.boolean()
});

function onPostAuthFactory (qsOptions) {

  return function onPostAuth (request, h) {
    const decode = DECODE_CONTENT_TYPE_REGEXP.exec(request.headers['content-type']);

    if (decode &&
        typeof request.payload === 'object' &&
        !(request.payload instanceof stream.Stream) &&
        !Buffer.isBuffer(request.payload)) {

      request.payload = qs.parse(request.payload, qsOptions);
    }

    return h.continue;
  };
}

const register = (server, options) => {
  Joi.assert(options, OPTIONS_SCHEMA);

  if (options.payload !== false) {
    server.ext('onPostAuth', onPostAuthFactory(options.qsOptions));
  }
};

const pkg = require('../package.json');
const name = pkg.name;
const version = pkg.version;

exports.plugin = {
  register,
  name,
  version,
  pkg
};

