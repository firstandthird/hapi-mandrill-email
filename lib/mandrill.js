var Sender = require('./sender');
var parser = require('./parser');
var bodyExtractor = require('./body-extractor');
var yaml = require('js-yaml');
var fs = require('fs');

exports.register = function(plugin, options, next) {

  var validations = false;

  if(options.validationsYaml) {
    validations = yaml.load(fs.readFileSync( options.validationsYaml ));
  }

  var sender = new Sender({
    apiKey: options.apiKey,
    test: options.test,
    globalMergeVars: options.globalMergeVars,
    defaults: options.defaults,
    validations: validations
  });

  plugin.expose('send', function(data, callback) {
    sender.send(data, function(err, result) {
      plugin.log(['mandrill', 'send'], { result: result, error: err });
      callback(err, result);
    });
  });

  plugin.expose('sendTemplate', function(templateName, data, callback) {
    sender.sendTemplate(templateName, data, function(err, result) {
      plugin.log(['mandrill', 'sendTemplate'], { templateName: templateName, result: result, error: err });
      callback(err, result);
    });
  });

  plugin.expose('sender', sender);
  plugin.expose('parser', parser);
  plugin.expose('bodyExtractor', bodyExtractor);

  next();
};

exports.register.attributes = {
  name: 'mandrill'
};
