var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var proxyquire = require('proxyquire');

//stub out mandrill
var sendError = function() {};
var Sender = proxyquire('../lib/sender', {
  'mandrill-api/mandrill': {
    Mandrill: function(key) {
      return {
        messages: {
          send: function(obj, callback, err) {
            var response = {
              mailObj: obj,
              email: obj.message.to,
              status: 'sent',
              reject_reason: null,
              _id: '123',
              stub: true
            };
            var error = sendError();
            if (error) {
              return err(error);
            }
            callback(response);
          },
          sendTemplate: function(obj, callback, err) {
            var response = {
              mailObj: obj,
              email: obj.message.to,
              status: 'sent',
              reject_reason: null,
              _id: '123',
              stub: true
            };
            var error = sendError();
            if (error) {
              return err(error);
            }
            callback(response);
          }
        }
      };
    }
  }
});

describe('mandrill', function() {

  describe('Sender', function() {

    describe('init', function() {

      it('should require apikey', function(done) {
        expect(function() {
          new Sender();
        }).to.throw();
        done();
      });

      it('should create a client object', function(done) {
        var s = new Sender({ apiKey: '123'});
        expect(s.client).to.be.a.object();
        done();
      });
    });

    describe('send - no test', function() {
      var sender;
      before(function(done) {
        sender = new Sender({ apiKey: 'api' });
        done();
      });

      it('should require necessary fields', function(done) {
        sender.send({}, function(err, result) {
          expect(err).to.not.equal(null);
          done();
        });
      });

      it('should only allow certain fields', function(done) {
        sender.send({ blah: 1}, function(err, result) {
          expect(err).to.not.equal(null);
          done();
        });
      });

      it('should allow to as string', function(done) {
        sender.send({
          to: 'to@example.org',
          fromEmail: 'from@example.org'
        }, function(err, result) {
          expect(err).to.equal(null);
          expect(result.mailObj.message.to).to.deep.equal([
            { email: 'to@example.org' }
          ]);
          done();
        });
      });

      it('should allow these fields', function(done) {
        sender.send({
          to: 'to@example.org',
          fromEmail: 'from@example.org',
          fromName: 'from name',
          subject: 'subject',
          html: 'html',
          text: 'text',
          mergeVars: [{ rcpt: 'to@example.org', vars: [{ name: 'name', content: 'content' }]}],
          globalMergeVars: [{ name: 'var', content: '123' }],
          preserveRecipients: true,
          headers: {
            'x-header': 'val'
          },
          attachments: [
            { name: 'test.png', type: 'image/png', content: '123' }
          ],
          images: [
            { name: 'test.png', type: 'image/png', content: '123' }
          ]
        }, function(err, result) {
          expect(err).to.equal(null);
          expect(result.mailObj.message).to.deep.equal({
            to: [
              { email: 'to@example.org' }
            ],
            from_email: 'from@example.org',
            from_name: 'from name',
            subject: 'subject',
            html: 'html',
            text: 'text',
            merge_vars: [{ rcpt: 'to@example.org', vars: [{ name: 'name', content: 'content' }]}],
            global_merge_vars: [{ name: 'var', content: '123' }],
            preserve_recipients: true,
            headers: {
              'x-header': 'val'
            },
            attachments: [
              { name: 'test.png', type: 'image/png', content: '123' }
            ],
            images: [
              { name: 'test.png', type: 'image/png', content: '123' }
            ]
          });
          done();
        });
      });

      it('should allow blank text', function(done) {
        sender.send({
          to: 'to@example.org',
          fromEmail: 'from@example.org',
          fromName: 'from name',
          subject: 'subject',
          text: null
        }, function(err, result) {
          expect(err).to.equal(null);
          expect(result.mailObj.message).to.deep.equal({
            to: [
              { email: 'to@example.org' }
            ],
            from_email: 'from@example.org',
            from_name: 'from name',
            subject: 'subject',
            text: null
          });
          done();
        });
      });

      it('should allow blank subject', function(done) {
        sender.send({
          to: 'to@example.org',
          fromEmail: 'from@example.org',
          fromName: 'from name',
          subject: '',
          text: null
        }, function(err, result) {
          expect(err).to.equal(null);
          expect(result.mailObj.message).to.deep.equal({
            to: [
              { email: 'to@example.org' }
            ],
            from_email: 'from@example.org',
            from_name: 'from name',
            subject: '',
            text: null
          });
          done();
        });
      });

      it('should send to mandrill', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org'
        };
        sender.send(email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            message: {
              to: email.to,
              from_email: email.fromEmail
            }
          });
          done();
        });
      });

      it('should allow these fields', function(done) {

        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org'
        };
        sender.send(email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            message: {
              to: email.to,
              from_email: email.fromEmail
            }
          });
          done();
        });
      });

    });

    describe('sendTemplate - no test', function() {
      var sender;
      before(function(done) {
        var emails = yaml.load(fs.readFileSync(path.resolve(__dirname, './emails.yaml')));
        sender = new Sender({
          apiKey: '123',
          test: false,
          validations: emails
        });
        done();
      });

      it('should require necessary fields', function(done) {
        sender.sendTemplate('template-name', {}, function(err, result) {
          expect(err).to.not.equal(null);
          done();
        });
      });

      it('should check that template name exists', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org'
        };
        sender.sendTemplate('template-name', email, function(err, result) {
          expect(err).to.not.equal(null);
          expect(err.message).to.equal('invalid template');
          done();
        });
      });

      it('should validate merge vars', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
          globalMergeVars: [
          ]
        };
        sender.sendTemplate('test-email', email, function(err, result) {
          expect(err).to.not.equal(null);
          expect(err.message).to.equal('incorrect keys for test-email: EXAMPLENAME');
          done();
        });
      });

      it('should send to mandrill', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
          globalMergeVars: [
            { name: 'EXAMPLENAME', content: 'Bob' },
          ]
        };
        sender.sendTemplate('test-email', email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            template_name: 'test-email',
            message: {
              to: email.to,
              from_email: email.fromEmail,
              global_merge_vars: [
                { name: 'EXAMPLENAME', content: 'Bob' }
              ],
            },
            template_content: []
          });
          done();
        });
      });

      it('should convert globalMergeVarObject from friendly format', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
          globalMergeVarObj: {
            EXAMPLENAME: 'Bob'
          }
        };
        sender.sendTemplate('test-email', email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            template_name: 'test-email',
            message: {
              to: email.to,
              from_email: email.fromEmail,
              global_merge_vars: [
                { name: 'EXAMPLENAME', content: 'Bob' }
              ],
            },
            template_content: []
          });
          done();
        });
      });

      it('should allow null for merge var', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
          globalMergeVars: [
            { name: 'EXAMPLENAME', content: null }
          ]
        };
        sender.sendTemplate('test-email', email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            template_name: 'test-email',
            message: {
              to: email.to,
              from_email: email.fromEmail,
              global_merge_vars: [{
                name: 'EXAMPLENAME',
                content: null
              }]
            },
            template_content: []
          });
          done();
        });
      });

      it('should catch errors in sendTemplate', function(done) {

        sendError = function() {
          return new Error('no such template');
        };

        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
          globalMergeVars: [
            { name: 'EXAMPLENAME', content: 'Bob' }
          ]
        };
        //template does exist, but simulating an error from mandrill
        sender.sendTemplate('test-email', email, function(err, result) {

          expect(err).to.not.equal(null);
          expect(err.message).to.equal('no such template');

          sendError = function() {};
          done();
        });

      });

      it('should catch errors in send', function(done) {

        sendError = function() {
          return new Error('bad things');
        };

        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org'
        };
        sender.send(email, function(err, result) {

          expect(err).to.not.equal(null);
          expect(err.message).to.equal('bad things');

          sendError = function() {};
        });

        done();
      });

      it('should pass in defaults', function(done) {
        sender = new Sender({
          apiKey: '123',
          test: false,
          defaults: {
            inlineCss: true
          }
        });
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org'
        };

        sender.sendTemplate('test-email', email, function(err, result) {
          expect(err).to.equal(null);
          expect(result.email).to.deep.equal(email.to);
          expect(result.status).to.equal('sent');
          expect(result.stub).to.equal(true);
          expect(result.mailObj).to.deep.equal({
            template_name: 'test-email',
            message: {
              to: email.to,
              from_email: email.fromEmail,
              inline_css: true,
              global_merge_vars: []
            },
            template_content: []
          });
          done();
        });
      });

      describe('default merge vars', function() {
        it('should pass in default merge vars', function(done) {
          sender = new Sender({
            apiKey: '123',
            test: false,
            globalMergeVars: {
              HEADER: 'header',
              FOOTER: 'footer'
            }
          });
          var email = {
            to: [
              { email: 'to@example.org' }
            ],
            fromEmail: 'from@example.org'
          };

          sender.sendTemplate('test-email', email, function(err, result) {
            expect(err).to.equal(null);
            expect(result.email).to.deep.equal(email.to);
            expect(result.status).to.equal('sent');
            expect(result.stub).to.equal(true);
            expect(result.mailObj).to.deep.equal({
              template_name: 'test-email',
              message: {
                to: email.to,
                from_email: email.fromEmail,
                global_merge_vars: [
                  { name: 'HEADER', content: 'header' },
                  { name: 'FOOTER', content: 'footer' }
                ],
              },
              template_content: []
            });
            done();
          });
        });
        it('should append default merge vars to existing', function(done) {
          sender = new Sender({
            apiKey: '123',
            test: false,
            globalMergeVars: {
              HEADER: 'header',
              FOOTER: 'footer'
            }
          });
          var email = {
            to: [
              { email: 'to@example.org' }
            ],
            fromEmail: 'from@example.org',
            globalMergeVars: [
              { name: 'EXAMPLENAME', content: 'Bob' }
            ]
          };

          sender.sendTemplate('test-email', email, function(err, result) {
            expect(err).to.equal(null);
            expect(result.email).to.deep.equal(email.to);
            expect(result.status).to.equal('sent');
            expect(result.stub).to.equal(true);
            expect(result.mailObj).to.deep.equal({
              template_name: 'test-email',
              message: {
                to: email.to,
                from_email: email.fromEmail,
                global_merge_vars: [
                  { name: 'EXAMPLENAME', content: 'Bob' },
                  { name: 'HEADER', content: 'header' },
                  { name: 'FOOTER', content: 'footer' }
                ],
              },
              template_content: []
            });
            done();
          });
        });
      });

    });

    describe('send - test', function() {
      var sender;
      before(function(done) {
        sender = new Sender({ apiKey: 'api', test: true });
        done();
      });

      it('should just return obj', function(done) {
        var email = {
          to: [
            { email: 'to@example.org' }
          ],
          fromEmail: 'from@example.org',
        };
        sender.send(email, function(err, result) {
          expect(err).to.equal(null);
          expect(result).to.deep.equal({
            test: true,
            message: {
              to: email.to,
              from_email: email.fromEmail,
            }
          });
          done();
        });
      });
    });



  });

});
