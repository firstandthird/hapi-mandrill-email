var _ = require('lodash-node');

module.exports = function(events, callback) {

  if (events.length === 0) {
    return callback(null, []);
  }

  var getAttachments = function(obj) {
    var items = [];
    _.forOwn(obj, function(value, key) {
      items.push({
        name: value.name,
        type: value.type,
        content: value.content
      });
    });
    return items;
  };

  var parseEmails = function(emails, type) {
    return _.map(emails, function(email) {
      return { email: email[0].toLowerCase(), type: type };
    });
  };

  var emails = [];

  events.forEach(function(event) {
    if (event.event == 'inbound') {

      var attachments = (event.msg.attachments) ? getAttachments(event.msg.attachments) : [];
      var images = (event.msg.images) ? getAttachments(event.msg.images) : [];

      var to = parseEmails(event.msg.to, 'to');
      var cc = parseEmails(event.msg.cc, 'cc');

      var emailData = {
        to: to.concat(cc),
        email: event.msg.email.toLowerCase(),
        fromEmail: event.msg.from_email.toLowerCase(),
        fromName: event.msg.from_name,
        subject: event.msg.subject,
        text: event.msg.text,
        html: event.msg.html,
        headers: event.msg.headers,
        attachments: attachments,
        images: images
      };
      emails.push(emailData);
    }
  });

  return callback(null, emails);

};
