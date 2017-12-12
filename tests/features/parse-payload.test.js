'use strict';

const basicServer = require('../support/basic_server');
const rp = require('request-promise');
const config = require('../support/basic_config');
const expect = require('chai').expect;
const querystring = require('querystring');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

const payloadExamples = function (method, isMultipart, stripTrailingSlash) {
  describe('Parsing query strings', function() {
    let testStreamPath;
    let testPath;

    before(function() {
      this.request = async function(form, options) {
        let requestOptions = {
          method: method,
          url: options.path,
        };

        if (form) {
          if (isMultipart) {
            
              let formData = new FormData();
              for (let key in form) {
                formData.append(key, form[key]);
              }
              requestOptions.headers = formData.getHeaders();
              formData = await streamToPromise(formData);
              requestOptions.payload = formData;
          } else {
            requestOptions.headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
            };
            requestOptions.payload = querystring.stringify(form);
          }
        }
        if (typeof options.json === 'object') {
          requestOptions.headers = {
            'Content-Type': 'application/json'
          };
          requestOptions.payload = JSON.stringify(options.json);
        }
        let res = await this.server.inject(requestOptions);
        if (res.payload.length === 0) {
          return undefined;
        }
        if (options.json) {
          return JSON.parse(res.payload);
        } else {
          return res.payload;
        }
      };

      testPath = '/test' + (stripTrailingSlash ? '/' : '');
      testStreamPath = '/test-stream' + (stripTrailingSlash ? '/' : '');
    });
    
    describe('when qsOptions are not set', function() {

      before(async function() {
        await this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request({
          'i': 'v/r',
          'unicorns[0][color]': 'blue'
        }, { path: testPath, json: true });
      });

      it('parses simple payload attribute', function() {
        expect(this.payload).to.have.property('i', 'v/r');
      });

      it('parses complex payload attributes', function() {
        expect(this.payload).to.have.property('unicorns');
        expect(this.payload.unicorns).to.be.instanceof(Array);
        expect(this.payload.unicorns[0]).to.have.property('color', 'blue');
      });

    });

    describe('when qsOptions are set', function() {

      before(async function() {
        await this.serverStart({ qsOptions: { parseArrays: false } }, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request({
          'unicorns[0][color]': 'blue'
        }, { path: testPath, json: true });
      });

      it('uses qs options', function() {
        expect(this.payload).to.have.property('unicorns');
        expect(this.payload.unicorns).to.be.an('object');
        expect(this.payload.unicorns).not.to.be.instanceof(Array);
        expect(this.payload.unicorns['0']).to.have.property('color', 'blue');
      });
    });

    describe('when payload parsing is disabled', function() {

      before(async function() {
        await this.serverStart({ payload: false }, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request({ 'unicorns[0][color]': 'blue' }, { path: testPath, json: true });
      });

      it('does not parse complex qs attribute', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });

    describe('when payload is not urlencoded', function() {

      before(async function() {
        await this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request(null, { path: testPath, json: { 'simple': true, 'unicorns[0][color]': 'blue' } });
      });

      it('does not parse payload', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });


    describe('when there is no payload', function() {

      before(async function() {
        await this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request(null, { path: testPath, json: true });
      });

      it('does not fail', function() {
        expect(this.payload).to.equal(undefined);
      });

    });

    describe('when it is in stream mode', function() {

      before(async function() {
        await this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash });
      });

      beforeEach(async function() {
        this.payload = await this.request({ test: 'thisIsMyBigTest' }, { path: testStreamPath });
      });

      it('does not parse payload', function() {
        expect(this.payload).to.contain('thisIsMyBigTest');
      });

    });

  });
};

describe('when stripTrailingSlash is true', function() {
  parsePayloadExample(true);
});

describe('when stripTrailingSlash is false', function() {
  parsePayloadExample(false);
});

function parsePayloadExample(stripTrailingSlash) {
  describe('application/x-www-form-urlencoded data', function() {
    describe('POST method', function() {
      payloadExamples('POST', false, stripTrailingSlash);
    });

    describe('PUT method', function() {
      payloadExamples('PUT', false, stripTrailingSlash);
    });

    describe('PATCH method', function() {
      payloadExamples('PATCH', false, stripTrailingSlash);
    });

    describe('DELETE method', function() {
      payloadExamples('DELETE', false, stripTrailingSlash);
    });
  });

  describe('multipart/form-data data', function() {
    describe('POST method', function() {
      payloadExamples('POST', true, stripTrailingSlash);
    });

    describe('PUT method', function() {
      payloadExamples('PUT', true, stripTrailingSlash);
    });

    describe('PATCH method', function() {
      payloadExamples('PATCH', true, stripTrailingSlash);
    });

    describe('DELETE method', function() {
      payloadExamples('DELETE', true, stripTrailingSlash);
    });
  });
}
