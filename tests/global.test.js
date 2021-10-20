'use strict';

const basicServer = require('./support/basic_server');
const config = require('./support/basic_config');

before(function () {
  this.serverStart = async function (options, serverOptions) {
    this.server = await basicServer.start(config.port, options, serverOptions);
  };
});
