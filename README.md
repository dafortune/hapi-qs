# Hapi QS

[![Build Status](https://travis-ci.org/dafortune/hapi-qs.svg?branch=master)](https://travis-ci.org/daf-spr/hapi-qs)

Hapi plugin that brings back qs support for Hapi 12.
[Qs](https://github.com/ljharb/qs) support has been removed from Hapi 12 (https://github.com/hapijs/hapi/issues/2985), this plugin aims to bring it back.

Install
=======
```
npm install hapi-qs
```

Usage
=====
```javascript
  const server = new Hapi.Server();

  server.connection({ port: port });

  \\...

  server.register({
      register: require('hapi-qs'),
      options: {} /* optional */
    },
    err => {
      \\...
    });

  \\...
```

### Parsing query

```javascript
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply(request.query); // request.query constains the parsed values
    }
  });
```

### Parsing payload
Payload will only be parsed if content-type is set to a kind of `x-www-form-urlencoded` or `multipart/form-data`

```javascript
  server.route({
    method: 'POST',
    path: '/',
    handler: function (request, reply) {
      return reply(request.payload); // request.query constains the parsed values
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
