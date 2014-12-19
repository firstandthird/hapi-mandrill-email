var Hapi = require('hapi');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var bodyExtractor = require('../lib/body-extractor');

describe('bodyExtractor', function() {

  it('should extract body', function(done) {
    var html = '<html><head><meta http-equiv="Content-Type" content="text/html charset=us-ascii"></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;"><b>This is a test. &nbsp;</b>Woot</body></html>';
    var out = '<b>This is a test. &nbsp;</b>Woot';

    expect(bodyExtractor(html)).to.equal(out);
    done();
  });

  it('should return entire string if no body', function(done) {
    var html = '<b>Test</b>';
    var out = html;
    expect(bodyExtractor(html)).to.equal(out);
    done();
  });
});
