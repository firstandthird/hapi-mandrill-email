var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var mandrillParser = require('../lib/parser');

var readFixture = function(name) {
  var json = require(__dirname+'/fixtures/'+name+'.json');
  return json;
};


describe('parser', function() {

  it('should parse mandrill response', function(done) {
    var events = readFixture('mandrill-multi').mandrill_events;

    mandrillParser(events, function(err, emails) {
      expect(err).to.equal(null);
      expect(emails).to.deep.equal([
        {
          email: 'test3@example.com',
          to: [
            { email: 'test1@example.com', type: 'to' },
            { email: 'test3@example.com', type: 'cc' }
          ],
          fromEmail: 'test@example.com',
          fromName: 'Test Dude',
          subject: 'ccc\\/bcc test',
          text: null,
          html: undefined,
          headers: {
            'X-Sentby-Alias': 1
          },
          attachments: [],
          images: []
        },
        {
          email: 'test3@example.com',
          to: [
            { email: 'test3@example.com', type: 'to' }
          ],
          fromEmail: 'member@example.com',
          fromName: 'Test Dude',
          subject: 'attach3',
          text: undefined,
          html: undefined,
          headers: {},
          attachments: [{
            name: 'ss2.png',
            type: 'image/png',
            content: '123'
          }],
          images: [{
            name: 'ss2.png',
            type: 'image/png',
            content: '123'
          }],
        },
        {
          email: 'test3@example.com',
          to: [
            { email: 'test3@example.com', type: 'to' },
            { email: 'test4@example.com', type: 'cc' }
          ],
          fromEmail: 'member@example.com',
          fromName: 'Test Dude',
          subject: 'ccc\\/bcc test',
          text: null,
          html: undefined,
          headers: {},
          attachments: [],
          images: []
        }
      ]);
    });
    done();
  });

  it('should return empty array if no emails', function(done) {

    mandrillParser([], function(err, emails) {
      expect(emails.length).to.equal(0);
    });
    done();
  });

  it('should return empty array if no emails', function(done) {

    mandrillParser([{ event: 'test' }], function(err, emails) {
      expect(emails.length).to.equal(0);
    });
    done();
  });

});
