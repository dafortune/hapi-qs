'use strict';

const basicServer = require('../support/basic_server');
const rp = require('request-promise');
const config = require('../support/basic_config');
const expect = require('chai').expect;

const payloadExamples = function (method, isMultipart) {
  describe('Parsing query strings', function() {

    before(function() {
      this.request = function(form, json) {
        var requestOptions = {
          method: method,
          uri: 'http://localhost:' + config.port,
          json: json
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
    });

    describe('when qsOptions are not set', function() {

      before(function(done) {
        this.serverStart(undefined, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({
          'i': 'v/r',
          'unicorns[0][color]': 'blue'
        }, true);
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
        this.serverStart({ qsOptions: { parseArrays: false } }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({
          'unicorns[0][color]': 'blue'
        }, true);
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
        this.serverStart({ payload: false }, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request({ 'unicorns[0][color]': 'blue' }, true);
      });

      it('does not parse complex qs attribute', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });

    describe('when payload is not urlencoded', function() {

      before(function(done) {
        this.serverStart(undefined, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request(null, { 'simple': true, 'unicorns[0][color]': 'blue' });
      });

      it('does not parse payload', function() {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });


    describe('when there is no payload', function() {

      before(function(done) {
        this.serverStart(undefined, done);
      });

      after(function(done) {
        this.server.stop(done);
      });

      beforeEach(function() {
        return this.request(null, true);
      });

      it('does not fail', function() {
        expect(this.query).to.equal(undefined);
      });

    });

  });
};

describe('application/x-www-form-urlencoded data', function() {
  describe('POST method', function() {
    payloadExamples('POST');
  });

  describe('PUT method', function() {
    payloadExamples('PUT');
  });

  describe('PATCH method', function() {
    payloadExamples('PATCH');
  });

  describe('DELETE method', function() {
    payloadExamples('DELETE');
  });
});

describe('multipart/form-data data', function() {
  describe('POST method', function() {
    payloadExamples('POST', true);
  });

  describe('PUT method', function() {
    payloadExamples('PUT', true);
  });

  describe('PATCH method', function() {
    payloadExamples('PATCH', true);
  });

  describe('DELETE method', function() {
    payloadExamples('DELETE', true);
  });
});
