'use strict';

const basicServer = require('../support/basic_server');
const rp = require('request-promise');
const config = require('../support/basic_config');
const expect = require('chai').expect;

const payloadExamples = function (method, isMultipart, stripTrailingSlash) {
  describe('Parsing query strings', function() {
    let testStreamPath;
    let testPath;

    before(function() {
      this.request = function(form, options) {
        var requestOptions = {
          method: method,
          uri: 'http://localhost:' + config.port + options.path,
          json: options.json
        };
        if (isMultipart) {
          requestOptions.formData = form;
        } else {
          requestOptions.form = form;
        }
        return rp(requestOptions)
        .then(body => {
          this.payload = body;
        });
      };

      testPath = '/test' + (stripTrailingSlash ? '/' : '');
      testStreamPath = '/test-stream' + (stripTrailingSlash ? '/' : '');
    });

    describe('when qsOptions are not set', function() {

      before(function(done) {
        this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({
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

      before(function(done) {
        this.serverStart({ qsOptions: { parseArrays: false } }, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({
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

      before(function(done) {
        this.serverStart({ payload: false }, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({ 'unicorns[0][color]': 'blue' }, { path: testPath, json: true });
      });

      it('does not parse complex qs attribute', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });

    describe('when payload is not urlencoded', function() {

      before(function(done) {
        this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request(null, { path: testPath, json: { 'simple': true, 'unicorns[0][color]': 'blue' } });
      });

      it('does not parse payload', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });


    describe('when there is no payload', function() {

      before(function(done) {
        this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request(null, { path: testPath, json: true });
      });

      it('does not fail', function() {
        expect(this.query).to.equal(undefined);
      });

    });

    describe('when it is in stream mode', function() {

      before(function(done) {
        this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({ test: 'thisIsMyBigTest' }, { path: testStreamPath });
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
