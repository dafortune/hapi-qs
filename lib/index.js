'use strict';

const url = require('url');
const qs = require('qs');
const Joi = require('joi');
const stream = require('stream');

const DECODE_CONTENT_TYPE_REGEXP = /(x-www-form-urlencoded)|(multipart\/form-data)/;

const OPTIONS_SCHEMA = Joi.object().keys({
  qsOptions: Joi.object(),
  queryString: Joi.boolean(),
  payload: Joi.boolean()
});

const register = (server, options) => {
  Joi.assert(options, OPTIONS_SCHEMA);

  if (options.queryString !== false) {
    server.ext('onRequest', onRequestFactory(options.qsOptions));
  }

  if (options.payload !== false) {
    server.ext('onPostAuth', onPostAuthFactory(options.qsOptions));
  }
};

function onRequestFactory(qsOptions) {

  return function onRequest(request, h) {
    const uri = request.url;
    const parsed = url.parse(uri, false);
    parsed.query = qs.parse(parsed.query, qsOptions);
    request.setUrl(parsed);
    
    return h.continue;
  };
}

function onPostAuthFactory(qsOptions) {

  return function onPostAuth(request, h) {
    const decode = DECODE_CONTENT_TYPE_REGEXP.exec(request.headers['content-type']);

    if (decode &&
        typeof request.payload === 'object' &&
        !(request.payload instanceof stream.Stream) &&
        !Buffer.isBuffer(request.payload)) {

        request.payload = qs.parse(request.payload, qsOptions);
    }

    return h.continue;
  };
};

const pkg = require('../package.json');
const name = pkg['name'];
const version = pkg['version'];

exports.plugin = {
	register,
	name,
	version,
	pkg
};

