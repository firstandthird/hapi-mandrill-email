var plugin = require('../');
var Hapi = require('hapi');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

describe('mandrill', function() {

  describe('plugin', function() {
    var server;
    before(function(done) {
      server = new Hapi.Server();
      server.on('internalError', function (request, err) {
        console.log('ERROR', err.message);
      });
      done();
    });

    it('should load without errors', function(done) {
      server.register({
        register: plugin,
        options: {
          apiKey: '123'
        }
      }, function(err) {
        expect(err).to.equal(undefined);

        expect(server.plugins.mandrill.send).to.be.a.function();

        done();
      });
    });
  });

});
