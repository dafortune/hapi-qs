'use strict';

const expect = require('chai').expect;
const querystring = require('querystring');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

/* eslint lob/padded-describes: "off" */

const payloadExamples = function (method, isMultipart, stripTrailingSlash) {

  describe('Parsing query strings', () => {
    let testStreamPath;
    let testPath;

    before(function () {
      this.request = async function (form, options) {
        const requestOptions = {
          method,
          url: options.path
        };

        if (form) {
          if (isMultipart) {

            let formData = new FormData();
            for (const key in form) {
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
        const res = await this.server.inject(requestOptions);
        if (res.payload.length === 0) {
          return undefined;
        }
        if (options.json) {
          return JSON.parse(res.payload);
        } else {
          return res.payload;
        }
      };

      testPath = `/test${  stripTrailingSlash ? '/' : ''}`;
      testStreamPath = `/test-stream${  stripTrailingSlash ? '/' : ''}`;
    });

    describe('when qsOptions are not set', () => {

      before(async function () {
        await this.serverStart(undefined, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request({
          i: 'v/r',
          'unicorns[0][color]': 'blue'
        }, { path: testPath, json: true });
      });

      it('parses simple payload attribute', function () {
        expect(this.payload).to.have.property('i', 'v/r');
      });

      it('parses complex payload attributes', function () {
        expect(this.payload).to.have.property('unicorns');
        expect(this.payload.unicorns).to.be.instanceof(Array);
        expect(this.payload.unicorns[0]).to.have.property('color', 'blue');
      });

    });

    describe('when qsOptions are set', () => {

      before(async function () {
        await this.serverStart({ qsOptions: { parseArrays: false } }, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request({
          'unicorns[0][color]': 'blue'
        }, { path: testPath, json: true });
      });

      it('uses qs options', function () {
        expect(this.payload).to.have.property('unicorns');
        expect(this.payload.unicorns).to.be.an('object');
        expect(this.payload.unicorns).not.to.be.instanceof(Array);
        expect(this.payload.unicorns['0']).to.have.property('color', 'blue');
      });
    });

    describe('when payload parsing is disabled', () => {

      before(async function () {
        await this.serverStart({ payload: false }, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request({ 'unicorns[0][color]': 'blue' }, { path: testPath, json: true });
      });

      it('does not parse complex qs attribute', function () {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });

    describe('when payload is not urlencoded', () => {

      before(async function () {
        await this.serverStart(undefined, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request(null, { path: testPath, json: { simple: true, 'unicorns[0][color]': 'blue' } });
      });

      it('does not parse payload', function () {
        expect(this.payload).to.have.property('unicorns[0][color]', 'blue');
      });

    });

    describe('when there is no payload', () => {

      before(async function () {
        await this.serverStart(undefined, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request(null, { path: testPath, json: true });
      });

      it('does not fail', function () {
        expect(this.payload).to.equal(undefined);
      });

    });

    describe('when it is in stream mode', () => {

      before(async function () {
        await this.serverStart(undefined, { stripTrailingSlash });
      });

      beforeEach(async function () {
        this.payload = await this.request({ test: 'thisIsMyBigTest' }, { path: testStreamPath });
      });

      it('does not parse payload', function () {
        expect(this.payload).to.contain('thisIsMyBigTest');
      });

    });

  });
};

function parsePayloadExample (stripTrailingSlash) {
  describe('application/x-www-form-urlencoded data', () => {
    describe('POST method', () => {
      payloadExamples('POST', false, stripTrailingSlash);
    });

    describe('PUT method', () => {
      payloadExamples('PUT', false, stripTrailingSlash);
    });

    describe('PATCH method', () => {
      payloadExamples('PATCH', false, stripTrailingSlash);
    });

    describe('DELETE method', () => {
      payloadExamples('DELETE', false, stripTrailingSlash);
    });
  });

  describe('multipart/form-data data', () => {
    describe('POST method', () => {
      payloadExamples('POST', true, stripTrailingSlash);
    });

    describe('PUT method', () => {
      payloadExamples('PUT', true, stripTrailingSlash);
    });

    describe('PATCH method', () => {
      payloadExamples('PATCH', true, stripTrailingSlash);
    });

    describe('DELETE method', () => {
      payloadExamples('DELETE', true, stripTrailingSlash);
    });

  });
}

describe('when stripTrailingSlash is true', () => {
  parsePayloadExample(true);
});

describe('when stripTrailingSlash is false', () => {
  parsePayloadExample(false);
});
