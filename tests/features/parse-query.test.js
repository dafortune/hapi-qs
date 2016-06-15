'use strict';

const config = require('../support/basic_config');
const rp = require('request-promise');
const expect = require('chai').expect;


describe('Parsing query strings', function() {
  describe('when stripTrailingSlash is true', function() {
    parseQueryStringExample(true);
  });

  describe('when stripTrailingSlash is false', function() {
    parseQueryStringExample(false);
  });
});

function parseQueryStringExample(stripTrailingSlash) {
  before(function() {
    this.request = function(qs) {
      return rp({
        method: 'GET',
        uri: 'http://localhost:' + config.port + '/test' + (stripTrailingSlash ? '/' : ''),
        qs: qs,
        json: true
      })
      .then(body => {
        this.query = body;
      });
    };
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
        'hello': 'world',
        'unicorns[0][color]': 'blue'
      });
    });

    it('parses simple qs attribute', function() {
      expect(this.query).to.have.property('hello', 'world');
    });

    it('parses complex qs attributes', function() {
      expect(this.query).to.have.property('unicorns');
      expect(this.query.unicorns).to.be.instanceof(Array);
      expect(this.query.unicorns[0]).to.have.property('color', 'blue');
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
      });
    });

    it('uses qs options', function() {
      expect(this.query).to.have.property('unicorns');
      expect(this.query.unicorns).to.be.an('object');
      expect(this.query.unicorns).not.to.be.instanceof(Array);
      expect(this.query.unicorns['0']).to.have.property('color', 'blue');
    });
  });

  describe('when query strings parsing is disabled', function() {

    before(function(done) {
      this.serverStart({ queryString: false }, { stripTrailingSlash: stripTrailingSlash }, done);
    });

    after(function(done) {
      this.server.stop(done);
    });

    beforeEach(function() {
      return this.request({ 'unicorns[0][color]': 'blue' });
    });

    it('does not parse complex qs attribute', function() {
      expect(this.query).to.have.property('unicorns[0][color]', 'blue');
    });

  });

  describe('when there is no query string', function() {

    before(function(done) {
      this.serverStart(undefined, { stripTrailingSlash: stripTrailingSlash }, done);
    });

    after(function(done) {
      this.server.stop(done);
    });

    beforeEach(function() {
      return this.request();
    });

    it('does not fail', function() {
      expect(this.query).to.eql({});
    });

  });
}
