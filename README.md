# Hapi QS

[![Build Status](https://travis-ci.org/dafortune/hapi-qs.svg?branch=master)](https://travis-ci.org/dafortune/hapi-qs)

[Hapi](http://hapijs.com) plugin that brings back [qs](https://github.com/ljharb/qs) support that was removed in Hapi 12 (https://github.com/hapijs/hapi/issues/2985).

[__hapi-qs v1.1.3__](https://github.com/dafortune/hapi-qs/tree/v1.1.3) is for Hapi v12 to v16. __hapi-qs v2+__
support Hapi v17 only.

Install
=======
```
npm install hapi-qs
```
Or for pre-Hapi 17:
```
npm install hapi-qs@1.1.3
```

Usage
=====
``` javascript
const server = new Hapi.Server();

await server.register({
  plugin: require('hapi-forwarded-for'),
  options: {} /* optional */
});
```

### Parsing query

```javascript
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return request.query; // request.query constains the parsed values
    }
  });
```

### Parsing payload
Payload will only be parsed if content-type is set to a kind of `x-www-form-urlencoded` or `multipart/form-data`

```javascript
  server.route({
    method: 'POST',
    path: '/',
    handler: (request, h) => {
      return request.payload; // request.query constains the parsed values
    }
  });
```

### Options
  * qsOptions (default `undefined`): This object is past directly to Qs parse method ([more info](https://github.com/ljharb/qs))
  * queryString (default `true`): whether to parse query string
  * payload: whether to parse payload (it is valid only when content-type header is a kind of `x-www-form-urlencoded` or `multipart/form-data`)


## Running tests
```
  npm test
```
