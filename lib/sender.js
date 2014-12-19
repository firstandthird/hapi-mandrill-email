var mandrill = require('mandrill-api/mandrill');
var Joi = require('joi');
var _ = require('lodash-node');

var Sender = function(options) {
  if (!options.apiKey) {
    throw new Error('apiKey is required');
  }
  this.client = new mandrill.Mandrill(options.apiKey);

  this.options = {
    test: false,
    validations: false,
    globalMergeVars: {},
    defaults: {}
  };
  _.merge(this.options, options);
  this.test = this.options.test;
};

Sender.prototype.validateMessageObj = function(obj) {
  if (typeof obj.to === 'string') {
    obj.to = [{ email: obj.to }];
  }
  var schema = Joi.object().keys({
    to: Joi.array().includes(Joi.object().keys({
        email: Joi.string().email(),
        name: Joi.string(),
        type: Joi.string()
      })).required(),
    fromEmail: Joi.string().email().required(),
    fromName: Joi.string(),
    subject: Joi.string().allow(''),
    html: Joi.string(),
    text: Joi.string().allow(null),
    mergeVars: Joi.array().includes(Joi.object().keys({
      rcpt: Joi.string().email(),
      vars: Joi.array().includes(Joi.object().keys({
        name: Joi.string(),
        content: Joi.string()
      }))
    })),
    globalMergeVarObj: Joi.object(),
    globalMergeVars: Joi.array().includes(Joi.object().keys({
      name: Joi.string(),
      content: Joi.string().allow('').allow(null)
    })),
    preserveRecipients: Joi.boolean(),
    viewContentLink: Joi.boolean(),
    headers: Joi.object(),
    attachments: Joi.array().includes(Joi.object().keys({
      name: Joi.string(),
      type: Joi.string(),
      content: Joi.string()
    })),
    images: Joi.array().includes(Joi.object().keys({
      name: Joi.string(),
      type: Joi.string(),
      content: Joi.string()
    }))
  });

  return Joi.validate(obj, schema);

};

Sender.prototype.toUnderscore = function(key) {
  return key.replace(/([A-Z])/g, function($1){return '_' + $1.toLowerCase();});
};

Sender.prototype.objToUnderscores = function(obj) {
  var newObj = {};
  for (var key in obj) {
    newObj[this.toUnderscore(key)] = obj[key];
  }
  return newObj;
};

Sender.prototype.send = function(obj, callback) {

  var valid = this.validateMessageObj(obj);

  if (valid.error) {
    return callback(valid.error);
  }

  obj = this.objToUnderscores(obj);

  var dataObj = { message: obj };
  if (this.test) {
    return this.sendTest(dataObj, callback);
  }

  this.client.messages.send(dataObj, function(result) {
    callback(null, result);
  }, function(err) {
    callback(err);
  });
};

Sender.prototype.sendTemplate = function(templateName, mailObj, templateData, callback) {

  if (typeof templateData == 'function') {
    callback = templateData;
    templateData = [];
  }

  var valid = this.validateMessageObj(mailObj);

  if (valid.error) {
    return callback(valid.error);
  }

  if (mailObj.globalMergeVarObj) {
    mailObj.globalMergeVars = [];
    _.forOwn(mailObj.globalMergeVarObj, function(value, key) {
      mailObj.globalMergeVars.push({
        name: key,
        content: value
      });
    });
    delete mailObj.globalMergeVarObj;
  }

  if (this.options.globalMergeVars) {
    if (!mailObj.globalMergeVars) {
      mailObj.globalMergeVars = [];
    }
    _.forOwn(this.options.globalMergeVars, function(value, key) {
      mailObj.globalMergeVars.push({
        name: key,
        content: value
      });
    });
  }

  if (this.options.validations) {
    var requiredKeys = this.options.validations[templateName];
    if (!requiredKeys) {
      return callback(new Error('invalid template'));
    }
    var sentKeys = _.pluck(mailObj.globalMergeVars, 'name');
    var diff = _.difference(requiredKeys, sentKeys);

    if (diff.length !== 0) {
      return callback(new Error('incorrect keys for '+templateName+': '+diff.join(',')));
    }
  }

  mailObj = _.merge({}, this.options.defaults, mailObj);

  mailObj = this.objToUnderscores(mailObj);

  var dataObj = {
    template_name: templateName,
    message: mailObj,
    template_content: templateData
  };


  if (this.test) {
    return this.sendTest(dataObj, callback);
  }


  this.client.messages.sendTemplate(dataObj, function(result) {
    callback(null, result);
  }, function(err) {
    callback(err);
  });
};

Sender.prototype.sendTest = function(obj, callback) {
  obj.test = true;
  callback(null, obj);
};


module.exports = Sender;