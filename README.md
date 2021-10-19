# Hapi QS

[Hapi](http://hapijs.com) plugin that adds [qs](https://github.com/ljharb/qs) support for form data in hapi 18.
Fork of [hapi-qs](github.com/daf-spr/hapi-qs).

Install
=======
```
npm install hapi-qs-lob
```

Hapi 18+
=====
As of Hapi 18, there is built-in support for [providing a query string parser](https://hapi.dev/api?v=18.4.2#-serveroptionsqueryparser),
but there is still a need for parsing form payloads.

Usage
=====
``` javascript
const server = new Hapi.Server();

await server.register({
  plugin: require('hapi-qs'),
  options: {} /* optional */
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
  * payload: whether to parse payload (it is valid only when content-type header is a kind of `x-www-form-urlencoded` or `multipart/form-data`)


## Running tests
```
  npm test
```
